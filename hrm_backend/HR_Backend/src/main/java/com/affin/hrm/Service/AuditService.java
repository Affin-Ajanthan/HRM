package com.affin.hrm.service;

import com.affin.hrm.model.AuditLog;
import com.affin.hrm.model.Company;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.AuditLogRepository;
import com.affin.hrm.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for creating audit logs.
 * Uses SecurityContext directly to avoid circular dependency with AuthService.
 */
@Service
@Transactional
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final CompanyRepository companyRepository;
    private final com.affin.hrm.repository.EmployeeRepository employeeRepository;

    public AuditService(AuditLogRepository auditLogRepository,
                        CompanyRepository companyRepository,
                        com.affin.hrm.repository.EmployeeRepository employeeRepository) {
        this.auditLogRepository = auditLogRepository;
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
    }

    public void logAction(String action, String entity, Long entityId, String description, Long companyId) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntity(entity);
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);

            // Get current user from SecurityContext directly to avoid circular dependency
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getName() != null) {
                    employeeRepository.findByEmailIgnoreCase(auth.getName().trim().toLowerCase())
                            .ifPresent(auditLog::setEmployee);
                }
            } catch (Exception e) {
                log.debug("No authenticated user for audit log — system action");
            }

            if (companyId != null) {
                companyRepository.findById(companyId).ifPresent(auditLog::setCompany);
            }

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getCompanyAuditLogs(Long companyId) {
        return auditLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByDateRange(startDate, endDate);
    }
}
