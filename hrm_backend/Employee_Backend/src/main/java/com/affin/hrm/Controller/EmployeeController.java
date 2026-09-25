package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.model.*;
import com.affin.hrm.service.*;
import com.affin.hrm.repository.NotificationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Employee self-service controller — profile, leave, payslip.
 */
@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final AuthService authService;
    private final PayrollService payrollService;
    private final NotificationRepository notificationRepository;
    private final HrServiceClient hrServiceClient;

    public EmployeeController(EmployeeService employeeService,
                              LeaveService leaveService,
                              AuthService authService,
                              PayrollService payrollService,
                              NotificationRepository notificationRepository,
                              HrServiceClient hrServiceClient) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.authService = authService;
        this.payrollService = payrollService;
        this.notificationRepository = notificationRepository;
        this.hrServiceClient = hrServiceClient;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getMyProfile() {
        Employee employee = authService.getCurrentEmployee();
        EmployeeDTO dto = employeeService.getEmployeeById(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateMyProfile(@Valid @RequestBody EmployeeDTO dto) {
        Employee employee = authService.getCurrentEmployee();
        EmployeeDTO updated = employeeService.updateEmployee(employee.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    // ── Leave Endpoints ───────────────────────────────────────────

    @GetMapping("/leave/types")
    public ResponseEntity<ApiResponse<List<LeaveTypeDTO>>> getLeaveTypes() {
        Employee employee = authService.getCurrentEmployee();
        return ResponseEntity.ok(ApiResponse.success(leaveService.getLeaveTypes(employee.getId())));
    }

    @PostMapping("/leave/apply")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> applyLeave(@Valid @RequestBody LeaveApplicationDTO dto) {
        Employee employee = authService.getCurrentEmployee();
        LeaveApplicationDTO result = leaveService.applyLeave(dto, employee.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "Leave application submitted"));
    }

    @GetMapping("/leave")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDTO>>> getMyLeaves() {
        Employee employee = authService.getCurrentEmployee();
        List<LeaveApplicationDTO> leaves = leaveService.getEmployeeLeaves(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @PostMapping("/leave/{leaveId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@PathVariable Long leaveId) {
        Employee employee = authService.getCurrentEmployee();
        leaveService.cancelLeave(leaveId, employee.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Leave cancelled successfully"));
    }

    @GetMapping("/leave/balance")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDTO>>> getMyLeaveBalance() {
        Employee employee = authService.getCurrentEmployee();
        List<LeaveBalanceDTO> balances = leaveService.getEmployeeLeaveBalances(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(balances));
    }

    // ── Payslip / Payroll Endpoints ──────────────────────────────

    /**
     * The logged-in employee's current salary as HR has set it: job role basic payment
     * (hrm_db_hr basic_payments) plus individual allowances / deductions (additional_payments).
     */
    @GetMapping("/pay-sheet")
    public ResponseEntity<ApiResponse<PaySheetDTO>> getMyPaySheet() {
        Employee employee = authService.getCurrentEmployee();
        return ResponseEntity.ok(ApiResponse.success(hrServiceClient.getPaySheet(employee.getEmail())));
    }

    @GetMapping("/payslips")
    public ResponseEntity<ApiResponse<List<PayslipDTO>>> getMyPayslips() {
        Employee employee = authService.getCurrentEmployee();
        List<PayslipDTO> payslips = payrollService.getEmployeePayslipDTOs(employee.getId());
        return ResponseEntity.ok(ApiResponse.success(payslips));
    }

    @GetMapping("/payslips/{id}")
    public ResponseEntity<ApiResponse<PayslipDTO>> getPayslipDetails(@PathVariable Long id) {
        Employee employee = authService.getCurrentEmployee();
        try {
            PayslipDTO actual = payrollService.getEmployeePayslipDTOs(employee.getId()).stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Payslip not found: " + id));
            return ResponseEntity.ok(ApiResponse.success(actual));
        } catch (Exception e) {
            // fallback
            PayslipDTO payslip = payrollService.getOrCreatePayslipDTO(employee.getId(), java.time.LocalDate.now().getMonthValue(), java.time.LocalDate.now().getYear());
            return ResponseEntity.ok(ApiResponse.success(payslip));
        }
    }

    // ── Notifications Endpoints ──────────────────────────────────

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        try {
            Employee employee = authService.getCurrentEmployee();
            List<Notification> notifications = notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
            return ResponseEntity.ok(ApiResponse.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }
}
