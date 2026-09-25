package com.affin.hrm.service;

import com.affin.hrm.dto.LeaveApplicationDTO;
import com.affin.hrm.dto.LeaveBalanceDTO;
import com.affin.hrm.dto.LeaveEntitlementDTO;
import com.affin.hrm.dto.LeaveTypeDTO;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.*;
import com.affin.hrm.repository.*;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Leave service — handles leave applications, approvals, balances.
 */
@Service
@Transactional
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final HrServiceClient hrServiceClient;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;
    private final AuditService auditService;

    public LeaveService(LeaveApplicationRepository leaveApplicationRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        HrServiceClient hrServiceClient,
                        EmployeeRepository employeeRepository,
                        NotificationRepository notificationRepository,
                        ModelMapper modelMapper,
                        AuditService auditService) {
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.hrServiceClient = hrServiceClient;
        this.employeeRepository = employeeRepository;
        this.notificationRepository = notificationRepository;
        this.modelMapper = modelMapper;
        this.auditService = auditService;
    }

    public LeaveApplicationDTO applyLeave(LeaveApplicationDTO dto, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        LeaveEntitlementDTO leaveType = hrServiceClient.getLeaveEntitlements(employee.getEmail()).stream()
                .filter(t -> t.getLeaveTypeId().equals(dto.getLeaveTypeId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("This leave type has not been assigned to your job role"));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }
        int numberOfDays = calculateWorkingDays(dto.getStartDate(), dto.getEndDate());
        if (numberOfDays == 0) {
            throw new BusinessException("The selected dates fall on a weekend, so there are no working days to take as leave");
        }

        List<LeaveApplication> overlapping = leaveApplicationRepository.findOverlappingLeaves(
                employeeId, dto.getStartDate(), dto.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new BusinessException("You already have a pending or approved leave on these dates");
        }

        int currentYear = LocalDate.now().getYear();
        LeaveBalance balance = currentBalance(employee, leaveType, currentYear);

        // Days already requested but not yet approved are reserved against the balance too
        int available = balance.getRemainingDays()
                - leaveApplicationRepository.sumPendingDays(employeeId, leaveType.getLeaveTypeId(), currentYear);
        if (available < numberOfDays) {
            throw new BusinessException("Insufficient " + leaveType.getLeaveTypeName() + " balance. Available: "
                    + Math.max(available, 0) + " day(s), requested: " + numberOfDays);
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setEmployee(employee);
        leave.setLeaveTypeId(leaveType.getLeaveTypeId());
        leave.setLeaveTypeName(leaveType.getLeaveTypeName());
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setNumberOfDays(numberOfDays);
        leave.setReason(dto.getReason());
        leave.setStatus(LeaveApplication.LeaveStatus.PENDING);

        LeaveApplication saved = leaveApplicationRepository.save(leave);
        createNotification(employee.getCompany(), null, "New Leave Request",
                employee.getFullName() + " has applied for " + leaveType.getLeaveTypeName(),
                Notification.NotificationType.LEAVE_APPROVAL);
        auditService.logAction("APPLY_LEAVE", "LeaveApplication", saved.getId(),
                "Applied for leave", employee.getCompany().getId());
        log.info("Employee {} applied for {} leave ({} days)", employeeId, leaveType.getLeaveTypeName(), numberOfDays);
        return convertToDTO(saved);
    }

    public LeaveApplicationDTO approveLeave(Long leaveId, Long approverId) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", leaveId));
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));

        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING) {
            throw new BusinessException("Leave application is not in pending status");
        }

        leave.setStatus(LeaveApplication.LeaveStatus.APPROVED);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());

        int currentYear = LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                leave.getEmployee().getId(), leave.getLeaveTypeId(), currentYear)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveBalance not found"));

        balance.setUsedDays(balance.getUsedDays() + leave.getNumberOfDays());
        balance.setRemainingDays(balance.getTotalDays() - balance.getUsedDays());
        leaveBalanceRepository.save(balance);

        LeaveApplication saved = leaveApplicationRepository.save(leave);
        createNotification(leave.getEmployee().getCompany(), leave.getEmployee(),
                "Leave Approved", "Your leave from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been approved",
                Notification.NotificationType.LEAVE_APPROVAL);
        auditService.logAction("APPROVE_LEAVE", "LeaveApplication", saved.getId(),
                "Approved leave application", leave.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public LeaveApplicationDTO rejectLeave(Long leaveId, String reason, Long approverId) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", leaveId));
        Employee approver = employeeRepository.findById(approverId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", approverId));

        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING) {
            throw new BusinessException("Leave application is not in pending status");
        }

        leave.setStatus(LeaveApplication.LeaveStatus.REJECTED);
        leave.setRejectionReason(reason);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());

        LeaveApplication saved = leaveApplicationRepository.save(leave);
        createNotification(leave.getEmployee().getCompany(), leave.getEmployee(),
                "Leave Rejected", "Your leave request has been rejected. Reason: " + reason,
                Notification.NotificationType.LEAVE_REJECTION);
        auditService.logAction("REJECT_LEAVE", "LeaveApplication", saved.getId(),
                "Rejected leave application", leave.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public void cancelLeave(Long leaveId, Long employeeId) {
        LeaveApplication leave = leaveApplicationRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveApplication", "id", leaveId));
        if (!leave.getEmployee().getId().equals(employeeId)) {
            throw new BusinessException("Unauthorized to cancel this leave");
        }
        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING) {
            throw new BusinessException("Only pending leave can be cancelled");
        }
        leave.setStatus(LeaveApplication.LeaveStatus.CANCELLED);
        leaveApplicationRepository.save(leave);
        auditService.logAction("CANCEL_LEAVE", "LeaveApplication", leave.getId(),
                "Cancelled leave application", leave.getEmployee().getCompany().getId());
    }

    @Transactional(readOnly = true)
    public List<LeaveApplicationDTO> getEmployeeLeaves(Long employeeId) {
        return leaveApplicationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    /** Leave types the employee can apply for — the ones HR has assigned to their job role (hrm_db_hr). */
    @Transactional(readOnly = true)
    public List<LeaveTypeDTO> getLeaveTypes(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return hrServiceClient.getLeaveEntitlements(employee.getEmail()).stream()
                .map(e -> new LeaveTypeDTO(e.getLeaveTypeId(), e.getLeaveTypeName(), null, e.getDaysPerYear(), false, 0, true))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveApplicationDTO> getPendingLeaves(Long companyId) {
        return leaveApplicationRepository.findByCompanyIdAndStatus(companyId, LeaveApplication.LeaveStatus.PENDING).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * This year's balance for every leave type assigned to the employee's job role. Totals follow HR's
     * current assignment, so a change on the HR side shows up here for everyone in that job role.
     * Balances of leave types no longer assigned are kept (with their used days) but not shown.
     */
    public List<LeaveBalanceDTO> getEmployeeLeaveBalances(Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        return hrServiceClient.getLeaveEntitlements(employee.getEmail()).stream()
                .map(entitlement -> currentBalance(employee, entitlement, currentYear))
                .sorted(Comparator.comparing(LeaveBalance::getLeaveTypeId))
                .map(this::convertBalanceToDTO)
                .collect(Collectors.toList());
    }

    // ── Private helpers ──────────────────────────────────────────

    /** The employee's balance for the year, created if missing, with its total set to HR's current assignment. */
    private LeaveBalance currentBalance(Employee employee, LeaveEntitlementDTO entitlement, int year) {
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), entitlement.getLeaveTypeId(), year)
                .orElseGet(() -> {
                    LeaveBalance b = new LeaveBalance();
                    b.setEmployee(employee);
                    b.setLeaveTypeId(entitlement.getLeaveTypeId());
                    b.setYear(year);
                    b.setUsedDays(0);
                    return b;
                });
        int total = entitlement.getDaysPerYear() != null ? entitlement.getDaysPerYear() : 0;
        balance.setLeaveTypeName(entitlement.getLeaveTypeName());
        balance.setTotalDays(total);
        balance.setRemainingDays(total - balance.getUsedDays());
        return leaveBalanceRepository.save(balance);
    }

    private int calculateWorkingDays(LocalDate startDate, LocalDate endDate) {
        int workingDays = 0;
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }

    private void createNotification(Company company, Employee employee, String title,
                                    String message, Notification.NotificationType type) {
        Notification notification = new Notification();
        notification.setCompany(company);
        notification.setEmployee(employee);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    private LeaveApplicationDTO convertToDTO(LeaveApplication leave) {
        LeaveApplicationDTO dto = modelMapper.map(leave, LeaveApplicationDTO.class);
        if (leave.getEmployee() != null) {
            dto.setEmployeeId(leave.getEmployee().getId());
            dto.setEmployeeName(leave.getEmployee().getFullName());
            dto.setEmployeeIdNumber(leave.getEmployee().getEmployeeId());
        }
        dto.setLeaveTypeId(leave.getLeaveTypeId());
        dto.setLeaveTypeName(leave.getLeaveTypeName());
        if (leave.getStatus() != null) dto.setStatus(leave.getStatus().name());
        if (leave.getApprovedBy() != null) {
            dto.setApprovedBy(leave.getApprovedBy().getId());
            dto.setApprovedByName(leave.getApprovedBy().getFullName());
        }
        return dto;
    }

    private LeaveBalanceDTO convertBalanceToDTO(LeaveBalance balance) {
        LeaveBalanceDTO dto = modelMapper.map(balance, LeaveBalanceDTO.class);
        if (balance.getEmployee() != null) {
            dto.setEmployeeId(balance.getEmployee().getId());
            dto.setEmployeeName(balance.getEmployee().getFullName());
        }
        dto.setLeaveTypeId(balance.getLeaveTypeId());
        dto.setLeaveTypeName(balance.getLeaveTypeName());
        return dto;
    }
}
