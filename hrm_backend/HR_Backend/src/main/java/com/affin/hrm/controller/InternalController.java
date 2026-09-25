package com.affin.hrm.controller;

import com.affin.hrm.dto.LeaveEntitlementDTO;
import com.affin.hrm.repository.EmployeeRepository;
import com.affin.hrm.service.LeaveConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Internal API controller — for inter-service communication ONLY.
 * These endpoints are NOT protected by JWT (service-to-service calls).
 * Should NOT be exposed to the public internet in production.
 */
@RestController
@RequestMapping("/api/internal")
public class InternalController {

    private static final Logger log = LoggerFactory.getLogger(InternalController.class);

    private final EmployeeRepository employeeRepository;
    private final LeaveConfigService leaveConfigService;

    public InternalController(EmployeeRepository employeeRepository, LeaveConfigService leaveConfigService) {
        this.employeeRepository = employeeRepository;
        this.leaveConfigService = leaveConfigService;
    }

    /**
     * Leave an employee is entitled to from their job role, used by Employee_Backend for leave
     * balances and applications. Employee ids differ between databases, so it is looked up by email.
     */
    @GetMapping("/leave-entitlements")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LeaveEntitlementDTO>> getLeaveEntitlements(@RequestParam String email) {
        return employeeRepository.findByEmailIgnoreCase(email.trim())
                .map(e -> ResponseEntity.ok(leaveConfigService.getEntitlements(e)))
                .orElseGet(() -> {
                    log.warn("Internal: leave entitlements requested for unknown employee {}", email);
                    return ResponseEntity.ok(List.of());
                });
    }
}
