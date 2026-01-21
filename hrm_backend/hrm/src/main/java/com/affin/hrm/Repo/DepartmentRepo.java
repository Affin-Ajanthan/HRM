package com.affin.hrm.Repo;

import com.affin.hrm.Model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, Long> {
    List<Department> findByCompanyId(Long companyId);
    List<Department> findByCompanyIdAndActive(Long companyId, Boolean active);
    Optional<Department> findByCompanyIdAndName(Long companyId, String name);
}
