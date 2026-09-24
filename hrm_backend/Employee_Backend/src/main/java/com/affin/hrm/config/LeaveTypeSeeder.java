package com.affin.hrm.config;

import com.affin.hrm.model.LeaveType;
import com.affin.hrm.repository.LeaveTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the default, company-independent leave types on a fresh database so employees
 * can apply for leave before HR has configured anything. Skips if any leave type exists.
 */
@Component
public class LeaveTypeSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LeaveTypeSeeder.class);

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeSeeder(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (leaveTypeRepository.count() > 0) {
                return;
            }
            seed("Annual Leave", "Planned time off", 15);
            seed("Sick Leave", "Illness or medical appointments", 10);
            seed("Casual Leave", "Short personal matters", 7);
            log.info("Seeded default leave types");
        } catch (Exception e) {
            // Never block startup over seed data
            log.warn("Could not seed default leave types: {}", e.getMessage());
        }
    }

    private void seed(String name, String description, int daysPerYear) {
        LeaveType type = new LeaveType();
        type.setName(name);
        type.setDescription(description);
        type.setDefaultDaysPerYear(daysPerYear);
        type.setActive(true);
        leaveTypeRepository.save(type);
    }
}
