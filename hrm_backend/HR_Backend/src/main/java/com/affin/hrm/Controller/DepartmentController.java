package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.model.*;
import com.affin.hrm.repository.*;
import com.affin.hrm.service.AuthService;
import com.affin.hrm.service.AuditService;
import com.affin.hrm.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/departments")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class DepartmentController {

    private static final Logger log = LoggerFactory.getLogger(DepartmentController.class);

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final AuthService authService;
    private final AuditService auditService;
    private final RestTemplate restTemplate;

    @Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    public DepartmentController(DepartmentRepository departmentRepository,
                                EmployeeRepository employeeRepository,
                                CompanyRepository companyRepository,
                                AuthService authService,
                                AuditService auditService,
                                RestTemplate restTemplate) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.authService = authService;
        this.auditService = auditService;
        this.restTemplate = restTemplate;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getCompanyDepartments() {
        Employee hr = authService.getCurrentEmployee();
        Long companyId = hr.getCompany().getId();
        List<DepartmentDTO> dtos = departmentRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(@RequestBody DepartmentDTO dto) {
        Employee hr = authService.getCurrentEmployee();
        Company company = hr.getCompany();

        Department department = new Department();
        department.setName(dto.getName() != null ? dto.getName().trim() : "");
        department.setShortCode(dto.getShortCode() != null ? dto.getShortCode().trim().toUpperCase() : null);
        department.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : null);
        department.setCompany(company);
        department.setActive(true);

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getManagerId()));
            department.setManager(manager);
        }

        if (dto.getJobRoles() != null && !dto.getJobRoles().isEmpty()) {
            for (JobRoleDTO roleDto : dto.getJobRoles()) {
                if (roleDto.getJobTitle() != null && !roleDto.getJobTitle().trim().isEmpty()) {
                    JobRole role = new JobRole();
                    role.setJobTitle(roleDto.getJobTitle().trim());
                    role.setBasicSalary(roleDto.getBasicSalary() != null ? roleDto.getBasicSalary() : 0.0);
                    department.addJobRole(role);
                }
            }
        }

        Department saved = departmentRepository.save(department);

        try {
            auditService.logAction("CREATE", "Department", saved.getId(), "Created department: " + saved.getName(), company.getId());
        } catch (Exception ignored) {}

        syncDepartmentToEmployeeService(saved);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(convertToDTO(saved), "Department created successfully"));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO dto) {
        Employee hr = authService.getCurrentEmployee();
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCompany().getId().equals(hr.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (dto.getName() != null) department.setName(dto.getName().trim());
        if (dto.getShortCode() != null) department.setShortCode(dto.getShortCode().trim().toUpperCase());
        if (dto.getDescription() != null) department.setDescription(dto.getDescription().trim());
        if (dto.getActive() != null) department.setActive(dto.getActive());

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getManagerId()));
            department.setManager(manager);
        } else if (dto.getManagerId() == null && dto.getManagerName() == null) {
            department.setManager(null);
        }

        if (dto.getJobRoles() != null) {
            department.getJobRoles().clear();
            for (JobRoleDTO roleDto : dto.getJobRoles()) {
                if (roleDto.getJobTitle() != null && !roleDto.getJobTitle().trim().isEmpty()) {
                    JobRole role = new JobRole();
                    role.setJobTitle(roleDto.getJobTitle().trim());
                    role.setBasicSalary(roleDto.getBasicSalary() != null ? roleDto.getBasicSalary() : 0.0);
                    department.addJobRole(role);
                }
            }
        }

        Department saved = departmentRepository.save(department);

        try {
            auditService.logAction("UPDATE", "Department", saved.getId(), "Updated department: " + saved.getName(), hr.getCompany().getId());
        } catch (Exception ignored) {}

        syncDepartmentToEmployeeService(saved);

        return ResponseEntity.ok(ApiResponse.success(convertToDTO(saved), "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        Employee hr = authService.getCurrentEmployee();
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCompany().getId().equals(hr.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        department.setActive(false);
        Department saved = departmentRepository.save(department);

        try {
            auditService.logAction("DEACTIVATE", "Department", department.getId(), "Deactivated department: " + department.getName(), hr.getCompany().getId());
        } catch (Exception ignored) {}

        syncDepartmentToEmployeeService(saved);

        return ResponseEntity.ok(ApiResponse.success(null, "Department deactivated successfully"));
    }

    @PutMapping("/{id}/manager")
    @Transactional
    public ResponseEntity<ApiResponse<DepartmentDTO>> assignManager(@PathVariable Long id, @RequestParam Long managerId) {
        Employee hr = authService.getCurrentEmployee();
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCompany().getId().equals(hr.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", managerId));

        department.setManager(manager);
        Department saved = departmentRepository.save(department);
        syncDepartmentToEmployeeService(saved);
        return ResponseEntity.ok(ApiResponse.success(convertToDTO(saved), "Manager assigned successfully"));
    }

    private void syncDepartmentToEmployeeService(Department department) {
        try {
            String url = employeeServiceUrl + "/api/sync/department";
            DepartmentDTO syncDto = convertToDTO(department);
            String regNum = department.getCompany() != null ? department.getCompany().getRegistrationNumber() : null;
            String compName = department.getCompany() != null ? department.getCompany().getCompanyName() : null;

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
            if (regNum != null) builder.queryParam("companyRegNumber", regNum);
            if (compName != null) builder.queryParam("companyName", compName);

            restTemplate.postForObject(builder.toUriString(), syncDto, Object.class);
            log.info("Successfully synced department '{}' to Employee service", department.getName());
        } catch (Exception e) {
            log.warn("Failed to sync department '{}' to Employee service: {}", department.getName(), e.getMessage());
        }
    }

    private DepartmentDTO convertToDTO(Department dept) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setShortCode(dept.getShortCode());
        dto.setDescription(dept.getDescription());
        dto.setCompanyId(dept.getCompany() != null ? dept.getCompany().getId() : null);
        dto.setActive(dept.getActive());
        if (dept.getManager() != null) {
            dto.setManagerId(dept.getManager().getId());
            dto.setManagerName(dept.getManager().getFullName());
        }

        long count = employeeRepository.countByDepartmentId(dept.getId());
        dto.setEmployeeCount((int) count);

        if (dept.getJobRoles() != null) {
            dto.setJobRoleCount(dept.getJobRoles().size());
            dto.setJobRoles(dept.getJobRoles().stream().map(r -> {
                JobRoleDTO roleDto = new JobRoleDTO();
                roleDto.setId(r.getId());
                roleDto.setJobTitle(r.getJobTitle());
                roleDto.setBasicSalary(r.getBasicSalary());
                return roleDto;
            }).collect(Collectors.toList()));
        } else {
            dto.setJobRoleCount(0);
            dto.setJobRoles(new ArrayList<>());
        }
        return dto;
    }
}
