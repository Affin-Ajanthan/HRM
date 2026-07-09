package com.affin.hrm.Service;

import com.affin.hrm.Config.JwtUtil;
import com.affin.hrm.DTO.AuthRequest;
import com.affin.hrm.DTO.AuthResponse;
import com.affin.hrm.DTO.RegisterRequest;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Model.User;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Model.SessionLog;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.DepartmentRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import com.affin.hrm.Repo.UserRepo;
import com.affin.hrm.Repo.SessionLogRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmployeeRepo employeeRepo;

        @Autowired
        private UserRepo userRepo;

        @Autowired
        private CompanyRepo companyRepo;

        @Autowired
        private DepartmentRepo departmentRepo;

        @Autowired
        private SessionLogRepo sessionLogRepo;

    @Autowired
    private com.affin.hrm.Service.SyncService syncService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RestTemplate restTemplate;

    private static final String DEFAULT_COMPANY_NAME = "Default Company";
        private static final String DEFAULT_COMPANY_REG = "DEFAULT-REG-0001";

    public AuthResponse login(AuthRequest request) {
                String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
                String rawPassword = request.getPassword() == null ? "" : request.getPassword();
                System.out.println("[AUTH_SERVICE] Login attempt for: " + normalizedEmail);

                Authentication authentication;
                try {
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword)
                        );
                } catch (BadCredentialsException ex) {
                        // Legacy module support: some older accounts were created in the 'users' table
                        // (api/hrm/login). If that user exists and the password matches, migrate it to
                        // the new Employee-based auth and retry.
                        migrateLegacyUserIfNeeded(normalizedEmail, rawPassword);

                        // Backward-compatibility: some older records may have stored plain-text passwords
                        // or emails with inconsistent casing. If the plain-text matches, upgrade it to BCrypt.
                        employeeRepo.findByEmailIgnoreCase(normalizedEmail).ifPresent(employee -> {
                                String stored = employee.getPassword();
                                if (stored != null
                                                && !isBcryptHash(stored)
                                                && stored.equals(rawPassword)) {
                                        employee.setPassword(passwordEncoder.encode(rawPassword));
                                        employeeRepo.save(employee);
                                }
                        });

                        // Retry authentication after potential upgrade
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword)
                        );
                }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        Employee employee = employeeRepo.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            SessionLog session = new SessionLog();
            session.setUserId(employee.getId());
            session.setLoginTime(LocalDateTime.now());
            session.setDeviceType("React Web / Flutter Mobile");
            session.setStatus(true);
            sessionLogRepo.save(session);
        } catch (Exception e) {
            System.err.println("[SESSION LOG ERROR] " + e.getMessage());
        }

        return new AuthResponse(
                jwt,
                employee.getEmail(),
                employee.getFullName(),
                employee.getRole().name(),
                employee.getCompany() != null ? employee.getCompany().getId() : null,
                employee.getId()
        );
    }

        private void migrateLegacyUserIfNeeded(String normalizedEmail, String rawPassword) {
                // If an employee already exists, no migration needed.
                if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
                        return;
                }

                User legacyUser = userRepo.findByEmailIgnoreCase(normalizedEmail).orElse(null);
                if (legacyUser == null) {
                        return;
                }

                String legacyStoredPassword = legacyUser.getPassword();
                if (legacyStoredPassword == null) {
                        return;
                }

                boolean passwordMatches;
                if (isBcryptHash(legacyStoredPassword)) {
                        passwordMatches = passwordEncoder.matches(rawPassword, legacyStoredPassword);
                } else {
                        passwordMatches = legacyStoredPassword.equals(rawPassword);
                }

                if (!passwordMatches) {
                        return;
                }

                Company company = companyRepo.findByRegistrationNumber(DEFAULT_COMPANY_REG)
                                .orElseGet(() -> {
                                        Company newCompany = new Company();
                                        newCompany.setCompanyName(DEFAULT_COMPANY_NAME);
                                        newCompany.setRegistrationNumber(DEFAULT_COMPANY_REG);
                                        newCompany.setStatus(Company.CompanyStatus.APPROVED);
                                        return companyRepo.save(newCompany);
                                });

                Department department = departmentRepo.findByCompanyIdAndName(company.getId(), "General")
                                .orElseGet(() -> {
                                        Department newDept = new Department();
                                        newDept.setName("General");
                                        newDept.setDescription("General Department");
                                        newDept.setCompany(company);
                                        return departmentRepo.save(newDept);
                                });

                Employee employee = new Employee();
                employee.setFullName(legacyUser.getFullName() != null ? legacyUser.getFullName() : "User");
                employee.setEmail(normalizedEmail);
                employee.setEmployeeId(legacyUser.getEmployeeId() != null ? legacyUser.getEmployeeId() : "EMP-" + System.currentTimeMillis());
                employee.setNic(legacyUser.getNic());
                employee.setDob(legacyUser.getDob());
                employee.setAddress(legacyUser.getAddress());
                employee.setCompany(company);
                employee.setDepartment(department);

                // Normalize legacy role values (often stored as 'admin'/'hr'/'employee')
                employee.setRole(mapLegacyRole(legacyUser.getRole()));
                employee.setStatus(Employee.EmployeeStatus.ACTIVE);
                employee.setJoiningDate(java.time.LocalDate.now());

                // Always store BCrypt in the new system
                employee.setPassword(passwordEncoder.encode(rawPassword));

                employeeRepo.save(employee);
        }

        private Employee.Role mapLegacyRole(String role) {
                if (role == null) return Employee.Role.EMPLOYEE;
                String normalized = role.trim().toUpperCase().replace("-", "_").replace(" ", "_");
                return switch (normalized) {
                        case "ADMIN" -> Employee.Role.ADMIN;
                        case "HR", "HR_MANAGER", "HRMANAGER" -> Employee.Role.HR_MANAGER;
                        case "EMPLOYEE", "USER" -> Employee.Role.EMPLOYEE;
                        default -> {
                                try {
                                        yield Employee.Role.valueOf(normalized);
                                } catch (Exception ignored) {
                                        yield Employee.Role.EMPLOYEE;
                                }
                        }
                };
        }

    public Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
                String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
                return employeeRepo.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

        public Employee register(RegisterRequest request) {
                String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

                if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
                        throw new RuntimeException("Employee with email already exists");
                }

                if (request.getEmployeeId() != null && employeeRepo.findByEmployeeId(request.getEmployeeId()).isPresent()) {
                        throw new RuntimeException("Employee ID already exists");
                }

                Company company = companyRepo.findByRegistrationNumber(DEFAULT_COMPANY_REG)
                                .orElseGet(() -> {
                                        Company newCompany = new Company();
                                        newCompany.setCompanyName(DEFAULT_COMPANY_NAME);
                                        newCompany.setRegistrationNumber(DEFAULT_COMPANY_REG);
                                        newCompany.setStatus(Company.CompanyStatus.APPROVED);
                                        return companyRepo.save(newCompany);
                                });

                String deptName = (request.getDepartment() == null || request.getDepartment().isBlank())
                                ? "General" : request.getDepartment().trim();

                Department department = departmentRepo.findByCompanyIdAndName(company.getId(), deptName)
                                .orElseGet(() -> {
                                        Department newDept = new Department();
                                        newDept.setName(deptName);
                                        newDept.setDescription(deptName + " Department");
                                        newDept.setCompany(company);
                                        return departmentRepo.save(newDept);
                                });

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
                employee.setJoiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : java.time.LocalDate.now());
                employee.setCompany(company);
                employee.setDepartment(department);

                if (request.getGender() != null) {
                        try {
                                employee.setGender(Employee.Gender.valueOf(request.getGender().trim().toUpperCase()));
                        } catch (Exception ignored) {
                                employee.setGender(Employee.Gender.OTHER);
                        }
                } else {
                        employee.setGender(Employee.Gender.OTHER);
                }

                if (request.getRole() != null) {
                        String normalizedRole = request.getRole().trim().toUpperCase()
                                        .replace("-", "_")
                                        .replace(" ", "_");
                        try {
                                employee.setRole(Employee.Role.valueOf(normalizedRole));
                        } catch (Exception ignored) {
                                employee.setRole(Employee.Role.EMPLOYEE);
                        }
                } else {
                        employee.setRole(Employee.Role.EMPLOYEE);
                }

                employee.setStatus(Employee.EmployeeStatus.ACTIVE);
                Employee savedEmployee = employeeRepo.save(employee);
                
                // Sync employee to other backends (Employee_Backend & HR_Backend)
                syncService.syncToAllBackends(savedEmployee);
                
                return savedEmployee;
        }

        private boolean isBcryptHash(String value) {
                if (value == null) return false;
                String v = value.trim();
                return v.startsWith("$2a$") || v.startsWith("$2b$") || v.startsWith("$2y$");
        }

        public boolean checkUserExists(String email) {
                String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
                return employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent();
        }

        public boolean checkLegacyUserExists(String email) {
                String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
                return userRepo.findByEmailIgnoreCase(normalizedEmail).isPresent();
        }

        public void syncAllEmployees() {
                 System.out.println("[SYNC] Starting manual sync of all employees to other backends...");
                 employeeRepo.findAll().forEach(employee -> {
                         try {
                                 syncService.syncToAllBackends(employee);
                         } catch (Exception e) {
                                 System.err.println("[SYNC ERROR] Failed to sync employee: " + employee.getEmail() + " Error: " + e.getMessage());
                         }
                 });
         }

         public String forgotPassword(String email) {
                 String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
                 Employee employee = employeeRepo.findByEmailIgnoreCase(normalizedEmail)
                         .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
                 String token = UUID.randomUUID().toString();
                 employee.setResetPasswordToken(token);
                 employee.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry
                 employeeRepo.save(employee);
                 
                 // Mock Link logged to console
                 String resetLink = "http://localhost:5173/reset-password?token=" + token;
                 System.out.println("[FORGOT_PASSWORD] Generated password reset link: " + resetLink);
                 return token;
         }

         public void resetPassword(String token, String newPassword) {
                 Employee employee = employeeRepo.findByResetPasswordToken(token)
                         .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
                 
                 if (employee.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
                         throw new RuntimeException("Reset token has expired");
                 }
                 
                 employee.setPassword(passwordEncoder.encode(newPassword));
                 employee.setResetPasswordToken(null);
                 employee.setResetPasswordTokenExpiry(null);
                 Employee saved = employeeRepo.save(employee);
                 
                 // Also update in User table if legacy user exists
                 userRepo.findByEmailIgnoreCase(saved.getEmail()).ifPresent(user -> {
                         user.setPassword(passwordEncoder.encode(newPassword));
                         userRepo.save(user);
                 });
                 
                 // Sync updated password across services
                 syncService.syncToAllBackends(saved);
         }

         public void logout(Long userId) {
                 sessionLogRepo.findFirstByUserIdAndStatusTrueOrderByIdDesc(userId).ifPresent(session -> {
                         session.setLogoutTime(LocalDateTime.now());
                         session.setStatus(false);
                         sessionLogRepo.save(session);
                         System.out.println("[LOGOUT] Session closed for user ID: " + userId);
                 });
         }

         public boolean validateSession(Long userId) {
                 return sessionLogRepo.findFirstByUserIdAndStatusTrueOrderByIdDesc(userId)
                         .map(SessionLog::getStatus)
                         .orElse(false);
         }
}
