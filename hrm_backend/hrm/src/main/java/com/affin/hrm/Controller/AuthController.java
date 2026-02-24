package com.affin.hrm.Controller;

import com.affin.hrm.DTO.ApiResponse;
import com.affin.hrm.DTO.AuthRequest;
import com.affin.hrm.DTO.AuthResponse;
import com.affin.hrm.DTO.RegisterRequest;
import com.affin.hrm.DTO.RegisterResponse;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (Exception e) {
            // Log the full error for debugging
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.contains("Bad credentials")) {
                errorMsg = "Invalid email or password. Please check your credentials and try again.";
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(errorMsg));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser() {
        try {
            var employee = authService.getCurrentEmployee();
            return ResponseEntity.ok(ApiResponse.success(employee, "User details retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Employee employee = authService.register(request);

            RegisterResponse response = new RegisterResponse(
                    employee.getId(),
                    employee.getEmployeeId(),
                    employee.getFullName(),
                    employee.getEmail(),
                    employee.getRole() != null ? employee.getRole().name() : null,
                    employee.getGender() != null ? employee.getGender().name() : null,
                    employee.getDesignation(),
                    employee.getJoiningDate(),
                    employee.getCompany() != null ? employee.getCompany().getId() : null,
                    employee.getCompany() != null ? employee.getCompany().getCompanyName() : null,
                    employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                    employee.getDepartment() != null ? employee.getDepartment().getName() : null
            );

            return ResponseEntity.ok(ApiResponse.success(response, "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/check-user/{email}")
    public ResponseEntity<ApiResponse<?>> checkUserExists(@PathVariable String email) {
        try {
            boolean exists = authService.checkUserExists(email);
            return ResponseEntity.ok(ApiResponse.success(exists, exists ? "User exists" : "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error checking user: " + e.getMessage()));
        }
    }

    @GetMapping("/debug-user/{email}")
    public ResponseEntity<ApiResponse<?>> debugUser(@PathVariable String email) {
        try {
            Map<String, Object> info = new HashMap<>();
            info.put("normalizedEmail", email == null ? "" : email.trim().toLowerCase());
            info.put("existsInEmployees", authService.checkUserExists(email));
            info.put("existsInLegacyUsers", authService.checkLegacyUserExists(email));
            return ResponseEntity.ok(ApiResponse.success(info, "Debug info"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Debug failed: " + e.getMessage()));
        }
    }
}
