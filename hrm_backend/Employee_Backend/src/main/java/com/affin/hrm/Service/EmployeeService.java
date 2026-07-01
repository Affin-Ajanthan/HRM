package com.affin.hrm.service;

import com.affin.hrm.dto.EmployeeDTO;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.Department;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.CompanyRepository;
import com.affin.hrm.repository.DepartmentRepository;
import com.affin.hrm.repository.EmployeeRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Employee service — CRUD operations and sync functionality.
 */
@Service
@Transactional
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           CompanyRepository companyRepository,
                           DepartmentRepository departmentRepository,
                           ModelMapper modelMapper,
                           PasswordEncoder passwordEncoder,
                           AuditService auditService) {
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployeesByCompany(Long companyId) {
        return employeeRepository.findByCompanyId(companyId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getActiveEmployeesByCompany(Long companyId) {
        return employeeRepository.findByCompanyIdAndStatus(companyId, Employee.EmployeeStatus.ACTIVE).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return convertToDTO(employee);
    }

    public EmployeeDTO createEmployee(EmployeeDTO dto, Long companyId) {
        String normalizedEmail = dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase();
        if (employeeRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new BusinessException("Employee with email " + normalizedEmail + " already exists");
        }
        if (employeeRepository.findByEmployeeId(dto.getEmployeeId()).isPresent()) {
            throw new BusinessException("Employee ID " + dto.getEmployeeId() + " already exists");
        }

        Employee employee = new Employee();
        employee.setEmployeeId(dto.getEmployeeId());
        employee.setFullName(dto.getFullName());
        employee.setEmail(normalizedEmail);
        employee.setPassword(passwordEncoder.encode(dto.getPassword()));
        employee.setNic(dto.getNic());
        employee.setDob(dto.getDob());
        employee.setAddress(dto.getAddress());
        employee.setPhone(dto.getPhone());

        if (dto.getGender() != null) {
            employee.setGender(Employee.Gender.valueOf(dto.getGender()));
        }
        employee.setRole(dto.getRole() != null ? Employee.Role.valueOf(dto.getRole()) : Employee.Role.EMPLOYEE);
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate() != null ? dto.getJoiningDate() : LocalDate.now());
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        employee.setCompany(company);

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            employee.setDepartment(department);
        }

        Employee saved = employeeRepository.save(employee);
        auditService.logAction("CREATE_EMPLOYEE", "Employee", saved.getId(),
                "Created employee: " + saved.getFullName(), companyId);
        log.info("Created employee: {} ({})", saved.getFullName(), saved.getEmail());
        return convertToDTO(saved);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setFullName(dto.getFullName());
        employee.setNic(dto.getNic());
        employee.setDob(dto.getDob());
        employee.setAddress(dto.getAddress());
        employee.setPhone(dto.getPhone());
        if (dto.getGender() != null) {
            employee.setGender(Employee.Gender.valueOf(dto.getGender()));
        }
        employee.setDesignation(dto.getDesignation());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            employee.setDepartment(department);
        }

        Employee updated = employeeRepository.save(employee);
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", updated.getId(),
                "Updated employee: " + updated.getFullName(), employee.getCompany().getId());
        return convertToDTO(updated);
    }

    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setStatus(Employee.EmployeeStatus.INACTIVE);
        employeeRepository.save(employee);
        auditService.logAction("DEACTIVATE_EMPLOYEE", "Employee", employee.getId(),
                "Deactivated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    public void terminateEmployee(Long id, LocalDate terminationDate) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setStatus(Employee.EmployeeStatus.TERMINATED);
        employee.setTerminationDate(terminationDate);
        employeeRepository.save(employee);
        auditService.logAction("TERMINATE_EMPLOYEE", "Employee", employee.getId(),
                "Terminated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * Sync employee from another microservice (e.g., User_Backend).
     */
    public Employee saveEmployee(Employee employee) {
        String normalizedEmail = employee.getEmail() != null ? employee.getEmail().trim().toLowerCase() : null;
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new BusinessException("Employee email is required");
        }

        Employee existing = employeeRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        Company company = getOrCreateCompany(employee);
        Department department = getOrCreateDepartment(employee, company);

        if (existing != null) {
            existing.setFullName(employee.getFullName());
            if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
                existing.setPassword(employee.getPassword());
            }
            existing.setEmployeeId(employee.getEmployeeId());
            existing.setNic(employee.getNic());
            existing.setDob(employee.getDob());
            existing.setAddress(employee.getAddress());
            existing.setPhone(employee.getPhone());
            existing.setGender(employee.getGender());
            existing.setRole(employee.getRole());
            existing.setStatus(employee.getStatus());
            existing.setDesignation(employee.getDesignation());
            existing.setJoiningDate(employee.getJoiningDate());
            existing.setCompany(company);
            existing.setDepartment(department);
            log.info("Updated existing employee via sync: {}", normalizedEmail);
            return employeeRepository.save(existing);
        } else {
            employee.setEmail(normalizedEmail);
            employee.setCompany(company);
            employee.setDepartment(department);
            if (employee.getStatus() == null) employee.setStatus(Employee.EmployeeStatus.ACTIVE);
            if (employee.getRole() == null) employee.setRole(Employee.Role.EMPLOYEE);
            log.info("Created new employee via sync: {}", normalizedEmail);
            return employeeRepository.save(employee);
        }
    }

    private Company getOrCreateCompany(Employee employee) {
        if (employee.getCompany() != null && employee.getCompany().getId() != null) {
            Company found = companyRepository.findById(employee.getCompany().getId()).orElse(null);
            if (found != null) return found;
        }
        return companyRepository.findByRegistrationNumber("DEFAULT-REG-0001")
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setCompanyName(employee.getCompany() != null && employee.getCompany().getCompanyName() != null
                            ? employee.getCompany().getCompanyName() : "Default Company");
                    c.setRegistrationNumber("DEFAULT-REG-0001");
                    c.setStatus(Company.CompanyStatus.APPROVED);
                    return companyRepository.save(c);
                });
    }

    private Department getOrCreateDepartment(Employee employee, Company company) {
        if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
            Department found = departmentRepository.findById(employee.getDepartment().getId()).orElse(null);
            if (found != null) return found;
        }
        String deptName = employee.getDepartment() != null && employee.getDepartment().getName() != null
                ? employee.getDepartment().getName() : "General";
        return departmentRepository.findByCompanyIdAndName(company.getId(), deptName)
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName(deptName);
                    d.setDescription(deptName + " Department");
                    d.setCompany(company);
                    return departmentRepository.save(d);
                });
    }

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
        }
        if (employee.getGender() != null) dto.setGender(employee.getGender().name());
        if (employee.getRole() != null) dto.setRole(employee.getRole().name());
        if (employee.getStatus() != null) dto.setStatus(employee.getStatus().name());
        return dto;
    }
}
