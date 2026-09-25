package com.affin.hrm.service;

import com.affin.hrm.model.Company;
import com.affin.hrm.model.Employee;
import com.affin.hrm.model.Notification;
import com.affin.hrm.repository.EmployeeRepository;
import com.affin.hrm.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for creating and managing in-app notifications.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               EmployeeRepository employeeRepository) {
        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Create in-app notifications for system administrators when a new company request arrives.
     */
    public void notifyAdminsForCompanyRequest(Company company) {
        try {
            String title = "New Company Registration Request";
            String message = String.format("New company application submitted by '%s' (Contact: %s, Email: %s). Status: PENDING.",
                    company.getCompanyName(),
                    company.getContactPersonName() != null ? company.getContactPersonName() : "N/A",
                    company.getEmail());

            // 1. Create system-wide admin notification entry
            Notification globalNotification = new Notification();
            globalNotification.setCompany(company);
            globalNotification.setTitle(title);
            globalNotification.setMessage(message);
            globalNotification.setType(Notification.NotificationType.GENERAL);
            globalNotification.setIsRead(false);
            notificationRepository.save(globalNotification);

            // 2. Also notify each individual ADMIN user account in DB
            List<Employee> adminUsers = employeeRepository.findByRole(Employee.Role.ADMIN);
            for (Employee admin : adminUsers) {
                try {
                    Notification userNotification = new Notification();
                    userNotification.setEmployee(admin);
                    userNotification.setCompany(company);
                    userNotification.setTitle(title);
                    userNotification.setMessage(message);
                    userNotification.setType(Notification.NotificationType.GENERAL);
                    userNotification.setIsRead(false);
                    notificationRepository.save(userNotification);
                } catch (Exception ex) {
                    log.warn("Failed to create individual admin notification for employee ID {}: {}", admin.getId(), ex.getMessage());
                }
            }

            log.info("Created company request notifications for admin user(s)");
        } catch (Exception e) {
            log.error("Failed to create admin notification for company request {}: {}", company.getCompanyName(), e.getMessage());
        }
    }
}

