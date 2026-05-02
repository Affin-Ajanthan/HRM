package com.affin.hrm.Repo;

import com.affin.hrm.Model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepo extends JpaRepository<Company, Long> {
    long countByStatus(Company.CompanyStatus status);
}

