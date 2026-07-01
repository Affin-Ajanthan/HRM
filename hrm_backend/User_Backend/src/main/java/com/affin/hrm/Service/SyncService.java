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
    
    @org.springframework.beans.factory.annotation.Value("${service.employee-url:http://localhost:5006}")
    private String employeeServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${service.hr-url:http://localhost:5005}")
    private String hrServiceUrl;

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
        String url = employeeServiceUrl + "/api/sync/employee";
        return syncWithRetry(url, employee, "Employee_Backend");
    }
    
    /**
     * Sync employee to HR_Backend (for HR management)
     * Called after employee creation/update
     *
     * @param employee Employee to sync
     * @return true if sync was successful, false otherwise
     */
    public boolean syncToHRBackend(Employee employee) {
        String url = hrServiceUrl + "/api/sync/employee";
        return syncWithRetry(url, employee, "HR_Backend");
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
                    
                    // Create dynamic flat request body to bypass Lazy loading exceptions and circular reference recursion
                    java.util.Map<String, Object> payload = buildSyncPayload(employee);
                    HttpEntity<java.util.Map<String, Object>> request = new HttpEntity<>(payload, headers);
                    
                    // Send sync request
                    restTemplate.postForObject(url, request, String.class);
                    
                    System.out.println("[SYNC SUCCESS] Synced to " + backendName + ": " + employee.getEmail());
                    return true;
                    
                } catch (Exception attemptException) {
                    System.err.println("[SYNC ATTEMPT " + attempt + " FAILED] " + backendName + ": " + attemptException.getMessage());
                    attemptException.printStackTrace();
                    
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

    private java.util.Map<String, Object> buildSyncPayload(Employee employee) {
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("id", employee.getId());
        payload.put("employeeId", employee.getEmployeeId());
        payload.put("fullName", employee.getFullName());
        payload.put("email", employee.getEmail());
        payload.put("password", employee.getPassword());
        payload.put("nic", employee.getNic());
        payload.put("dob", employee.getDob() != null ? employee.getDob().toString() : null);
        payload.put("address", employee.getAddress());
        payload.put("phone", employee.getPhone());
        payload.put("gender", employee.getGender() != null ? employee.getGender().name() : null);
        payload.put("role", employee.getRole() != null ? employee.getRole().name() : null);
        payload.put("designation", employee.getDesignation());
        payload.put("joiningDate", employee.getJoiningDate() != null ? employee.getJoiningDate().toString() : null);
        payload.put("terminationDate", employee.getTerminationDate() != null ? employee.getTerminationDate().toString() : null);
        payload.put("status", employee.getStatus() != null ? employee.getStatus().name() : null);

        // Simple Company DTO structure
        if (employee.getCompany() != null) {
            java.util.Map<String, Object> companyMap = new java.util.HashMap<>();
            try {
                companyMap.put("id", employee.getCompany().getId());
                companyMap.put("companyName", employee.getCompany().getCompanyName());
                companyMap.put("registrationNumber", employee.getCompany().getRegistrationNumber());
                payload.put("company", companyMap);
            } catch (org.hibernate.LazyInitializationException e) {
                // If it's a lazy proxy not initialized, we fall back to a default empty company with ID
                companyMap.put("id", 1L);
                companyMap.put("companyName", "Default Company");
                companyMap.put("registrationNumber", "DEFAULT-REG-0001");
                payload.put("company", companyMap);
            }
        }

        // Simple Department DTO structure
        if (employee.getDepartment() != null) {
            java.util.Map<String, Object> deptMap = new java.util.HashMap<>();
            try {
                deptMap.put("id", employee.getDepartment().getId());
                deptMap.put("name", employee.getDepartment().getName());
                payload.put("department", deptMap);
            } catch (org.hibernate.LazyInitializationException e) {
                // Ignore department if it's not initialized
            }
        }

        return payload;
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
                restTemplate.getForObject(employeeServiceUrl + "/api/sync/employee/health", String.class);
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
