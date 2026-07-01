package com.affin.hrm.service;

import com.affin.hrm.dto.AuthRequest;
import com.affin.hrm.dto.AuthResponse;
import com.affin.hrm.dto.EmployeeDTO;
import com.affin.hrm.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Auth service for Admin_Backend — authenticates via Employee_Backend,
 * then verifies ADMIN role before issuing admin panel access.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final RestTemplate restTemplate;

    @Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    public AuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Admin login flow:
     * 1. Forward credentials to Employee_Backend for authentication
     * 2. Get the auth response (including JWT and role)
     * 3. Verify the user has ADMIN role
     * 4. Return the response (reuse Employee_Backend's JWT)
     */
    public AuthResponse login(AuthRequest request) {
        try {
            // Call Employee_Backend's login endpoint
            HttpEntity<AuthRequest> entity = new HttpEntity<>(request);
            ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                    employeeServiceUrl + "/api/auth/login", entity, AuthResponse.class);

            AuthResponse authResponse = response.getBody();
            if (authResponse == null) {
                throw new BusinessException("Authentication failed");
            }

            // Only ADMIN can access the admin panel
            if (!"ADMIN".equalsIgnoreCase(authResponse.getRole())) {
                throw new BusinessException("Access denied. Only administrators can access this service.");
            }

            log.info("Admin logged in: {}", authResponse.getEmail());
            return authResponse;

        } catch (HttpClientErrorException e) {
            log.warn("Admin login failed: {}", e.getMessage());
            throw new BusinessException("Invalid credentials");
        }
    }

    /**
     * Get current admin info by calling Employee_Backend's internal API.
     */
    public EmployeeDTO getCurrentAdmin(String email) {
        try {
            // Find the employee by listing all and filtering — since internal API
            // doesn't have a findByEmail endpoint, we use the admins list
            ResponseEntity<EmployeeDTO[]> response = restTemplate.getForEntity(
                    employeeServiceUrl + "/api/internal/employees/admins", EmployeeDTO[].class);
            EmployeeDTO[] admins = response.getBody();
            if (admins != null) {
                for (EmployeeDTO admin : admins) {
                    if (admin.getEmail() != null && admin.getEmail().equalsIgnoreCase(email)) {
                        return admin;
                    }
                }
            }
            throw new BusinessException("Admin not found: " + email);
        } catch (HttpClientErrorException e) {
            throw new BusinessException("Failed to get admin info: " + e.getMessage());
        }
    }
}
