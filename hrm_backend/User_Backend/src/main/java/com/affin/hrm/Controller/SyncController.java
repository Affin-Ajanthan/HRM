package com.affin.hrm.Controller;

import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * SyncController in User_Backend — receives company & user sync requests from Employee_Backend
 * to ensure hrm_db_user stores all approved companies and their associated HR/User accounts.
 */
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    private final CompanyRepo companyRepo;
    private final EmployeeRepo employeeRepo;
    private final com.affin.hrm.Repo.UserRepo userRepo;

    public SyncController(CompanyRepo companyRepo, EmployeeRepo employeeRepo, com.affin.hrm.Repo.UserRepo userRepo) {
        this.companyRepo = companyRepo;
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/company")
    public ResponseEntity<String> syncCompany(@RequestBody Company company) {
        log.info("[USER_BACKEND SYNC] Syncing company: {}", company.getCompanyName());

        Company existing = companyRepo.findByCompanyName(company.getCompanyName())
                .orElseGet(() -> companyRepo.findByRegistrationNumber(company.getRegistrationNumber()).orElse(null));

        if (existing == null) {
            existing = new Company();
        }

        existing.setCompanyName(company.getCompanyName());
        existing.setRegistrationNumber(company.getRegistrationNumber());
        existing.setEmail(company.getEmail());
        existing.setPhone(company.getPhone());
        existing.setAddress(company.getAddress());
        existing.setWebsite(company.getWebsite());
        existing.setIndustry(company.getIndustry());
        existing.setContactPersonName(company.getContactPersonName());
        existing.setContactPersonRole(company.getContactPersonRole());
        existing.setNotes(company.getNotes());
        existing.setEmployeeCount(company.getEmployeeCount());
        if (company.getStatus() != null) {
            existing.setStatus(Company.CompanyStatus.valueOf(company.getStatus().name()));
        }

        Company saved = companyRepo.save(existing);
        log.info("[USER_BACKEND SYNC SUCCESS] Company synced to hrm_db_user ID: {}, Name: {}", saved.getId(), saved.getCompanyName());
        return ResponseEntity.ok("Company synced to hrm_db_user successfully");
    }

    @PostMapping("/employee")
    public ResponseEntity<String> syncEmployee(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String fullName = (String) payload.get("fullName");
        String password = (String) payload.get("password");
        String roleStr = (String) payload.get("role");
        String employeeIdStr = (String) payload.get("employeeId");
        String statusStr = (String) payload.get("status");

        log.info("[USER_BACKEND SYNC] Syncing employee to hrm_db_user: {}", email);

        if (email == null) {
            return ResponseEntity.badRequest().body("Missing email in sync payload");
        }

        Employee employee = employeeRepo.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    Employee e = new Employee();
                    e.setEmail(email);
                    return e;
                });

        if (fullName != null) employee.setFullName(fullName);
        if (password != null) employee.setPassword(password);
        if (employeeIdStr != null) employee.setEmployeeId(employeeIdStr);

        if (roleStr != null) {
            try {
                employee.setRole(Employee.Role.valueOf(roleStr));
            } catch (Exception ignored) {}
        }

        if (statusStr != null) {
            try {
                employee.setStatus(Employee.EmployeeStatus.valueOf(statusStr));
            } catch (Exception ignored) {}
        }

        if (payload.containsKey("mustChangePassword")) {
            Object val = payload.get("mustChangePassword");
            if (val instanceof Boolean) {
                employee.setMustChangePassword((Boolean) val);
            } else if (val != null) {
                employee.setMustChangePassword(Boolean.parseBoolean(val.toString()));
            }
        }

        // Link company if present in payload
        if (payload.containsKey("company") && payload.get("company") instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> compMap = (Map<String, Object>) payload.get("company");
            String companyName = (String) compMap.get("companyName");
            String regNum = (String) compMap.get("registrationNumber");

            if (companyName != null || regNum != null) {
                Company company = null;
                if (companyName != null) {
                    company = companyRepo.findByCompanyName(companyName).orElse(null);
                }
                if (company == null && regNum != null) {
                    company = companyRepo.findByRegistrationNumber(regNum).orElse(null);
                }
                if (company == null) {
                    company = new Company();
                    company.setCompanyName(companyName != null ? companyName : "Default Company");
                    company.setRegistrationNumber(regNum != null ? regNum : "REG-GEN-001");
                    company.setStatus(Company.CompanyStatus.APPROVED);
                    company = companyRepo.save(company);
                }
                employee.setCompany(company);
            }
        }

        Employee saved = employeeRepo.save(employee);
        log.info("[USER_BACKEND SYNC SUCCESS] Employee synced to hrm_db_user ID: {}, Email: {}, Company: {}",
                saved.getId(), saved.getEmail(), saved.getCompany() != null ? saved.getCompany().getCompanyName() : "None");

        // Also update legacy users table if present
        try {
            com.affin.hrm.Model.User legacyUser = userRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
                com.affin.hrm.Model.User u = new com.affin.hrm.Model.User();
                u.setEmail(email);
                return u;
            });
            if (fullName != null) legacyUser.setFullName(fullName);
            if (password != null) legacyUser.setPassword(password);
            if (employeeIdStr != null) legacyUser.setEmployeeId(employeeIdStr);
            if (roleStr != null) legacyUser.setRole(roleStr);
            userRepo.save(legacyUser);
            log.info("[USER_BACKEND SYNC SUCCESS] Legacy user synced to hrm_db_user users table for {}", email);
        } catch (Exception e) {
            log.warn("Failed to sync legacy users table for {}: {}", email, e.getMessage());
        }

        return ResponseEntity.ok("Employee synced to hrm_db_user successfully");
    }
}
