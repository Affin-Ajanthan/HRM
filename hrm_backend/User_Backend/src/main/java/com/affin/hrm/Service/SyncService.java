package com.affin.hrm.Service;

import com.affin.hrm.Model.Employee;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * SyncService - Handles inter-microservice communication
 * Syncs employee data from User_Backend (hrm_db_user) to:
 * - Employee_Backend (hrm_db_employee) for attendance/clock-in
 * - HR_Backend (hrm_db_hr) for HR management
 * 
 * This ensures hrm_db_user is the PRIMARY source of truth
 * and all other backends stay in sync automatically
 */
@Service
public class SyncService {
    
    @Autowired(required = false)
    private RestTemplate restTemplate;
    
    private static final String EMPLOYEE_BACKEND_SYNC = "http://localhost:5003/api/sync/employee";
    private static final String HR_BACKEND_SYNC = "http://localhost:5004/api/sync/employee";
    private static final int RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 1000;
    
    /**
     * Sync employee to Employee_Backend (for attendance/clock-in)
     * This is called automatically when a new employee is created or updated
     *
     * @param employee Employee to sync
     * @return true if sync was successful, false otherwise
     */
    public boolean syncToEmployeeBackend(Employee employee) {
        return syncWithRetry(EMPLOYEE_BACKEND_SYNC, employee, "Employee_Backend");
    }
    
    /**
     * Sync employee to HR_Backend (for HR management)
     * Called after employee creation/update
     *
     * @param employee Employee to sync
     * @return true if sync was successful, false otherwise
     */
    public boolean syncToHRBackend(Employee employee) {
        return syncWithRetry(HR_BACKEND_SYNC, employee, "HR_Backend");
    }
    
    /**
     * Sync employee to all backends with retry logic
     *
     * @param employee Employee to sync
     */
    public void syncToAllBackends(Employee employee) {
        System.out.println("[SYNC] Syncing employee to all backends: " + employee.getEmail());
        
        boolean employeeBackendSynced = syncToEmployeeBackend(employee);
        boolean hrBackendSynced = syncToHRBackend(employee);
        
        if (employeeBackendSynced && hrBackendSynced) {
            System.out.println("[SYNC SUCCESS] Employee fully synced: " + employee.getEmail());
        } else if (employeeBackendSynced || hrBackendSynced) {
            System.out.println("[SYNC PARTIAL] Employee partially synced: " + employee.getEmail());
        } else {
            System.out.println("[SYNC WARNING] Employee sync failed to all backends: " + employee.getEmail());
        }
    }
    
    /**
     * Sync with retry logic - automatically retries if sync fails
     *
     * @param url Endpoint URL
     * @param employee Employee data
     * @param backendName Backend name for logging
     * @return true if sync succeeded, false otherwise
     */
    private boolean syncWithRetry(String url, Employee employee, String backendName) {
        try {
            if (employee == null || employee.getEmail() == null) {
                System.out.println("[SYNC] Cannot sync employee - missing email");
                return false;
            }
            
            for (int attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
                try {
                    System.out.println("[SYNC] Syncing to " + backendName + " (attempt " + attempt + "/" + RETRY_ATTEMPTS + "): " + employee.getEmail());
                    
                    if (restTemplate == null) {
                        System.out.println("[SYNC] RestTemplate not available, creating default");
                        restTemplate = new RestTemplate();
                    }
                    
                    // Prepare headers
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    
                    // Create request body
                    HttpEntity<Employee> request = new HttpEntity<>(employee, headers);
                    
                    // Send sync request
                    restTemplate.postForObject(url, request, String.class);
                    
                    System.out.println("[SYNC SUCCESS] Synced to " + backendName + ": " + employee.getEmail());
                    return true;
                    
                } catch (Exception attemptException) {
                    System.err.println("[SYNC ATTEMPT " + attempt + " FAILED] " + backendName + ": " + attemptException.getMessage());
                    
                    // Retry with delay if not last attempt
                    if (attempt < RETRY_ATTEMPTS) {
                        try {
                            Thread.sleep(RETRY_DELAY_MS * attempt);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }
            
            System.err.println("[SYNC ERROR] Failed to sync to " + backendName + " after " + RETRY_ATTEMPTS + " attempts: " + employee.getEmail());
            return false;
            
        } catch (Exception e) {
            System.err.println("[SYNC FATAL ERROR] " + backendName + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Health check - verify sync endpoints are reachable
     * @return true if at least one backend is reachable
     */
    public boolean healthCheck() {
        try {
            if (restTemplate == null) {
                restTemplate = new RestTemplate();
            }
            
            try {
                restTemplate.getForObject(EMPLOYEE_BACKEND_SYNC + "/health", String.class);
                System.out.println("[SYNC HEALTH] Employee_Backend is healthy");
                return true;
            } catch (Exception e) {
                System.err.println("[SYNC HEALTH WARNING] Employee_Backend unreachable");
            }
            
            return false;
        } catch (Exception e) {
            System.err.println("[SYNC HEALTH ERROR] " + e.getMessage());
            return false;
        }
    }
}
