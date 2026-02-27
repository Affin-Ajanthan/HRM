package com.affin.hrm.Service;

import com.affin.hrm.DTO.DashboardStatsDTO;
import com.affin.hrm.DTO.DepartmentDTO;
import com.affin.hrm.DTO.EmployeeDTO;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private CompanyRepo companyRepo;
    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private LeaveApplicationRepo leaveApplicationRepo;
    @Autowired private AttendanceRepo attendanceRepo;
    @Autowired private PayslipRepo payslipRepo;
    @Autowired private ModelMapper modelMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuditService auditService;

    // ─── EMPLOYEES ────────────────────────────────────────────────────────────

    public List<EmployeeDTO> getAllEmployeesByCompany(Long companyId) {
        return employeeRepo.findByCompanyId(companyId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<EmployeeDTO> getActiveEmployeesByCompany(Long companyId) {
        return employeeRepo.findByCompanyIdAndStatus(companyId, Employee.EmployeeStatus.ACTIVE).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        return convertToDTO(employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id)));
    }

    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO, Long companyId) {
        String normalizedEmail = employeeDTO.getEmail() == null
                ? "" : employeeDTO.getEmail().trim().toLowerCase();

        if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent())
            throw new RuntimeException("Employee with email " + normalizedEmail + " already exists");

        if (employeeRepo.findByEmployeeId(employeeDTO.getEmployeeId()).isPresent())
            throw new RuntimeException("Employee ID " + employeeDTO.getEmployeeId() + " already exists");

        Employee employee = new Employee();
        employee.setEmployeeId(employeeDTO.getEmployeeId());
        employee.setFullName(employeeDTO.getFullName());
        employee.setEmail(normalizedEmail);
        employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));
        employee.setNic(employeeDTO.getNic());
        employee.setDob(employeeDTO.getDob());
        employee.setAddress(employeeDTO.getAddress());
        employee.setPhone(employeeDTO.getPhone());

        if (employeeDTO.getGender() != null && !employeeDTO.getGender().isBlank())
            employee.setGender(Employee.Gender.valueOf(employeeDTO.getGender()));

        employee.setRole(employeeDTO.getRole() != null
                ? Employee.Role.valueOf(employeeDTO.getRole()) : Employee.Role.EMPLOYEE);

        employee.setDesignation(employeeDTO.getDesignation());
        employee.setJoiningDate(employeeDTO.getJoiningDate() != null
                ? employeeDTO.getJoiningDate() : LocalDate.now());
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);

        // Employment type
        if (employeeDTO.getEmploymentType() != null && !employeeDTO.getEmploymentType().isBlank()) {
            try {
                employee.setEmploymentType(Employee.EmploymentType.valueOf(employeeDTO.getEmploymentType()));
            } catch (IllegalArgumentException ignored) {}
        }

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        if (company == null) {
            // should never happen because of orElseThrow, but guard anyway
            throw new RuntimeException("Unable to associate employee with company");
        }
        employee.setCompany(company);

        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepo.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + employeeDTO.getDepartmentId()));
            employee.setDepartment(department);
        } else {
            // Store free-text department name if no department entity is linked
            String deptName = employeeDTO.getDepartmentName();
            if (deptName != null && !deptName.isBlank()) {
                employee.setDepartmentName(deptName);
            }
        }

        Employee saved = employeeRepo.save(employee);
        auditService.logAction("CREATE_EMPLOYEE", "Employee", saved.getId(),
                "Created employee: " + saved.getFullName(), companyId);
        return convertToDTO(saved);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setFullName(employeeDTO.getFullName());
        employee.setNic(employeeDTO.getNic());
        employee.setDob(employeeDTO.getDob());
        employee.setAddress(employeeDTO.getAddress());
        employee.setPhone(employeeDTO.getPhone());
        employee.setDesignation(employeeDTO.getDesignation());

        if (employeeDTO.getGender() != null && !employeeDTO.getGender().isBlank())
            employee.setGender(Employee.Gender.valueOf(employeeDTO.getGender()));

        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepo.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            employee.setDepartment(department);
        }

        Employee updated = employeeRepo.save(employee);
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", updated.getId(),
                "Updated employee: " + updated.getFullName(), employee.getCompany().getId());
        return convertToDTO(updated);
    }

    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setStatus(Employee.EmployeeStatus.INACTIVE);
        employeeRepo.save(employee);
        auditService.logAction("DEACTIVATE_EMPLOYEE", "Employee", employee.getId(),
                "Deactivated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    public void terminateEmployee(Long id, LocalDate terminationDate) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setStatus(Employee.EmployeeStatus.TERMINATED);
        employee.setTerminationDate(terminationDate);
        employeeRepo.save(employee);
        auditService.logAction("TERMINATE_EMPLOYEE", "Employee", employee.getId(),
                "Terminated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepo.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    // ─── DEPARTMENTS ──────────────────────────────────────────────────────────

    public List<DepartmentDTO> getDepartmentsByCompany(Long companyId) {
        return departmentRepo.findByCompanyId(companyId).stream()
                .map(this::deptToDTO).collect(Collectors.toList());
    }

    public DepartmentDTO createDepartment(DepartmentDTO dto, Long companyId) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Department dept = new Department();
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        dept.setActive(true);
        dept.setCompany(company);

        return deptToDTO(departmentRepo.save(dept));
    }

    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        if (dto.getActive() != null) dept.setActive(dto.getActive());
        return deptToDTO(departmentRepo.save(dept));
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        dept.setActive(false);
        departmentRepo.save(dept);
    }

    // ─── DASHBOARD STATS ──────────────────────────────────────────────────────

    public DashboardStatsDTO getDashboardStats(Long companyId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        List<Employee> allEmployees = employeeRepo.findByCompanyId(companyId);
        stats.setTotalEmployees((long) allEmployees.size());
        stats.setActiveEmployees(allEmployees.stream()
                .filter(e -> e.getStatus() == Employee.EmployeeStatus.ACTIVE).count());

        stats.setTotalDepartments((long) departmentRepo.findByCompanyIdAndActive(companyId, true).size());

        // Pending leave applications
        try {
            stats.setPendingLeaveApplications(leaveApplicationRepo.countPendingByCompanyId(companyId));
        } catch (Exception e) {
            stats.setPendingLeaveApplications(0L);
        }

        // Today's attendance
        try {
            stats.setTodayPresent((long) attendanceRepo.findPresentByCompanyIdAndDate(
                    companyId, LocalDate.now()).size());
        } catch (Exception e) {
            stats.setTodayPresent(0L);
        }

        // Current month payslips
        try {
            LocalDate now = LocalDate.now();
            stats.setCurrentMonthPayslips(payslipRepo.countByCompanyIdAndMonthAndYear(
                    companyId, now.getMonthValue(), now.getYear()));
        } catch (Exception e) {
            stats.setCurrentMonthPayslips(0L);
        }

        return stats;
    }

    // ─── CONVERTERS ───────────────────────────────────────────────────────────

    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = modelMapper.map(employee, EmployeeDTO.class);
        dto.setPassword(null);

        if (employee.getCompany() != null) {
            dto.setCompanyId(employee.getCompany().getId());
            dto.setCompanyName(employee.getCompany().getCompanyName());
        }
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        } else if (employee.getDepartmentName() != null) {
            // fallback: free-text department stored directly on employee
            dto.setDepartmentName(employee.getDepartmentName());
        }
        if (employee.getGender() != null) dto.setGender(employee.getGender().name());
        if (employee.getRole() != null) dto.setRole(employee.getRole().name());
        if (employee.getStatus() != null) dto.setStatus(employee.getStatus().name());
        if (employee.getEmploymentType() != null) dto.setEmploymentType(employee.getEmploymentType().name());

        return dto;
    }

    private DepartmentDTO deptToDTO(Department dept) {
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
}