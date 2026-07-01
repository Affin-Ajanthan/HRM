package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.model.Employee;
import com.affin.hrm.service.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * HR Manager controller — employee management, attendance oversight, leave approvals.
 */
@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class HRController {

    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;
    private final LeaveService leaveService;
    private final AuthService authService;

    public HRController(EmployeeService employeeService,
                        AttendanceService attendanceService,
                        LeaveService leaveService,
                        AuthService authService) {
        this.employeeService = employeeService;
        this.attendanceService = attendanceService;
        this.leaveService = leaveService;
        this.authService = authService;
    }

    // ── Employee Management ──────────────────────────────────────

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getEmployees() {
        Employee hr = authService.getCurrentEmployee();
        List<EmployeeDTO> employees = employeeService.getAllEmployeesByCompany(hr.getCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployee(@PathVariable Long id) {
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(employee));
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(@Valid @RequestBody EmployeeDTO dto) {
        Employee hr = authService.getCurrentEmployee();
        EmployeeDTO created = employeeService.createEmployee(dto, hr.getCompany().getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Employee created successfully"));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDTO dto) {
        EmployeeDTO updated = employeeService.updateEmployee(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Employee updated successfully"));
    }

    @PostMapping("/employees/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateEmployee(@PathVariable Long id) {
        employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deactivated"));
    }

    @PostMapping("/employees/{id}/terminate")
    public ResponseEntity<ApiResponse<Void>> terminateEmployee(@PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate terminationDate) {
        employeeService.terminateEmployee(id, terminationDate);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee terminated"));
    }

    // ── Attendance Oversight ─────────────────────────────────────

    @GetMapping("/attendance/daily")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Employee hr = authService.getCurrentEmployee();
        if (date == null) date = LocalDate.now();
        List<AttendanceDTO> attendance = attendanceService.getDailyAttendance(hr.getCompany().getId(), date);
        return ResponseEntity.ok(ApiResponse.success(attendance));
    }

    @GetMapping("/attendance/adjustments")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getPendingAdjustments() {
        Employee hr = authService.getCurrentEmployee();
        List<AttendanceDTO> adjustments = attendanceService.getPendingAdjustments(hr.getCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(adjustments));
    }

    @PostMapping("/attendance/adjustments/{id}/approve")
    public ResponseEntity<ApiResponse<AttendanceDTO>> approveAdjustment(@PathVariable Long id) {
        AttendanceDTO result = attendanceService.approveAdjustment(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Adjustment approved"));
    }

    @PostMapping("/attendance/adjustments/{id}/reject")
    public ResponseEntity<ApiResponse<AttendanceDTO>> rejectAdjustment(@PathVariable Long id) {
        AttendanceDTO result = attendanceService.rejectAdjustment(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Adjustment rejected"));
    }

    // ── Leave Approvals ──────────────────────────────────────────

    @GetMapping("/leave/pending")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDTO>>> getPendingLeaves() {
        Employee hr = authService.getCurrentEmployee();
        List<LeaveApplicationDTO> leaves = leaveService.getPendingLeaves(hr.getCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @PostMapping("/leave/{leaveId}/approve")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> approveLeave(@PathVariable Long leaveId) {
        Employee hr = authService.getCurrentEmployee();
        LeaveApplicationDTO result = leaveService.approveLeave(leaveId, hr.getId());
        return ResponseEntity.ok(ApiResponse.success(result, "Leave approved"));
    }

    @PostMapping("/leave/{leaveId}/reject")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> rejectLeave(
            @PathVariable Long leaveId,
            @RequestParam String reason) {
        Employee hr = authService.getCurrentEmployee();
        LeaveApplicationDTO result = leaveService.rejectLeave(leaveId, reason, hr.getId());
        return ResponseEntity.ok(ApiResponse.success(result, "Leave rejected"));
    }
}
