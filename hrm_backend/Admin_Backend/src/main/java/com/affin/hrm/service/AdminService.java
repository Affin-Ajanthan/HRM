package com.affin.hrm.service;

import com.affin.hrm.dto.CompanyDTO;
import com.affin.hrm.dto.CompanyRequestDTO;
import com.affin.hrm.dto.DashboardStatsDTO;
import com.affin.hrm.dto.EmployeeDTO;
import com.affin.hrm.model.AuditLog;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.SystemConfiguration;
import com.affin.hrm.repository.AuditLogRepository;
import com.affin.hrm.repository.CompanyRepository;
import com.affin.hrm.repository.SystemConfigurationRepository;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin service — owns Company requests and AuditLogs in hrm_db_admin.
 * Provisions HR Manager accounts to User_Backend upon approval and syncs companies across services.
 */
@Service
@Transactional
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final RestTemplate restTemplate;
    private final AuditLogRepository auditLogRepository;
    private final SystemConfigurationRepository systemConfigurationRepository;
    private final CompanyRepository companyRepository;
    private final EmailService emailService;

    @Value("${service.user-url:http://localhost:5002}")
    private String userServiceUrl;

    @Value("${service.hr-url:http://localhost:5005}")
    private String hrServiceUrl;

    @Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    public AdminService(RestTemplate restTemplate,
                        AuditLogRepository auditLogRepository,
                        SystemConfigurationRepository systemConfigurationRepository,
                        CompanyRepository companyRepository,
                        EmailService emailService) {
        this.restTemplate = restTemplate;
        this.auditLogRepository = auditLogRepository;
        this.systemConfigurationRepository = systemConfigurationRepository;
        this.companyRepository = companyRepository;
        this.emailService = emailService;
    }

    // ── Public Registration Request ──────────────────────────────

    public CompanyDTO submitPublicCompanyRequest(CompanyRequestDTO requestDTO) {
        log.info("Submitting public company registration request for: {}", requestDTO.getCompanyName());

        companyRepository.findByRegistrationNumber(requestDTO.getRegistrationNumber())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Company with registration number '" + requestDTO.getRegistrationNumber() + "' already exists.");
                });

        Company company = new Company();
        company.setCompanyName(requestDTO.getCompanyName());
        company.setRegistrationNumber(requestDTO.getRegistrationNumber());
        company.setEmail(requestDTO.getEmail());
        company.setPhone(requestDTO.getPhone());
        company.setAddress(requestDTO.getAddress());
        company.setWebsite(requestDTO.getWebsite());
        company.setIndustry(requestDTO.getIndustry());
        company.setEmployeeCount(requestDTO.getEmployeeCount());
        company.setContactPersonName(requestDTO.getContactPersonName());
        company.setContactPersonRole(requestDTO.getContactPersonRole());
        company.setNotes(requestDTO.getNotes());
        company.setStatus(Company.CompanyStatus.PENDING);

        Company saved = companyRepository.save(company);
        logAction("PUBLIC_COMPANY_REQUEST", "Company", saved.getId(),
                "Submitted company registration request for: " + saved.getCompanyName());

        // Send confirmation email
        try {
            emailService.sendRequestReceivedEmail(saved.getEmail(), saved.getContactPersonName(), saved.getCompanyName());
        } catch (Exception e) {
            log.warn("Failed to send request received email for company {}: {}", saved.getCompanyName(), e.getMessage());
        }

        return mapToDTO(saved);
    }

    // ── Dashboard Statistics ─────────────────────────────────────

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        try {
            long totalCompanies = companyRepository.countByStatus(Company.CompanyStatus.APPROVED);
            long pendingCompanies = companyRepository.countByStatus(Company.CompanyStatus.PENDING);
            stats.setTotalCompanies(totalCompanies);
            stats.setPendingCompanies(pendingCompanies);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/stats",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> data = response.getBody();
            if (data != null) {
                stats.setTotalEmployees(toLong(data.get("totalEmployees")));
                stats.setTotalDepartments(toLong(data.get("totalDepartments")));
                stats.setPresentToday(toLong(data.get("presentToday")));
                stats.setPendingLeaves(toLong(data.get("pendingLeaves")));
            }
        } catch (Exception e) {
            log.error("Failed to get employee/department stats from Employee service: {}", e.getMessage());
        }
        return stats;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getCompanyDashboardStats(Long companyId) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/stats/company/" + companyId,
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> data = response.getBody();
            if (data == null) return new DashboardStatsDTO();

            DashboardStatsDTO stats = new DashboardStatsDTO();
            stats.setTotalEmployees(toLong(data.get("totalEmployees")));
            stats.setPresentToday(toLong(data.get("presentToday")));
            stats.setPendingLeaves(toLong(data.get("pendingLeaves")));
            return stats;
        } catch (Exception e) {
            log.error("Failed to get company stats from Employee service: {}", e.getMessage());
            return new DashboardStatsDTO();
        }
    }

    // ── Company Management (owned by hrm_db_admin) ───────────────

    @Transactional(readOnly = true)
    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return mapToDTO(company);
    }

    public CompanyDTO createCompany(CompanyDTO dto) {
        Company company = new Company();
        company.setCompanyName(dto.getCompanyName());
        company.setRegistrationNumber(dto.getRegistrationNumber());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setAddress(dto.getAddress());
        company.setWebsite(dto.getWebsite());
        company.setIndustry(dto.getIndustry());
        company.setContactPersonName(dto.getContactPersonName());
        company.setContactPersonRole(dto.getContactPersonRole());
        company.setNotes(dto.getNotes());
        company.setEmployeeCount((int) dto.getEmployeeCount());
        company.setStatus(Company.CompanyStatus.APPROVED);

        Company saved = companyRepository.save(company);
        logAction("CREATE_COMPANY", "Company", saved.getId(), "Created company: " + saved.getCompanyName());
        syncCompanyToBackends(saved);
        return mapToDTO(saved);
    }

    public CompanyDTO updateCompany(Long id, CompanyDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setCompanyName(dto.getCompanyName());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setAddress(dto.getAddress());
        company.setWebsite(dto.getWebsite());
        company.setIndustry(dto.getIndustry());
        company.setContactPersonName(dto.getContactPersonName());
        company.setContactPersonRole(dto.getContactPersonRole());
        company.setNotes(dto.getNotes());
        company.setEmployeeCount((int) dto.getEmployeeCount());
        if (dto.getStatus() != null) {
            try {
                company.setStatus(Company.CompanyStatus.valueOf(dto.getStatus()));
            } catch (Exception ignored) {}
        }

        Company updated = companyRepository.save(company);
        logAction("UPDATE_COMPANY", "Company", id, "Updated company: " + updated.getCompanyName());
        syncCompanyToBackends(updated);
        return mapToDTO(updated);
    }

    public CompanyDTO approveCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setStatus(Company.CompanyStatus.APPROVED);
        company.setRejectionReason(null);
        Company updated = companyRepository.save(company);

        String tempPassword = generateTempPassword();

        // 1. Sync company to all backends (User_Backend, HR_Backend, Employee_Backend)
        syncCompanyToBackends(updated);

        // 2. Provision HR Manager user in User_Backend with mustChangePassword = true.
        //    If that fails, stop before emailing credentials that would not work; approving again retries.
        String provisionError = provisionHRManagerUser(updated, tempPassword);
        if (provisionError != null) {
            throw new BusinessException("Company approved, but its HR Manager account could not be created: "
                    + provisionError + ". Please try approving again.");
        }

        // 3. Send approval email
        emailService.sendApprovalEmail(updated.getEmail(), updated.getContactPersonName(), updated.getCompanyName(), tempPassword);

        // 4. Log Audit Action
        logAction("APPROVE_COMPANY", "Company", id, "Approved company '" + updated.getCompanyName() + "' and provisioned HR Manager account");

        return mapToDTO(updated);
    }

    public CompanyDTO rejectCompany(Long id, String reason) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        String rejectionReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Application did not meet requirements.";
        company.setStatus(Company.CompanyStatus.REJECTED);
        company.setRejectionReason(rejectionReason);
        Company updated = companyRepository.save(company);

        logAction("REJECT_COMPANY", "Company", id, "Rejected company '" + updated.getCompanyName() + "'. Reason: " + rejectionReason);
        emailService.sendRejectionEmail(updated.getEmail(), updated.getContactPersonName(), updated.getCompanyName(), rejectionReason);

        syncCompanyToBackends(updated);
        return mapToDTO(updated);
    }

    public CompanyDTO suspendCompany(Long id, String reason) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setStatus(Company.CompanyStatus.SUSPENDED);
        Company updated = companyRepository.save(company);

        logAction("SUSPEND_COMPANY", "Company", id, "Suspended company '" + updated.getCompanyName() + "'. Reason: " + reason);
        syncCompanyToBackends(updated);
        return mapToDTO(updated);
    }

    // ── Inter-Service Sync & Provisioning Helpers ────────────────

    private void syncCompanyToBackends(Company company) {
        if (company == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", company.getId());
        payload.put("companyName", company.getCompanyName());
        payload.put("registrationNumber", company.getRegistrationNumber());
        payload.put("email", company.getEmail());
        payload.put("phone", company.getPhone());
        payload.put("address", company.getAddress());
        payload.put("website", company.getWebsite());
        payload.put("industry", company.getIndustry());
        payload.put("contactPersonName", company.getContactPersonName());
        payload.put("contactPersonRole", company.getContactPersonRole());
        payload.put("employeeCount", company.getEmployeeCount());
        payload.put("status", company.getStatus() != null ? company.getStatus().name() : "APPROVED");
        payload.put("rejectionReason", company.getRejectionReason());

        // Sync to User_Backend
        try {
            restTemplate.postForObject(userServiceUrl + "/api/sync/company", payload, Object.class);
            log.info("Synced company {} to User backend", company.getCompanyName());
        } catch (Exception e) {
            log.error("Failed to sync company {} to User backend: {}", company.getCompanyName(), e.getMessage());
        }

        // Sync to HR_Backend
        try {
            restTemplate.postForObject(hrServiceUrl + "/api/sync/company", payload, Object.class);
            log.info("Synced company {} to HR backend", company.getCompanyName());
        } catch (Exception e) {
            log.error("Failed to sync company {} to HR backend: {}", company.getCompanyName(), e.getMessage());
        }

        // Sync to Employee_Backend
        try {
            restTemplate.postForObject(employeeServiceUrl + "/api/sync/company", payload, Object.class);
            log.info("Synced company {} to Employee backend", company.getCompanyName());
        } catch (Exception e) {
            log.error("Failed to sync company {} to Employee backend: {}", company.getCompanyName(), e.getMessage());
        }
    }

    /** Creates the company's HR Manager login in User_Backend; returns null on success, otherwise the reason. */
    private String provisionHRManagerUser(Company company, String tempPassword) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", company.getEmail());
            payload.put("fullName", company.getContactPersonName() != null ? company.getContactPersonName() : company.getCompanyName() + " HR Manager");
            payload.put("password", tempPassword);
            payload.put("role", "HR_MANAGER");
            payload.put("employeeId", "HR-" + String.format("%03d", company.getId()));
            payload.put("status", "ACTIVE");
            payload.put("mustChangePassword", true);

            Map<String, Object> compMap = new HashMap<>();
            compMap.put("id", company.getId());
            compMap.put("companyName", company.getCompanyName());
            compMap.put("registrationNumber", company.getRegistrationNumber());
            payload.put("company", compMap);

            restTemplate.postForObject(userServiceUrl + "/api/sync/employee", payload, String.class);
            log.info("Provisioned HR Manager account for company: {} with email: {}", company.getCompanyName(), company.getEmail());
            return null;
        } catch (Exception e) {
            log.error("Failed to provision HR Manager account for company {}: {}", company.getCompanyName(), e.getMessage());
            return e.getMessage();
        }
    }

    private String generateTempPassword() {
        return "TempPass" + (1000 + new Random().nextInt(9000)) + "!";
    }

    private CompanyDTO mapToDTO(Company company) {
        if (company == null) return null;
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setCompanyName(company.getCompanyName());
        dto.setRegistrationNumber(company.getRegistrationNumber());
        dto.setEmail(company.getEmail());
        dto.setPhone(company.getPhone());
        dto.setAddress(company.getAddress());
        dto.setWebsite(company.getWebsite());
        dto.setIndustry(company.getIndustry());
        dto.setContactPersonName(company.getContactPersonName());
        dto.setContactPersonRole(company.getContactPersonRole());
        dto.setNotes(company.getNotes());
        dto.setStatus(company.getStatus() != null ? company.getStatus().name() : "PENDING");
        dto.setRejectionReason(company.getRejectionReason());
        dto.setEmployeeCount(company.getEmployeeCount() != null ? company.getEmployeeCount() : 0);
        dto.setCreatedAt(company.getCreatedAt() != null ? company.getCreatedAt().toString() : null);
        return dto;
    }

    // ── System User Management (lists via Employee_Backend, changes in User_Backend) ──

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllSystemUsers() {
        try {
            ResponseEntity<List<EmployeeDTO>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/employees",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<EmployeeDTO>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get system users from Employee service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getUsersByCompany(Long companyId) {
        try {
            ResponseEntity<List<EmployeeDTO>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/employees/company/" + companyId,
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<EmployeeDTO>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get users by company from Employee service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAdminUsers() {
        try {
            ResponseEntity<List<EmployeeDTO>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/employees/admins",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<EmployeeDTO>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get admin users from Employee service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public EmployeeDTO updateUserRole(Long userId, String role) {
        ResponseEntity<EmployeeDTO> response = restTemplate.exchange(
                userServiceUrl + "/api/internal/users/" + userId + "/role?role=" + role,
                HttpMethod.PUT, null, EmployeeDTO.class);
        logAction("UPDATE_USER_ROLE", "Employee", userId, "Changed role to " + role);
        return response.getBody();
    }

    public EmployeeDTO updateUserStatus(Long userId, String status) {
        ResponseEntity<EmployeeDTO> response = restTemplate.exchange(
                userServiceUrl + "/api/internal/users/" + userId + "/status?status=" + status,
                HttpMethod.PUT, null, EmployeeDTO.class);
        logAction("UPDATE_USER_STATUS", "Employee", userId, "Changed status to " + status);
        return response.getBody();
    }

    // ── Audit Logs (Admin's own DB) ──────────────────────────────

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByDateRange(startDate, endDate);
    }

    // ── System Configuration (Admin's own DB) ────────────────────

    @Transactional(readOnly = true)
    public List<SystemConfiguration> getAllConfigurations() {
        return systemConfigurationRepository.findAll();
    }

    public SystemConfiguration getConfiguration(String key) {
        return systemConfigurationRepository.findByConfigKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemConfiguration", "key", key));
    }

    public SystemConfiguration updateConfiguration(String key, String value) {
        SystemConfiguration config = systemConfigurationRepository.findByConfigKey(key)
                .orElseGet(() -> {
                    SystemConfiguration newConfig = new SystemConfiguration();
                    newConfig.setConfigKey(key);
                    return newConfig;
                });
        config.setConfigValue(value);
        SystemConfiguration saved = systemConfigurationRepository.save(config);
        logAction("UPDATE_CONFIG", "SystemConfiguration", saved.getId(), "Updated config: " + key);
        return saved;
    }

    // ── Private Helpers ──────────────────────────────────────────

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void logAction(String action, String entity, Long entityId, String description) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntity(entity != null ? entity : "SYSTEM");
            auditLog.setEntityType(entity != null ? entity : "SYSTEM");
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);
            auditLog.setPerformedBy("ADMIN");
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) return ((Number) value).longValue();
        try { return Long.parseLong(value.toString()); } catch (NumberFormatException e) { return 0L; }
    }
}
