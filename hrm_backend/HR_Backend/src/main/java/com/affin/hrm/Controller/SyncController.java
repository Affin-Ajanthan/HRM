package com.affin.hrm.Controller;

import com.affin.hrm.DTO.ApiResponse;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Public Sync Controller - allows inter-microservice communication
 * Used by User_Backend to sync newly registered employees to HR_Backend
 * No authentication required for sync operations
 */
@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@PreAuthorize("permitAll()")
public class SyncController {

    @Autowired
    private EmployeeService employeeService;

    /**
     * Sync employee from User_Backend microservice to HR_Backend
     * Called when a new user registers or updates their profile
     *
     * @param employee Employee data from User_Backend
     * @return Synchronized employee data
     */
    @PostMapping("/employee")
    public ResponseEntity<ApiResponse<?>> syncEmployee(@RequestBody Employee employee) {
        try {
            if (employee == null || employee.getEmail() == null || employee.getEmail().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Employee email is required for sync"));
            }

            System.out.println("[SYNC Controller] Syncing employee from User_Backend: " + employee.getEmail());
            
            // Note: HR_Backend can use this endpoint to receive sync notifications
            // For now, we just log it. Implement actual sync logic if needed.
            System.out.println("[SYNC Controller] Employee sync acknowledged: " + employee.getEmail());
            return ResponseEntity.ok(ApiResponse.success(employee, "Employee sync acknowledged"));
        } catch (Exception e) {
            System.err.println("[SYNC ERROR] Failed to sync employee: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to sync employee: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint for sync service
     * @return Status message
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<?>> syncHealth() {
        return ResponseEntity.ok(ApiResponse.success("OK", "Sync service is healthy"));
    }
}
