package com.affin.hrm.Service;

import com.affin.hrm.Model.AuditLog;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.AuditLogRepo;
import com.affin.hrm.Repo.CompanyRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AuditService {

    @Autowired private AuditLogRepo auditLogRepo;
    @Autowired private CompanyRepo companyRepo;
    @Autowired private AuthService authService;

    public void logAction(String action, String entity, Long entityId, String description, Long companyId) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntity(entity);
            log.setEntityId(entityId);
            log.setDescription(description);

            try {
                Employee current = authService.getCurrentEmployee();
                log.setEmployee(current);
            } catch (Exception ignored) {}

            if (companyId != null) {
                companyRepo.findById(companyId).ifPresent(log::setCompany);
            }

            auditLogRepo.save(log);
        } catch (Exception e) {
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    public List<AuditLog> getCompanyAuditLogs(Long companyId) {
        return auditLogRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepo.findAll();
    }

    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepo.findByDateRange(startDate, endDate);
    }

    public List<AuditLog> getAuditLogsByAction(String action) {
        return auditLogRepo.findByActionOrderByCreatedAtDesc(action);
    }
}
