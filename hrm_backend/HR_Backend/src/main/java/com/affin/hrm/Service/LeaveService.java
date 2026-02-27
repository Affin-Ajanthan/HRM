package com.affin.hrm.Service;

import com.affin.hrm.DTO.LeaveApplicationDTO;
import com.affin.hrm.DTO.LeaveBalanceDTO;
import com.affin.hrm.Model.*;
import com.affin.hrm.Repo.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveService {

    @Autowired private LeaveApplicationRepo leaveApplicationRepo;
    @Autowired private LeaveBalanceRepo leaveBalanceRepo;
    @Autowired private LeaveTypeRepo leaveTypeRepo;
    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private NotificationRepo notificationRepo;
    @Autowired private ModelMapper modelMapper;
    @Autowired private AuditService auditService;

    public LeaveApplicationDTO applyLeave(LeaveApplicationDTO dto, Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        LeaveType leaveType = leaveTypeRepo.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        int numberOfDays = calculateWorkingDays(dto.getStartDate(), dto.getEndDate());

        if (!leaveApplicationRepo.findOverlappingLeaves(employeeId, dto.getStartDate(), dto.getEndDate()).isEmpty())
            throw new RuntimeException("Leave request overlaps with existing approved leave");

        int year = LocalDate.now().getYear();
        Optional<LeaveBalance> balanceOpt = leaveBalanceRepo.findByEmployeeIdAndLeaveTypeIdAndYear(
                employeeId, dto.getLeaveTypeId(), year);

        if (balanceOpt.isPresent()) {
            if (balanceOpt.get().getRemainingDays() < numberOfDays)
                throw new RuntimeException("Insufficient leave balance. Available: " + balanceOpt.get().getRemainingDays());
        } else {
            createLeaveBalance(employee, leaveType, year);
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setEmployee(employee);
        leave.setLeaveType(leaveType);
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setNumberOfDays(numberOfDays);
        leave.setReason(dto.getReason());
        leave.setStatus(LeaveApplication.LeaveStatus.PENDING);

        LeaveApplication saved = leaveApplicationRepo.save(leave);
        createNotification(employee.getCompany(), null, "New Leave Request",
                employee.getFullName() + " applied for " + leaveType.getName(),
                Notification.NotificationType.LEAVE_APPROVAL);
        auditService.logAction("APPLY_LEAVE", "LeaveApplication", saved.getId(),
                "Applied for leave", employee.getCompany().getId());
        return convertToDTO(saved);
    }

    public LeaveApplicationDTO approveLeave(Long leaveId, Long approverId) {
        LeaveApplication leave = leaveApplicationRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));
        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING)
            throw new RuntimeException("Leave application is not pending");

        Employee approver = employeeRepo.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        leave.setStatus(LeaveApplication.LeaveStatus.APPROVED);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());

        int year = LocalDate.now().getYear();
        LeaveBalance balance = leaveBalanceRepo.findByEmployeeIdAndLeaveTypeIdAndYear(
                leave.getEmployee().getId(), leave.getLeaveType().getId(), year)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
        balance.setUsedDays(balance.getUsedDays() + leave.getNumberOfDays());
        balance.setRemainingDays(balance.getTotalDays() - balance.getUsedDays());
        leaveBalanceRepo.save(balance);

        LeaveApplication saved = leaveApplicationRepo.save(leave);
        createNotification(leave.getEmployee().getCompany(), leave.getEmployee(),
                "Leave Approved", "Your leave from " + leave.getStartDate() + " to " + leave.getEndDate() + " was approved",
                Notification.NotificationType.LEAVE_APPROVAL);
        auditService.logAction("APPROVE_LEAVE", "LeaveApplication", saved.getId(),
                "Approved leave", leave.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public LeaveApplicationDTO rejectLeave(Long leaveId, String reason, Long approverId) {
        LeaveApplication leave = leaveApplicationRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));
        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING)
            throw new RuntimeException("Leave application is not pending");

        Employee approver = employeeRepo.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        leave.setStatus(LeaveApplication.LeaveStatus.REJECTED);
        leave.setRejectionReason(reason);
        leave.setApprovedBy(approver);
        leave.setApprovedAt(LocalDateTime.now());

        LeaveApplication saved = leaveApplicationRepo.save(leave);
        createNotification(leave.getEmployee().getCompany(), leave.getEmployee(),
                "Leave Rejected", "Your leave was rejected. Reason: " + reason,
                Notification.NotificationType.LEAVE_REJECTION);
        auditService.logAction("REJECT_LEAVE", "LeaveApplication", saved.getId(),
                "Rejected leave", leave.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public void cancelLeave(Long leaveId, Long employeeId) {
        LeaveApplication leave = leaveApplicationRepo.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave application not found"));
        if (!leave.getEmployee().getId().equals(employeeId))
            throw new RuntimeException("Unauthorized to cancel this leave");
        if (leave.getStatus() != LeaveApplication.LeaveStatus.PENDING)
            throw new RuntimeException("Only pending leave can be cancelled");
        leave.setStatus(LeaveApplication.LeaveStatus.CANCELLED);
        leaveApplicationRepo.save(leave);
        auditService.logAction("CANCEL_LEAVE", "LeaveApplication", leave.getId(),
                "Cancelled leave", leave.getEmployee().getCompany().getId());
    }

    public List<LeaveApplicationDTO> getEmployeeLeaves(Long employeeId) {
        return leaveApplicationRepo.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<LeaveApplicationDTO> getPendingLeaves(Long companyId) {
        return leaveApplicationRepo.findByCompanyIdAndStatus(
                companyId, LeaveApplication.LeaveStatus.PENDING).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<LeaveBalanceDTO> getEmployeeLeaveBalances(Long employeeId) {
        int year = LocalDate.now().getYear();
        List<LeaveBalance> balances = leaveBalanceRepo.findByEmployeeIdAndYear(employeeId, year);
        if (balances.isEmpty()) {
            Employee employee = employeeRepo.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            initializeLeaveBalances(employee, year);
            balances = leaveBalanceRepo.findByEmployeeIdAndYear(employeeId, year);
        }
        return balances.stream().map(this::convertBalanceToDTO).collect(Collectors.toList());
    }

    private void initializeLeaveBalances(Employee employee, int year) {
        leaveTypeRepo.findByActive(true).forEach(lt -> createLeaveBalance(employee, lt, year));
    }

    private void createLeaveBalance(Employee employee, LeaveType leaveType, int year) {
        LeaveBalance balance = new LeaveBalance();
        balance.setEmployee(employee);
        balance.setLeaveType(leaveType);
        balance.setYear(year);
        balance.setTotalDays(leaveType.getDefaultDaysPerYear());
        balance.setUsedDays(0);
        balance.setRemainingDays(leaveType.getDefaultDaysPerYear());
        leaveBalanceRepo.save(balance);
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY && current.getDayOfWeek() != DayOfWeek.SUNDAY)
                days++;
            current = current.plusDays(1);
        }
        return days;
    }

    private void createNotification(Company company, Employee employee, String title,
                                    String message, Notification.NotificationType type) {
        Notification n = new Notification();
        n.setCompany(company);
        n.setEmployee(employee);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setIsRead(false);
        notificationRepo.save(n);
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
