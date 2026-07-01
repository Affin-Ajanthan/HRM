package com.affin.hrm.service;

import com.affin.hrm.dto.LeaveApplicationDTO;
import com.affin.hrm.dto.LeaveBalanceDTO;
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
import java.util.List;
import java.util.Optional;
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
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;
    private final AuditService auditService;

    public LeaveService(LeaveApplicationRepository leaveApplicationRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        LeaveTypeRepository leaveTypeRepository,
                        EmployeeRepository employeeRepository,
                        NotificationRepository notificationRepository,
                        ModelMapper modelMapper,
                        AuditService auditService) {
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
        this.notificationRepository = notificationRepository;
        this.modelMapper = modelMapper;
        this.auditService = auditService;
    }

    public LeaveApplicationDTO applyLeave(LeaveApplicationDTO dto, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", dto.getLeaveTypeId()));

        int numberOfDays = calculateWorkingDays(dto.getStartDate(), dto.getEndDate());

        List<LeaveApplication> overlapping = leaveApplicationRepository.findOverlappingLeaves(
                employeeId, dto.getStartDate(), dto.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new BusinessException("Leave request overlaps with existing approved leave");
        }

        int currentYear = LocalDate.now().getYear();
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(
                employeeId, dto.getLeaveTypeId(), currentYear);

        if (balanceOpt.isPresent()) {
            LeaveBalance balance = balanceOpt.get();
            if (balance.getRemainingDays() < numberOfDays) {
                throw new BusinessException("Insufficient leave balance. Available: " + balance.getRemainingDays() + " days");
            }
        } else {
            createLeaveBalance(employee, leaveType, currentYear);
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setEmployee(employee);
        leave.setLeaveType(leaveType);
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setNumberOfDays(numberOfDays);
        leave.setReason(dto.getReason());
        leave.setStatus(LeaveApplication.LeaveStatus.PENDING);

        LeaveApplication saved = leaveApplicationRepository.save(leave);
        createNotification(employee.getCompany(), null, "New Leave Request",
                employee.getFullName() + " has applied for " + leaveType.getName(),
                Notification.NotificationType.LEAVE_APPROVAL);
        auditService.logAction("APPLY_LEAVE", "LeaveApplication", saved.getId(),
                "Applied for leave", employee.getCompany().getId());
        log.info("Employee {} applied for {} leave ({} days)", employeeId, leaveType.getName(), numberOfDays);
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
                leave.getEmployee().getId(), leave.getLeaveType().getId(), currentYear)
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
        return leaveApplicationRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveApplicationDTO> getPendingLeaves(Long companyId) {
        return leaveApplicationRepository.findByCompanyIdAndStatus(companyId, LeaveApplication.LeaveStatus.PENDING).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceDTO> getEmployeeLeaveBalances(Long employeeId) {
        int currentYear = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);

        if (balances.isEmpty()) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
            initializeLeaveBalances(employee, currentYear);
            balances = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, currentYear);
        }

        return balances.stream().map(this::convertBalanceToDTO).collect(Collectors.toList());
    }

    // ── Private helpers ──────────────────────────────────────────

    private void initializeLeaveBalances(Employee employee, int year) {
        List<LeaveType> leaveTypes = leaveTypeRepository.findByActive(true);
        for (LeaveType leaveType : leaveTypes) {
            createLeaveBalance(employee, leaveType, year);
        }
    }

    private void createLeaveBalance(Employee employee, LeaveType leaveType, int year) {
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(employee);
        balance.setLeaveType(leaveType);
        balance.setYear(year);
        balance.setTotalDays(leaveType.getDefaultDaysPerYear());
        balance.setUsedDays(0);
        balance.setRemainingDays(leaveType.getDefaultDaysPerYear());
        leaveBalanceRepository.save(balance);
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
        if (leave.getLeaveType() != null) {
            dto.setLeaveTypeId(leave.getLeaveType().getId());
            dto.setLeaveTypeName(leave.getLeaveType().getName());
        }
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
        if (balance.getLeaveType() != null) {
            dto.setLeaveTypeId(balance.getLeaveType().getId());
            dto.setLeaveTypeName(balance.getLeaveType().getName());
        }
        return dto;
    }
}
