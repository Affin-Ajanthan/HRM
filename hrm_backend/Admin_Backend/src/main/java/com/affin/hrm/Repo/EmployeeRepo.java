package com.affin.hrm.Repo;

import com.affin.hrm.Model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    long countByStatus(Employee.EmployeeStatus status);
    long countByCompanyId(Long companyId);
}

