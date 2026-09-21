package com.affin.hrm.controller;

import com.affin.hrm.dto.ApiResponse;
import com.affin.hrm.dto.DepartmentDTO;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.Department;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.CompanyRepository;
import com.affin.hrm.repository.DepartmentRepository;
import com.affin.hrm.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Sync controller — receives employee, company, and department data pushed from other backends.
 * This endpoint is intentionally unauthenticated for inter-service communication.
 * In production, secure this with an API key or service mesh.
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final EmployeeService employeeService;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;

    public SyncController(EmployeeService employeeService,
                          CompanyRepository companyRepository,
                          DepartmentRepository departmentRepository) {
        this.employeeService = employeeService;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
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

    @PostMapping("/department")
    public ResponseEntity<ApiResponse<String>> syncDepartment(@RequestBody DepartmentDTO dto,
                                                              @RequestParam(required = false) String companyRegNumber,
                                                              @RequestParam(required = false) String companyName) {
        log.info("Received sync request for department: {}", dto.getName());
        Company company = null;
        if (companyRegNumber != null) {
            company = companyRepository.findByRegistrationNumber(companyRegNumber).orElse(null);
        }
        if (company == null && companyName != null) {
            company = companyRepository.findByCompanyName(companyName).orElse(null);
        }
        if (company == null && dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId()).orElse(null);
        }
        if (company == null) {
            company = companyRepository.findAll().stream().findFirst().orElse(null);
        }
        if (company == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company not found for department sync"));
        }

        Department department = departmentRepository.findByCompanyIdAndName(company.getId(), dto.getName().trim())
                .orElse(new Department());
        department.setName(dto.getName().trim());
        department.setShortCode(dto.getShortCode() != null ? dto.getShortCode().trim().toUpperCase() : null);
        department.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        department.setActive(dto.getActive() != null ? dto.getActive() : true);
        department.setCompany(company);

        Department saved = departmentRepository.save(department);
        log.info("Department synced successfully: {} (ID: {}, Company: {})", saved.getName(), saved.getId(), company.getCompanyName());
        return ResponseEntity.ok(ApiResponse.success("Department synced: " + saved.getName(),
                "Sync completed successfully"));
    }
}
