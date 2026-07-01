package com.affin.hrm.controller;

import com.affin.hrm.dto.ApiResponse;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.CompanyRepository;
import com.affin.hrm.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Sync controller — receives employee and company data pushed from other backends.
 * This endpoint is intentionally unauthenticated for inter-service communication.
 * In production, secure this with an API key or service mesh.
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final EmployeeService employeeService;
    private final CompanyRepository companyRepository;

    public SyncController(EmployeeService employeeService, CompanyRepository companyRepository) {
        this.employeeService = employeeService;
        this.companyRepository = companyRepository;
    }

    @PostMapping("/employee")
    public ResponseEntity<ApiResponse<String>> syncEmployee(@RequestBody Employee employee) {
        log.info("Received sync request for employee: {}", employee.getEmail());
        Employee saved = employeeService.saveEmployee(employee);
        log.info("Employee synced successfully: {} (ID: {})", saved.getEmail(), saved.getId());
        return ResponseEntity.ok(ApiResponse.success("Employee synced: " + saved.getEmail(),
                "Sync completed successfully"));
    }

    @PostMapping("/company")
    public ResponseEntity<ApiResponse<String>> syncCompany(@RequestBody Company company) {
        log.info("Received sync request for company: {}", company.getCompanyName());
        Company existing = companyRepository.findByRegistrationNumber(company.getRegistrationNumber()).orElse(null);
        if (existing != null) {
            existing.setCompanyName(company.getCompanyName());
            existing.setEmail(company.getEmail());
            existing.setPhone(company.getPhone());
            existing.setAddress(company.getAddress());
            existing.setWebsite(company.getWebsite());
            existing.setStatus(company.getStatus());
            existing.setRejectionReason(company.getRejectionReason());
            companyRepository.save(existing);
            log.info("Company updated successfully: {}", company.getCompanyName());
        } else {
            companyRepository.save(company);
            log.info("Company created successfully: {}", company.getCompanyName());
        }
        return ResponseEntity.ok(ApiResponse.success("Company synced: " + company.getCompanyName(),
                "Sync completed successfully"));
    }
}
