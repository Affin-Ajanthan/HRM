package com.affin.hrm.Service;

import com.affin.hrm.DTO.CompanySummaryDTO;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {
    private final CompanyRepo companyRepo;
    private final EmployeeRepo employeeRepo;

    public CompanyService(CompanyRepo companyRepo, EmployeeRepo employeeRepo) {
        this.companyRepo = companyRepo;
        this.employeeRepo = employeeRepo;
    }

    public List<CompanySummaryDTO> getCompanies() {
        return companyRepo.findAll().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private CompanySummaryDTO toSummary(Company company) {
        Integer employees = Math.toIntExact(employeeRepo.countByCompanyId(company.getId()));
        LocalDate submittedOn = company.getCreatedAt() != null ? company.getCreatedAt().toLocalDate() : null;
        return new CompanySummaryDTO(
                company.getId(),
                company.getCompanyName(),
                "",
                company.getEmail(),
                company.getPhone(),
                employees,
                company.getAddress(),
                submittedOn,
                company.getStatus().name()
        );
    }
}

