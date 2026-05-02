package com.affin.hrm.Service;

import com.affin.hrm.DTO.AdminStatsDTO;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import org.springframework.stereotype.Service;

@Service
public class AdminStatsService {
    private final CompanyRepo companyRepo;
    private final EmployeeRepo employeeRepo;

    public AdminStatsService(CompanyRepo companyRepo, EmployeeRepo employeeRepo) {
        this.companyRepo = companyRepo;
        this.employeeRepo = employeeRepo;
    }

    public AdminStatsDTO getStats() {
        long totalCompanies = companyRepo.count();
        long pendingApprovals = companyRepo.countByStatus(Company.CompanyStatus.PENDING);
        long activeUsers = employeeRepo.countByStatus(Employee.EmployeeStatus.ACTIVE);
        String systemHealth = "Good";
        return new AdminStatsDTO(totalCompanies, pendingApprovals, activeUsers, systemHealth);
    }
}

