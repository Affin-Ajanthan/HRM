package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.model.*;
import com.affin.hrm.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class PayrollController {

    private static final Logger log = LoggerFactory.getLogger(PayrollController.class);

    private final RestTemplate restTemplate;
    private final AuthService authService;

    @Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    public PayrollController(RestTemplate restTemplate, AuthService authService) {
        this.restTemplate = restTemplate;
        this.authService = authService;
    }

    @GetMapping("/salaries")
    public ResponseEntity<ApiResponse<List<SalaryDTO>>> getCompanySalaries() {
        try {
            ResponseEntity<List<SalaryDTO>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/salaries",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<SalaryDTO>>() {});
            return ResponseEntity.ok(ApiResponse.success(response.getBody()));
        } catch (Exception e) {
            log.error("Failed to fetch salaries from Employee backend: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
    }

    @GetMapping("/salaries/employee/{id}")
    public ResponseEntity<ApiResponse<SalaryDTO>> getEmployeeSalary(@PathVariable Long id) {
        try {
            SalaryDTO salary = restTemplate.getForObject(
                    employeeServiceUrl + "/api/internal/salaries/employee/" + id, SalaryDTO.class);
            return ResponseEntity.ok(ApiResponse.success(salary));
        } catch (Exception e) {
            log.error("Failed to fetch salary for employee {} from Employee backend: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Salary structure not found"));
        }
    }

    @PostMapping("/salaries")
    public ResponseEntity<ApiResponse<SalaryDTO>> saveSalary(@RequestBody SalaryDTO dto) {
        try {
            HttpEntity<SalaryDTO> entity = new HttpEntity<>(dto);
            ResponseEntity<SalaryDTO> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/salaries",
                    HttpMethod.POST, entity, SalaryDTO.class);
            return ResponseEntity.ok(ApiResponse.success(response.getBody(), "Salary saved successfully"));
        } catch (Exception e) {
            log.error("Failed to save salary in Employee backend: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to save salary"));
        }
    }

    @PostMapping("/payroll/generate")
    public ResponseEntity<ApiResponse<String>> generatePayroll(@RequestParam Integer month, @RequestParam Integer year) {
        Employee hr = authService.getCurrentEmployee();
        Long companyId = hr.getCompany().getId();
        try {
            String url = employeeServiceUrl + "/api/internal/payroll/generate?companyId=" + companyId + "&month=" + month + "&year=" + year;
            restTemplate.postForObject(url, null, Object.class);
            return ResponseEntity.ok(ApiResponse.success(null, "Payroll generated successfully for month: " + month + "/" + year));
        } catch (Exception e) {
            log.error("Failed to generate payroll in Employee backend: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to generate payroll: " + e.getMessage()));
        }
    }
}
