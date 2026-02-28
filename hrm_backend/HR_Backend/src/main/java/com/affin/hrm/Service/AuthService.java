package com.affin.hrm.Service;

import com.affin.hrm.Config.JwtUtil;
import com.affin.hrm.DTO.AuthRequest;
import com.affin.hrm.DTO.AuthResponse;
import com.affin.hrm.DTO.RegisterRequest;
import com.affin.hrm.Model.*;
import com.affin.hrm.Repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private CompanyRepo companyRepo;
    @Autowired private DepartmentRepo departmentRepo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    private static final String DEFAULT_COMPANY_NAME = "Default Company";
    private static final String DEFAULT_COMPANY_REG  = "DEFAULT-REG-0001";

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = normalize(request.getEmail());
        String rawPassword = request.getPassword() == null ? "" : request.getPassword();

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword));
        } catch (BadCredentialsException ex) {
            migrateLegacyUserIfNeeded(normalizedEmail, rawPassword);
            upgradePlainTextPasswordIfNeeded(normalizedEmail, rawPassword);
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        Employee employee = employeeRepo.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(jwt, employee.getEmail(), employee.getFullName(),
                employee.getRole().name(),
                employee.getCompany() != null ? employee.getCompany().getId() : null,
                employee.getId());
    }

    public Employee register(RegisterRequest request) {
        String normalizedEmail = normalize(request.getEmail());

        if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent())
            throw new RuntimeException("Employee with email already exists");
        if (request.getEmployeeId() != null && employeeRepo.findByEmployeeId(request.getEmployeeId()).isPresent())
            throw new RuntimeException("Employee ID already exists");

        Company company = getOrCreateDefaultCompany();
        String deptName = (request.getDepartment() == null || request.getDepartment().isBlank())
                ? "General" : request.getDepartment().trim();
        Department department = getOrCreateDepartment(company, deptName);

        Employee employee = new Employee();
        employee.setFullName(request.getFullName());
        employee.setEmail(normalizedEmail);
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setEmployeeId(request.getEmployeeId() != null
                ? request.getEmployeeId() : "EMP-" + System.currentTimeMillis());
        employee.setNic(request.getNic());
        employee.setDob(request.getDob());
        employee.setAddress(request.getAddress());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setJoiningDate(request.getJoiningDate() != null
                ? request.getJoiningDate() : java.time.LocalDate.now());
        employee.setCompany(company);
        employee.setDepartment(department);
        employee.setGender(parseGender(request.getGender()));
        employee.setRole(parseRole(request.getRole()));
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);

        return employeeRepo.save(employee);
    }

    public Employee getCurrentEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return employeeRepo.findByEmailIgnoreCase(normalize(auth.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean checkUserExists(String email) {
        return employeeRepo.findByEmailIgnoreCase(normalize(email)).isPresent();
    }

    public boolean checkLegacyUserExists(String email) {
        return userRepo.findByEmailIgnoreCase(normalize(email)).isPresent();
    }

    // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

    private void migrateLegacyUserIfNeeded(String normalizedEmail, String rawPassword) {
        if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent()) return;

        User legacyUser = userRepo.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (legacyUser == null || legacyUser.getPassword() == null) return;

        String stored = legacyUser.getPassword();
        boolean matches = isBcrypt(stored)
                ? passwordEncoder.matches(rawPassword, stored)
                : stored.equals(rawPassword);
        if (!matches) return;

        Company company = getOrCreateDefaultCompany();
        Department department = getOrCreateDepartment(company, "General");

        Employee employee = new Employee();
        employee.setFullName(legacyUser.getFullName() != null ? legacyUser.getFullName() : "User");
        employee.setEmail(normalizedEmail);
        employee.setEmployeeId(legacyUser.getEmployeeId() != null
                ? legacyUser.getEmployeeId() : "EMP-" + System.currentTimeMillis());
        employee.setNic(legacyUser.getNic());
        employee.setDob(legacyUser.getDob());
        employee.setAddress(legacyUser.getAddress());
        employee.setCompany(company);
        employee.setDepartment(department);
        employee.setRole(parseRole(legacyUser.getRole()));
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);
        employee.setJoiningDate(java.time.LocalDate.now());
        employee.setPassword(passwordEncoder.encode(rawPassword));
        employeeRepo.save(employee);
    }

    private void upgradePlainTextPasswordIfNeeded(String normalizedEmail, String rawPassword) {
        employeeRepo.findByEmailIgnoreCase(normalizedEmail).ifPresent(emp -> {
            String stored = emp.getPassword();
            if (stored != null && !isBcrypt(stored) && stored.equals(rawPassword)) {
                emp.setPassword(passwordEncoder.encode(rawPassword));
                employeeRepo.save(emp);
            }
        });
    }

    private Company getOrCreateDefaultCompany() {
        return companyRepo.findByRegistrationNumber(DEFAULT_COMPANY_REG).orElseGet(() -> {
            Company c = new Company();
            c.setCompanyName(DEFAULT_COMPANY_NAME);
            c.setRegistrationNumber(DEFAULT_COMPANY_REG);
            c.setStatus(Company.CompanyStatus.APPROVED);
            return companyRepo.save(c);
        });
    }

    private Department getOrCreateDepartment(Company company, String name) {
        return departmentRepo.findByCompanyIdAndName(company.getId(), name).orElseGet(() -> {
            Department d = new Department();
            d.setName(name);
            d.setDescription(name + " Department");
            d.setCompany(company);
            return departmentRepo.save(d);
        });
    }

    private Employee.Gender parseGender(String gender) {
        if (gender == null) return Employee.Gender.OTHER;
        try { return Employee.Gender.valueOf(gender.trim().toUpperCase()); }
        catch (Exception e) { return Employee.Gender.OTHER; }
    }

    private Employee.Role parseRole(String role) {
        if (role == null) return Employee.Role.EMPLOYEE;
        String normalized = role.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        return switch (normalized) {
            case "ADMIN" -> Employee.Role.ADMIN;
            case "HR", "HR_MANAGER", "HRMANAGER" -> Employee.Role.HR_MANAGER;
            default -> {
                try { yield Employee.Role.valueOf(normalized); }
                catch (Exception e) { yield Employee.Role.EMPLOYEE; }
            }
        };
    }

    private boolean isBcrypt(String value) {
        if (value == null) return false;
        String v = value.trim();
        return v.startsWith("$2a$") || v.startsWith("$2b$") || v.startsWith("$2y$");
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
