package com.affin.hrm.Controller;

import com.affin.hrm.DTO.*;
import com.affin.hrm.service.AuthService;
import com.affin.hrm.service.LeaveService;
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
    private LeaveService leaveService;

    @Autowired
    private AuthService authService;

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
}
