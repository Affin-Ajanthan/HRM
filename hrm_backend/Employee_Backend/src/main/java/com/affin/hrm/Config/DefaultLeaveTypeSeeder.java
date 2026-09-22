package com.affin.hrm.config;

import com.affin.hrm.model.LeaveType;
import com.affin.hrm.repository.LeaveTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DefaultLeaveTypeSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultLeaveTypeSeeder.class);
    private final LeaveTypeRepository leaveTypeRepository;

    public DefaultLeaveTypeSeeder(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    public void run(String... args) {
        if (leaveTypeRepository.count() == 0) {
            log.info("No LeaveTypes found. Seeding default LeaveTypes into database...");
            
            LeaveType annual = new LeaveType();
            annual.setName("Annual Leave");
            annual.setDescription("Standard annual paid leave");
            annual.setDefaultDaysPerYear(14);
            annual.setCarryForward(true);
            annual.setMaxCarryForwardDays(7);
            
            LeaveType sick = new LeaveType();
            sick.setName("Sick Leave");
            sick.setDescription("Paid time off for illness");
            sick.setDefaultDaysPerYear(10);
            sick.setCarryForward(false);
            
            LeaveType casual = new LeaveType();
            casual.setName("Casual Leave");
            casual.setDescription("Short time off for personal reasons");
            casual.setDefaultDaysPerYear(5);
            casual.setCarryForward(false);
            
            LeaveType maternity = new LeaveType();
            maternity.setName("Maternity Leave");
            maternity.setDescription("Paid leave for new mothers");
            maternity.setDefaultDaysPerYear(90);
            maternity.setCarryForward(false);
            
            leaveTypeRepository.saveAll(List.of(annual, sick, casual, maternity));
            log.info("Default LeaveTypes seeded successfully.");
        }
    }
}
