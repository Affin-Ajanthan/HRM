package com.affin.hrm.service;

import com.affin.hrm.config.JwtUtil;
import com.affin.hrm.dto.AuthRequest;
import com.affin.hrm.dto.AuthResponse;
import com.affin.hrm.dto.RegisterRequest;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.Department;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.CompanyRepository;
import com.affin.hrm.repository.DepartmentRepository;
import com.affin.hrm.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Authentication service — handles login, registration, and current user retrieval.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String DEFAULT_COMPANY_NAME = "Default Company";
    private static final String DEFAULT_COMPANY_REG = "DEFAULT-REG-0001";

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       EmployeeRepository employeeRepository,
                       CompanyRepository companyRepository,
                       DepartmentRepository departmentRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword() == null ? "" : request.getPassword();

        // Upgrade plain-text passwords before authentication attempt
        employeeRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(employee -> {
            String stored = employee.getPassword();
            if (stored != null && !isBcryptHash(stored) && stored.equals(rawPassword)) {
                log.info("Upgrading plain-text password to BCrypt for: {}", normalizedEmail);
                employee.setPassword(passwordEncoder.encode(rawPassword));
                employeeRepository.save(employee);
            }
        });

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        Employee employee = employeeRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", normalizedEmail));

        log.info("User logged in successfully: {}", normalizedEmail);

        return new AuthResponse(
                jwt,
                employee.getEmail(),
                employee.getFullName(),
                employee.getRole().name(),
                employee.getCompany() != null ? employee.getCompany().getId() : null,
                employee.getId()
        );
    }

    public Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = normalizeEmail(authentication.getName());
        return employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", email));
    }

    public Employee register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (employeeRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new BusinessException("Employee with email " + normalizedEmail + " already exists");
        }

        if (request.getEmployeeId() != null && employeeRepository.findByEmployeeId(request.getEmployeeId()).isPresent()) {
            throw new BusinessException("Employee ID " + request.getEmployeeId() + " already exists");
        }

        Company company = getOrCreateDefaultCompany();
        String deptName = (request.getDepartment() == null || request.getDepartment().isBlank())
                ? "General" : request.getDepartment().trim();
        Department department = getOrCreateDepartment(company, deptName);

        Employee employee = new Employee();
        employee.setFullName(request.getFullName());
        employee.setEmail(normalizedEmail);
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setEmployeeId(request.getEmployeeId() != null ? request.getEmployeeId() : "EMP-" + System.currentTimeMillis());
        employee.setNic(request.getNic());
        employee.setDob(request.getDob());
        employee.setAddress(request.getAddress());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setJoiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : LocalDate.now());
        employee.setCompany(company);
        employee.setDepartment(department);
        employee.setGender(parseGender(request.getGender()));
        employee.setRole(parseRole(request.getRole()));
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);

        Employee saved = employeeRepository.save(employee);
        log.info("New employee registered: {} ({})", saved.getFullName(), saved.getEmail());
        return saved;
    }

    public boolean checkUserExists(String email) {
        return employeeRepository.findByEmailIgnoreCase(normalizeEmail(email)).isPresent();
    }

    // ── Private helpers ──────────────────────────────────────────

    private Company getOrCreateDefaultCompany() {
        return companyRepository.findByRegistrationNumber(DEFAULT_COMPANY_REG)
                .orElseGet(() -> {
                    Company newCompany = new Company();
                    newCompany.setCompanyName(DEFAULT_COMPANY_NAME);
                    newCompany.setRegistrationNumber(DEFAULT_COMPANY_REG);
                    newCompany.setStatus(Company.CompanyStatus.APPROVED);
                    return companyRepository.save(newCompany);
                });
    }

    private Department getOrCreateDepartment(Company company, String deptName) {
        return departmentRepository.findByCompanyIdAndName(company.getId(), deptName)
                .orElseGet(() -> {
                    Department newDept = new Department();
                    newDept.setName(deptName);
                    newDept.setDescription(deptName + " Department");
                    newDept.setCompany(company);
                    return departmentRepository.save(newDept);
                });
    }

    private Employee.Gender parseGender(String gender) {
        if (gender == null) return Employee.Gender.OTHER;
        try {
            return Employee.Gender.valueOf(gender.trim().toUpperCase());
        } catch (Exception e) {
            return Employee.Gender.OTHER;
        }
    }

    private Employee.Role parseRole(String role) {
        if (role == null) return Employee.Role.EMPLOYEE;
        String normalized = role.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        try {
            return Employee.Role.valueOf(normalized);
        } catch (Exception e) {
            return Employee.Role.EMPLOYEE;
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private boolean isBcryptHash(String value) {
        if (value == null) return false;
        String v = value.trim();
        return v.startsWith("$2a$") || v.startsWith("$2b$") || v.startsWith("$2y$");
    }
}
