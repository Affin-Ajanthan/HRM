package com.affin.hrm.service;

import com.affin.hrm.dto.CompanyDTO;
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
    private static final String DEFAULT_COMPANY_NAME = "Default Company";
    private static final String DEFAULT_COMPANY_REG = "DEFAULT-REG-0001";

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final EmailService emailService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           CompanyRepository companyRepository,
                           DepartmentRepository departmentRepository,
                           ModelMapper modelMapper,
                           PasswordEncoder passwordEncoder,
                           AuditService auditService,
                           EmailService emailService) {
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.emailService = emailService;
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
    /**
     * Upserts an employee pushed from User_Backend. The incoming "id" is User_Backend's
     * id, so it is stored as userId and never used as this database's primary key;
     * company and department ids belong to another database too, so those are
     * resolved by registration number / name instead.
     */
    public Employee saveEmployee(Employee employee) {
        String normalizedEmail = employee.getEmail() != null ? employee.getEmail().trim().toLowerCase() : null;
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new BusinessException("Employee email is required");
        }

        Long userId = employee.getUserId() != null ? employee.getUserId() : employee.getId();
        employee.setId(null);
        employee.setUserId(userId);

        Employee existing = (userId != null ? employeeRepository.findByUserId(userId) : java.util.Optional.<Employee>empty())
                .or(() -> employeeRepository.findByEmailIgnoreCase(normalizedEmail))
                .orElse(null);
        Company company = getOrCreateCompany(employee);
        Department department = getOrCreateDepartment(employee, company);

        if (existing != null) {
            existing.setUserId(userId);
            existing.setEmail(normalizedEmail);
            existing.setFullName(employee.getFullName());
            if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
                existing.setPassword(employee.getPassword());
            }
            if (employee.getEmployeeId() != null) existing.setEmployeeId(employee.getEmployeeId());
            existing.setNic(employee.getNic());
            existing.setDob(employee.getDob());
            existing.setAddress(employee.getAddress());
            existing.setPhone(employee.getPhone());
            existing.setGender(employee.getGender());
            if (employee.getRole() != null) existing.setRole(employee.getRole());
            if (employee.getStatus() != null) existing.setStatus(employee.getStatus());
            existing.setDesignation(employee.getDesignation());
            existing.setJoiningDate(employee.getJoiningDate());
            existing.setCompany(company);
            existing.setDepartment(department);
            log.info("Updated existing employee via sync: {} (userId {})", normalizedEmail, userId);
            return employeeRepository.save(existing);
        } else {
            employee.setEmail(normalizedEmail);
            employee.setCompany(company);
            employee.setDepartment(department);
            if (employee.getEmployeeId() == null) employee.setEmployeeId("EMP-U" + userId);
            if (employee.getPassword() == null || employee.getPassword().isBlank()) {
                // Credentials live in User_Backend; this column is only kept for the legacy local login.
                employee.setPassword("EXTERNAL_AUTH");
            }
            if (employee.getStatus() == null) employee.setStatus(Employee.EmployeeStatus.ACTIVE);
            if (employee.getRole() == null) employee.setRole(Employee.Role.EMPLOYEE);
            log.info("Created new employee via sync: {} (userId {})", normalizedEmail, userId);
            return employeeRepository.save(employee);
        }
    }

    private Company getOrCreateCompany(Employee employee) {
        Company incoming = employee.getCompany();
        String regNumber = incoming != null && incoming.getRegistrationNumber() != null
                ? incoming.getRegistrationNumber() : DEFAULT_COMPANY_REG;
        return companyRepository.findByRegistrationNumber(regNumber)
                .or(() -> incoming != null && incoming.getCompanyName() != null
                        ? companyRepository.findByCompanyName(incoming.getCompanyName())
                        : java.util.Optional.empty())
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setCompanyName(incoming != null && incoming.getCompanyName() != null
                            ? incoming.getCompanyName() : DEFAULT_COMPANY_NAME);
                    c.setRegistrationNumber(regNumber);
                    c.setStatus(Company.CompanyStatus.APPROVED);
                    return companyRepository.save(c);
                });
    }

    private Department getOrCreateDepartment(Employee employee, Company company) {
        String deptName = employee.getDepartment() != null && employee.getDepartment().getName() != null
                ? employee.getDepartment().getName().trim() : "General";
        return departmentRepository.findByCompanyIdAndName(company.getId(), deptName)
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName(deptName);
                    d.setDescription(deptName + " Department");
                    d.setCompany(company);
                    return departmentRepository.save(d);
                });
    }

    /**
     * Approve a pending company request, auto-provision HR Manager account, and send approval email.
     */
    public CompanyDTO approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        company.setStatus(Company.CompanyStatus.APPROVED);
        Company savedCompany = companyRepository.save(company);

        // Auto-provision initial HR Manager account
        String email = savedCompany.getEmail();
        String tempPassword = "HR#" + (100000 + new java.util.Random().nextInt(900000)) + "!";

        Employee hrUser = employeeRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    Employee newHr = new Employee();
                    newHr.setEmail(email);
                    newHr.setFullName(savedCompany.getContactPersonName() != null ? savedCompany.getContactPersonName() : (savedCompany.getCompanyName() + " HR Manager"));
                    newHr.setPassword(passwordEncoder.encode(tempPassword));
                    newHr.setRole(Employee.Role.HR_MANAGER);
                    newHr.setCompany(savedCompany);
                    newHr.setStatus(Employee.EmployeeStatus.ACTIVE);
                    newHr.setEmployeeId("HR-" + savedCompany.getId() + "-001");
                    newHr.setJoiningDate(LocalDate.now());
                    return employeeRepository.save(newHr);
                });

        // Send approval welcome email with credentials
        emailService.sendApprovalEmail(email, savedCompany.getContactPersonName(), savedCompany.getCompanyName(), tempPassword);

        // Sync approved company & HR Manager account to User_Backend (hrm_db_user)
        syncToUserBackend(savedCompany, hrUser);

        log.info("Approved company '{}' (ID: {}) and provisioned HR Manager account ({})", savedCompany.getCompanyName(), savedCompany.getId(), email);

        CompanyDTO dto = modelMapper.map(savedCompany, CompanyDTO.class);
        dto.setStatus(savedCompany.getStatus().name());
        return dto;
    }

    /**
     * Reject a pending company request and send rejection email.
     */
    public CompanyDTO rejectCompany(Long companyId, String reason) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        company.setStatus(Company.CompanyStatus.REJECTED);
        company.setRejectionReason(reason);
        Company savedCompany = companyRepository.save(company);

        // Send rejection email
        emailService.sendRejectionEmail(savedCompany.getEmail(), savedCompany.getContactPersonName(), savedCompany.getCompanyName(), reason);

        log.info("Rejected company '{}' (ID: {}). Reason: {}", savedCompany.getCompanyName(), savedCompany.getId(), reason);

        CompanyDTO dto = modelMapper.map(savedCompany, CompanyDTO.class);
        dto.setStatus(savedCompany.getStatus().name());
        dto.setRejectionReason(reason);
        return dto;
    }

    private void syncToUserBackend(Company company, Employee hrUser) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String userServiceUrl = "http://localhost:5002";

            // 1. Sync Company
            try {
                restTemplate.postForObject(userServiceUrl + "/api/sync/company", company, String.class);
                log.info("Synced approved company '{}' to User_Backend (hrm_db_user)", company.getCompanyName());
            } catch (Exception e) {
                log.warn("Could not sync company '{}' to User_Backend: {}", company.getCompanyName(), e.getMessage());
            }

            // 2. Sync HR Employee Account
            try {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("id", hrUser.getId());
                payload.put("employeeId", hrUser.getEmployeeId());
                payload.put("fullName", hrUser.getFullName());
                payload.put("email", hrUser.getEmail());
                payload.put("password", hrUser.getPassword());
                payload.put("role", hrUser.getRole() != null ? hrUser.getRole().name() : "HR_MANAGER");
                payload.put("status", hrUser.getStatus() != null ? hrUser.getStatus().name() : "ACTIVE");

                java.util.Map<String, Object> compMap = new java.util.HashMap<>();
                compMap.put("id", company.getId());
                compMap.put("companyName", company.getCompanyName());
                compMap.put("registrationNumber", company.getRegistrationNumber());
                payload.put("company", compMap);

                restTemplate.postForObject(userServiceUrl + "/api/sync/employee", payload, String.class);
                log.info("Synced HR Manager user '{}' ({}) to User_Backend (hrm_db_user) with company '{}'", hrUser.getEmail(), company.getCompanyName(), company.getCompanyName());
            } catch (Exception e) {
                log.warn("Could not sync HR Manager user '{}' to User_Backend: {}", hrUser.getEmail(), e.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed user database sync for company {}: {}", company.getCompanyName(), e.getMessage());
        }
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
