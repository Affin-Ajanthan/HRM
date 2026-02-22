package com.affin.hrm.Controller;

import com.affin.hrm.DTO.*;
import com.affin.hrm.Service.AttendanceService;
import com.affin.hrm.Service.AuthService;
import com.affin.hrm.Service.EmployeeService;
import com.affin.hrm.Service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
public class HRManagerController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private AuthService authService;

    // ===== EMPLOYEE MANAGEMENT =====

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllEmployees() {
        try {
            var currentUser = authService.getCurrentEmployee();
            List<EmployeeDTO> employees = employeeService.getAllEmployeesByCompany(
                    currentUser.getCompany().getId());
            return ResponseEntity.ok(ApiResponse.success(employees, "Employees retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve employees: " + e.getMessage()));
        }
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployee(@PathVariable Long id) {
        try {
            EmployeeDTO employee = employeeService.getEmployeeById(id);
            return ResponseEntity.ok(ApiResponse.success(employee, "Employee retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve employee: " + e.getMessage()));
        }
    }

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        try {
            var currentUser = authService.getCurrentEmployee();
            EmployeeDTO created = employeeService.createEmployee(employeeDTO, 
                    currentUser.getCompany().getId());
            return ResponseEntity.ok(ApiResponse.success(created, "Employee created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create employee: " + e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        try {
            EmployeeDTO updated = employeeService.updateEmployee(id, employeeDTO);
            return ResponseEntity.ok(ApiResponse.success(updated, "Employee updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update employee: " + e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateEmployee(@PathVariable Long id) {
        try {
            employeeService.deactivateEmployee(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Employee deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to deactivate employee: " + e.getMessage()));
        }
    }

    @PutMapping("/employees/{id}/terminate")
    public ResponseEntity<ApiResponse<Void>> terminateEmployee(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate terminationDate) {
        try {
            employeeService.terminateEmployee(id, terminationDate);
            return ResponseEntity.ok(ApiResponse.success(null, "Employee terminated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to terminate employee: " + e.getMessage()));
        }
    }

    // ===== ATTENDANCE MANAGEMENT =====

    @GetMapping("/attendance/daily")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            var currentUser = authService.getCurrentEmployee();
            List<AttendanceDTO> attendances = attendanceService.getDailyAttendance(
                    currentUser.getCompany().getId(), date);
            return ResponseEntity.ok(ApiResponse.success(attendances, "Daily attendance retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/attendance/employee/{id}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getEmployeeAttendance(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<AttendanceDTO> attendances = attendanceService.getEmployeeAttendance(id, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(attendances, "Employee attendance retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/attendance/adjustments")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getPendingAdjustments() {
        try {
            var currentUser = authService.getCurrentEmployee();
            List<AttendanceDTO> adjustments = attendanceService.getPendingAdjustments(
                    currentUser.getCompany().getId());
            return ResponseEntity.ok(ApiResponse.success(adjustments, "Pending adjustments retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve adjustments: " + e.getMessage()));
        }
    }

    @PutMapping("/attendance/adjustments/{id}/approve")
    public ResponseEntity<ApiResponse<AttendanceDTO>> approveAdjustment(@PathVariable Long id) {
        try {
            AttendanceDTO attendance = attendanceService.approveAdjustment(id);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Adjustment approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to approve adjustment: " + e.getMessage()));
        }
    }

    @PutMapping("/attendance/adjustments/{id}/reject")
    public ResponseEntity<ApiResponse<AttendanceDTO>> rejectAdjustment(@PathVariable Long id) {
        try {
            AttendanceDTO attendance = attendanceService.rejectAdjustment(id);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Adjustment rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to reject adjustment: " + e.getMessage()));
        }
    }

    // ===== LEAVE MANAGEMENT =====

    @GetMapping("/leaves/pending")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDTO>>> getPendingLeaves() {
        try {
            var currentUser = authService.getCurrentEmployee();
            List<LeaveApplicationDTO> leaves = leaveService.getPendingLeaves(
                    currentUser.getCompany().getId());
            return ResponseEntity.ok(ApiResponse.success(leaves, "Pending leaves retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve leaves: " + e.getMessage()));
        }
    }

    @PutMapping("/leaves/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> approveLeave(@PathVariable Long id) {
        try {
            var currentUser = authService.getCurrentEmployee();
            LeaveApplicationDTO leave = leaveService.approveLeave(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(leave, "Leave approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to approve leave: " + e.getMessage()));
        }
    }

    @PutMapping("/leaves/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> rejectLeave(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            var currentUser = authService.getCurrentEmployee();
            LeaveApplicationDTO leave = leaveService.rejectLeave(id, reason, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(leave, "Leave rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to reject leave: " + e.getMessage()));
        }
    }

    @GetMapping("/leaves/employee/{id}")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDTO>>> getEmployeeLeaves(@PathVariable Long id) {
        try {
            List<LeaveApplicationDTO> leaves = leaveService.getEmployeeLeaves(id);
            return ResponseEntity.ok(ApiResponse.success(leaves, "Employee leaves retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve leaves: " + e.getMessage()));
        }
    }

    @GetMapping("/leaves/balances")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDTO>>> getAllLeaveBalances() {
        try {
            return ResponseEntity.ok(ApiResponse.success(null, "Leave balances retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve balances: " + e.getMessage()));
        }
    }

    // ===== DASHBOARD =====

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        try {
            DashboardStatsDTO stats = new DashboardStatsDTO();
            return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard stats retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve stats: " + e.getMessage()));
        }
    }
}
