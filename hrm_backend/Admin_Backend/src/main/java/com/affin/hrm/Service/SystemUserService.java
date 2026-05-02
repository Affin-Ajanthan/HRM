package com.affin.hrm.Service;

import com.affin.hrm.DTO.SystemUserDTO;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.EmployeeRepo;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class SystemUserService {
    private final EmployeeRepo employeeRepo;

    public SystemUserService(EmployeeRepo employeeRepo) {
        this.employeeRepo = employeeRepo;
    }

    public List<SystemUserDTO> getSystemUsers() {
        return employeeRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SystemUserDTO toDto(Employee employee) {
        String companyName = employee.getCompany() != null ? employee.getCompany().getCompanyName() : "System";
        LocalDate joinedOn = employee.getCreatedAt() != null ? employee.getCreatedAt().toLocalDate() : null;
        return new SystemUserDTO(
                employee.getId(),
                employee.getFullName(),
                employee.getEmail(),
                prettyRole(employee.getRole().name()),
                companyName,
                prettyStatus(employee.getStatus().name()),
                joinedOn
        );
    }

    private String prettyRole(String role) {
        if ("HR_MANAGER".equalsIgnoreCase(role)) {
            return "HR Manager";
        }
        if ("ADMIN".equalsIgnoreCase(role)) {
            return "Admin";
        }
        return "Employee";
    }

    private String prettyStatus(String status) {
        if ("INACTIVE".equalsIgnoreCase(status)) {
            return "Inactive";
        }
        if ("TERMINATED".equalsIgnoreCase(status)) {
            return "Terminated";
        }
        return "Active";
    }
}

