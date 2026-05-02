package com.affin.hrm.Controller;

import com.affin.hrm.DTO.*;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Service.AttendanceService;
import com.affin.hrm.Service.AuthService;
import com.affin.hrm.Service.LeaveService;
import com.affin.hrm.Service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('EMPLOYEE', 'HR_MANAGER', 'ADMIN')")
public class EmployeeController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private AuthService authService;

    @Autowired
    private EmployeeService employeeService;

    // ===== ATTENDANCE ENDPOINTS =====

    @PostMapping("/attendance/clock-in")
    public ResponseEntity<ApiResponse<AttendanceDTO>> clockIn() {
        try {
            var employee = authService.getCurrentEmployee();
            AttendanceDTO attendance = attendanceService.clockIn(employee.getId(), null);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Clocked in successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to clock in: " + e.getMessage()));
        }
    }

    @PostMapping("/attendance/clock-out")
    public ResponseEntity<ApiResponse<AttendanceDTO>> clockOut() {
        try {
            var employee = authService.getCurrentEmployee();
            AttendanceDTO attendance = attendanceService.clockOut(employee.getId(), null);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Clocked out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to clock out: " + e.getMessage()));
        }
    }

    @PostMapping("/attendance/clock-in-gps")
    public ResponseEntity<ApiResponse<AttendanceDTO>> clockInGPS(@RequestParam String latitude,
                                                                   @RequestParam String longitude) {
        try {
            var employee = authService.getCurrentEmployee();
            String location = latitude + "," + longitude;
            AttendanceDTO attendance = attendanceService.clockInGPS(employee.getId(), location);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Clocked in via GPS successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to clock in: " + e.getMessage()));
        }
    }

    @PostMapping("/attendance/clock-out-gps")
    public ResponseEntity<ApiResponse<AttendanceDTO>> clockOutGPS(@RequestParam String latitude,
                                                                    @RequestParam String longitude) {
        try {
            var employee = authService.getCurrentEmployee();
            String location = latitude + "," + longitude;
            AttendanceDTO attendance = attendanceService.clockOutGPS(employee.getId(), location);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Clocked out via GPS successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to clock out: " + e.getMessage()));
        }
    }

    @GetMapping("/attendance/today")
    public ResponseEntity<ApiResponse<AttendanceDTO>> getTodayAttendance() {
        try {
            var employee = authService.getCurrentEmployee();
            AttendanceDTO attendance = attendanceService.getTodayAttendance(employee.getId());
            return ResponseEntity.ok(ApiResponse.success(attendance, "Today's attendance retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve attendance: " + e.getMessage()));
        }
    }

    @GetMapping("/attendance/history")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceHistory(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        try {
            var employee = authService.getCurrentEmployee();
            LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(1);
            LocalDate end = endDate != null ? endDate : LocalDate.now();
            List<AttendanceDTO> attendances = attendanceService.getEmployeeAttendance(
                    employee.getId(), start, end);
            return ResponseEntity.ok(ApiResponse.success(attendances, "Attendance history retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve attendance: " + e.getMessage()));
        }
    }

    @PostMapping("/attendance/adjustment-request")
    public ResponseEntity<ApiResponse<AttendanceDTO>> requestAdjustment(
            @RequestParam Long attendanceId,
            @RequestParam String reason) {
        try {
            AttendanceDTO attendance = attendanceService.requestAdjustment(attendanceId, reason);
            return ResponseEntity.ok(ApiResponse.success(attendance, "Adjustment request submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to request adjustment: " + e.getMessage()));
        }
    }

    // ===== LEAVE ENDPOINTS =====

    @PostMapping("/leaves/apply")
    public ResponseEntity<ApiResponse<LeaveApplicationDTO>> applyLeave(
            @RequestBody LeaveApplicationDTO leaveDTO) {
        try {
            var employee = authService.getCurrentEmployee();
            LeaveApplicationDTO leave = leaveService.applyLeave(leaveDTO, employee.getId());
            return ResponseEntity.ok(ApiResponse.success(leave, "Leave application submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to apply leave: " + e.getMessage()));
        }
    }

    @GetMapping("/leaves/my-leaves")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDTO>>> getMyLeaves() {
        try {
            var employee = authService.getCurrentEmployee();
            List<LeaveApplicationDTO> leaves = leaveService.getEmployeeLeaves(employee.getId());
            return ResponseEntity.ok(ApiResponse.success(leaves, "Leave applications retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve leaves: " + e.getMessage()));
        }
    }

    @DeleteMapping("/leaves/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@PathVariable Long id) {
        try {
            var employee = authService.getCurrentEmployee();
            leaveService.cancelLeave(id, employee.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Leave cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to cancel leave: " + e.getMessage()));
        }
    }

    @GetMapping("/leaves/balance")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDTO>>> getLeaveBalance() {
        try {
            var employee = authService.getCurrentEmployee();
            List<LeaveBalanceDTO> balances = leaveService.getEmployeeLeaveBalances(employee.getId());
            return ResponseEntity.ok(ApiResponse.success(balances, "Leave balances retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve leave balance: " + e.getMessage()));
        }
    }

    // ===== PROFILE ENDPOINTS =====

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile() {
        try {
            var employee = authService.getCurrentEmployee();
            return ResponseEntity.ok(ApiResponse.success(employee, "Profile retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve profile: " + e.getMessage()));
        }
    }

    // ===== DASHBOARD ENDPOINTS =====

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

    // Note: Sync endpoint has been moved to SyncController for better separation of concerns
}
