package com.affin.hrm.Service;

import com.affin.hrm.DTO.DepartmentDTO;
import com.affin.hrm.DTO.JobRoleDTO;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Model.JobRole;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.DepartmentRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import com.affin.hrm.Repo.JobRoleRepo;
import com.affin.hrm.Service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private JobRoleRepo jobRoleRepo;
    @Autowired private CompanyRepo companyRepo;
    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private AuditService auditService;

    // ── DEPARTMENTS ──────────────────────────────────────────────────────────

    public List<DepartmentDTO> getAllDepartments(Long companyId) {
        return departmentRepo.findByCompanyId(companyId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DepartmentDTO> getActiveDepartments(Long companyId) {
        return departmentRepo.findByCompanyIdAndActive(companyId, true)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(Long id) {
        Department dept = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        return toDTO(dept);
    }

    public DepartmentDTO createDepartment(DepartmentDTO dto, Long companyId) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Department dept = new Department();
        dept.setName(dto.getName().trim());
        dept.setDescription(dto.getDescription());
        dept.setActive(true);
        dept.setCompany(company);

        if (dto.getManagerId() != null) {
            employeeRepo.findById(dto.getManagerId()).ifPresent(dept::setManager);
        }

        Department saved = departmentRepo.save(dept);
        auditService.logAction("CREATE_DEPARTMENT", "Department", saved.getId(),
                "Created department: " + saved.getName(), companyId);
        return toDTO(saved);
    }

    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));

        dept.setName(dto.getName().trim());
        dept.setDescription(dto.getDescription());
        if (dto.getActive() != null) dept.setActive(dto.getActive());

        if (dto.getManagerId() != null) {
            employeeRepo.findById(dto.getManagerId()).ifPresent(dept::setManager);
        } else {
            dept.setManager(null);
        }

        Department updated = departmentRepo.save(dept);
        auditService.logAction("UPDATE_DEPARTMENT", "Department", updated.getId(),
                "Updated department: " + updated.getName(), dept.getCompany().getId());
        return toDTO(updated);
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        dept.setActive(false);
        departmentRepo.save(dept);

        // Deactivate all job roles in this department
        jobRoleRepo.findByDepartmentId(id).forEach(jr -> {
            jr.setActive(false);
            jobRoleRepo.save(jr);
        });

        auditService.logAction("DELETE_DEPARTMENT", "Department", dept.getId(),
                "Deactivated department: " + dept.getName(), dept.getCompany().getId());
    }

    // ── JOB ROLES ────────────────────────────────────────────────────────────

    public List<JobRoleDTO> getJobRolesByDepartment(Long departmentId) {
        return jobRoleRepo.findByDepartmentId(departmentId)
                .stream().map(this::toRoleDTO).collect(Collectors.toList());
    }

    public List<JobRoleDTO> getActiveJobRolesByDepartment(Long departmentId) {
        return jobRoleRepo.findByDepartmentIdAndActive(departmentId, true)
                .stream().map(this::toRoleDTO).collect(Collectors.toList());
    }

    public JobRoleDTO createJobRole(Long departmentId, JobRoleDTO dto) {
        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + departmentId));

        JobRole role = new JobRole();
        role.setTitle(dto.getTitle().trim());
        role.setDescription(dto.getDescription());
        role.setMinSalary(dto.getMinSalary());
        role.setMaxSalary(dto.getMaxSalary());
        role.setActive(true);
        role.setDepartment(dept);

        return toRoleDTO(jobRoleRepo.save(role));
    }

    public JobRoleDTO updateJobRole(Long roleId, JobRoleDTO dto) {
        JobRole role = jobRoleRepo.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Job role not found: " + roleId));

        role.setTitle(dto.getTitle().trim());
        role.setDescription(dto.getDescription());
        role.setMinSalary(dto.getMinSalary());
        role.setMaxSalary(dto.getMaxSalary());
        if (dto.getActive() != null) role.setActive(dto.getActive());

        return toRoleDTO(jobRoleRepo.save(role));
    }

    public void deleteJobRole(Long roleId) {
        JobRole role = jobRoleRepo.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Job role not found: " + roleId));
        role.setActive(false);
        jobRoleRepo.save(role);
    }

    // ── CONVERTERS ───────────────────────────────────────────────────────────

    public DepartmentDTO toDTO(Department dept) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setDescription(dept.getDescription());
        dto.setActive(dept.getActive());
        if (dept.getCompany() != null) dto.setCompanyId(dept.getCompany().getId());
        if (dept.getManager() != null) {
            dto.setManagerId(dept.getManager().getId());
            dto.setManagerName(dept.getManager().getFullName());
        }
        return dto;
    }

    public JobRoleDTO toRoleDTO(JobRole role) {
        JobRoleDTO dto = new JobRoleDTO();
        dto.setId(role.getId());
        dto.setTitle(role.getTitle());
        dto.setDescription(role.getDescription());
        dto.setMinSalary(role.getMinSalary());
        dto.setMaxSalary(role.getMaxSalary());
        dto.setActive(role.getActive());
        if (role.getDepartment() != null) {
            dto.setDepartmentId(role.getDepartment().getId());
            dto.setDepartmentName(role.getDepartment().getName());
        }
        return dto;
    }
}