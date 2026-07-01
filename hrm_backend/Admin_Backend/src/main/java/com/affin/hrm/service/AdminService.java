package com.affin.hrm.service;

import com.affin.hrm.dto.CompanyDTO;
import com.affin.hrm.dto.DashboardStatsDTO;
import com.affin.hrm.dto.EmployeeDTO;
import com.affin.hrm.model.AuditLog;
import com.affin.hrm.model.SystemConfiguration;
import com.affin.hrm.repository.AuditLogRepository;
import com.affin.hrm.repository.SystemConfigurationRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Admin service — calls Employee_Backend internal API for employee/company data.
 * Only directly manages admin-specific tables (AuditLog, SystemConfiguration).
 */
@Service
@Transactional
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final RestTemplate restTemplate;
    private final AuditLogRepository auditLogRepository;
    private final SystemConfigurationRepository systemConfigurationRepository;

    @Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    public AdminService(RestTemplate restTemplate,
                        AuditLogRepository auditLogRepository,
                        SystemConfigurationRepository systemConfigurationRepository) {
        this.restTemplate = restTemplate;
        this.auditLogRepository = auditLogRepository;
        this.systemConfigurationRepository = systemConfigurationRepository;
    }

    // ── Dashboard Statistics (from Employee_Backend) ─────────────

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/stats",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> data = response.getBody();
            if (data == null) return new DashboardStatsDTO();

            DashboardStatsDTO stats = new DashboardStatsDTO();
            stats.setTotalEmployees(toLong(data.get("totalEmployees")));
            stats.setTotalCompanies(toLong(data.get("totalCompanies")));
            stats.setTotalDepartments(toLong(data.get("totalDepartments")));
            stats.setPresentToday(toLong(data.get("presentToday")));
            stats.setPendingLeaves(toLong(data.get("pendingLeaves")));
            return stats;
        } catch (Exception e) {
            log.error("Failed to get dashboard stats from Employee service: {}", e.getMessage());
            return new DashboardStatsDTO();
        }
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

    // ── Company Management (via Employee_Backend) ────────────────

    @Transactional(readOnly = true)
    public List<CompanyDTO> getAllCompanies() {
        try {
            ResponseEntity<List<CompanyDTO>> response = restTemplate.exchange(
                    employeeServiceUrl + "/api/internal/companies",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<List<CompanyDTO>>() {});
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get companies from Employee service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Value("${service.hr-url:http://localhost:5005}")
    private String hrServiceUrl;

    @Transactional(readOnly = true)
    public CompanyDTO getCompanyById(Long id) {
        return restTemplate.getForObject(
                employeeServiceUrl + "/api/internal/companies/" + id, CompanyDTO.class);
    }

    private void syncCompanyToHRBackend(CompanyDTO company) {
        if (company == null) return;
        try {
            restTemplate.postForObject(hrServiceUrl + "/api/sync/company", company, Object.class);
            log.info("Successfully synced company to HR backend: {}", company.getCompanyName());
        } catch (Exception e) {
            log.error("Failed to sync company {} to HR backend: {}", company.getCompanyName(), e.getMessage());
        }
    }

    public CompanyDTO createCompany(CompanyDTO dto) {
        CompanyDTO created = restTemplate.postForObject(
                employeeServiceUrl + "/api/internal/companies", dto, CompanyDTO.class);
        logAction("CREATE_COMPANY", "Company", created != null ? created.getId() : null,
                "Created company: " + dto.getCompanyName());
        if (created != null) {
            syncCompanyToHRBackend(created);
        }
        return created;
    }

    public CompanyDTO updateCompany(Long id, CompanyDTO dto) {
        restTemplate.put(employeeServiceUrl + "/api/internal/companies/" + id, dto);
        logAction("UPDATE_COMPANY", "Company", id, "Updated company: " + dto.getCompanyName());
        CompanyDTO updated = getCompanyById(id);
        syncCompanyToHRBackend(updated);
        return updated;
    }

    public CompanyDTO approveCompany(Long id) {
        CompanyDTO dto = new CompanyDTO();
        dto.setStatus("APPROVED");
        restTemplate.put(employeeServiceUrl + "/api/internal/companies/" + id, dto);
        logAction("APPROVE_COMPANY", "Company", id, "Approved company");
        CompanyDTO updated = getCompanyById(id);
        syncCompanyToHRBackend(updated);
        return updated;
    }

    public CompanyDTO rejectCompany(Long id, String reason) {
        CompanyDTO dto = new CompanyDTO();
        dto.setStatus("REJECTED");
        dto.setRejectionReason(reason);
        restTemplate.put(employeeServiceUrl + "/api/internal/companies/" + id, dto);
        logAction("REJECT_COMPANY", "Company", id, "Rejected company. Reason: " + reason);
        CompanyDTO updated = getCompanyById(id);
        syncCompanyToHRBackend(updated);
        return updated;
    }

    public CompanyDTO suspendCompany(Long id, String reason) {
        CompanyDTO dto = new CompanyDTO();
        dto.setStatus("SUSPENDED");
        restTemplate.put(employeeServiceUrl + "/api/internal/companies/" + id, dto);
        logAction("SUSPEND_COMPANY", "Company", id, "Suspended company. Reason: " + reason);
        CompanyDTO updated = getCompanyById(id);
        syncCompanyToHRBackend(updated);
        return updated;
    }

    // ── System User Management (via Employee_Backend) ────────────

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
                employeeServiceUrl + "/api/internal/employees/" + userId + "/role?role=" + role,
                HttpMethod.PUT, null, EmployeeDTO.class);
        logAction("UPDATE_USER_ROLE", "Employee", userId, "Changed role to " + role);
        return response.getBody();
    }

    public EmployeeDTO updateUserStatus(Long userId, String status) {
        ResponseEntity<EmployeeDTO> response = restTemplate.exchange(
                employeeServiceUrl + "/api/internal/employees/" + userId + "/status?status=" + status,
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

    private void logAction(String action, String entity, Long entityId, String description) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntity(entity);
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);
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
