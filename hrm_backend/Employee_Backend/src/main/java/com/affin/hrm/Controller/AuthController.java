package com.affin.hrm.controller;

import com.affin.hrm.dto.ApiResponse;
import com.affin.hrm.dto.AuthRequest;
import com.affin.hrm.dto.AuthResponse;
import com.affin.hrm.dto.RegisterRequest;
import com.affin.hrm.model.Employee;
import com.affin.hrm.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller — login, register, check-user.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        Employee employee = authService.register(request);
        AuthResponse response = new AuthResponse();
        response.setId(employee.getId());
        response.setEmail(employee.getEmail());
        response.setFullName(employee.getFullName());
        response.setRole(employee.getRole().name());
        response.setCompanyId(employee.getCompany() != null ? employee.getCompany().getId() : null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    @GetMapping("/check-user/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkUserExists(@PathVariable String email) {
        boolean exists = authService.checkUserExists(email);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        Employee employee = authService.getCurrentEmployee();
        AuthResponse response = new AuthResponse();
        response.setId(employee.getId());
        response.setEmail(employee.getEmail());
        response.setFullName(employee.getFullName());
        response.setRole(employee.getRole().name());
        response.setCompanyId(employee.getCompany() != null ? employee.getCompany().getId() : null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
