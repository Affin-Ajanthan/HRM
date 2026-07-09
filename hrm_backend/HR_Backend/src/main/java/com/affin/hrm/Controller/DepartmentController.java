package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.model.*;
import com.affin.hrm.repository.*;
import com.affin.hrm.service.AuthService;
import com.affin.hrm.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/departments")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final AuthService authService;

    public DepartmentController(DepartmentRepository departmentRepository,
                                EmployeeRepository employeeRepository,
                                CompanyRepository companyRepository,
                                AuthService authService) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getCompanyDepartments() {
        Employee hr = authService.getCurrentEmployee();
        Long companyId = hr.getCompany().getId();
        List<DepartmentDTO> dtos = departmentRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(@RequestBody DepartmentDTO dto) {
        Employee hr = authService.getCurrentEmployee();
        Company company = hr.getCompany();

        Department department = new Department();
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        department.setCompany(company);
        department.setActive(true);

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getManagerId()));
            department.setManager(manager);
        }

        Department saved = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(convertToDTO(saved), "Department created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(@PathVariable Long id, @RequestBody DepartmentDTO dto) {
        Employee hr = authService.getCurrentEmployee();
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCompany().getId().equals(hr.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (dto.getName() != null) department.setName(dto.getName());
        if (dto.getDescription() != null) department.setDescription(dto.getDescription());
        if (dto.getActive() != null) department.setActive(dto.getActive());

        if (dto.getManagerId() != null) {
            Employee manager = employeeRepository.findById(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getManagerId()));
            department.setManager(manager);
        } else if (dto.getManagerId() == null && dto.getManagerName() == null) {
            department.setManager(null);
        }

        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success(convertToDTO(saved), "Department updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        Employee hr = authService.getCurrentEmployee();
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCompany().getId().equals(hr.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        department.setActive(false);
        departmentRepository.save(department);
        return ResponseEntity.ok(ApiResponse.success(null, "Department deactivated successfully"));
    }

    @PutMapping("/{id}/manager")
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
        return ResponseEntity.ok(ApiResponse.success(convertToDTO(saved), "Manager assigned successfully"));
    }

    private DepartmentDTO convertToDTO(Department dept) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setDescription(dept.getDescription());
        dto.setCompanyId(dept.getCompany().getId());
        dto.setActive(dept.getActive());
        if (dept.getManager() != null) {
            dto.setManagerId(dept.getManager().getId());
            dto.setManagerName(dept.getManager().getFullName());
        }
        if (dept.getEmployees() != null) {
            dto.setEmployeeCount(dept.getEmployees().size());
        } else {
            dto.setEmployeeCount(0);
        }
        return dto;
    }
}
