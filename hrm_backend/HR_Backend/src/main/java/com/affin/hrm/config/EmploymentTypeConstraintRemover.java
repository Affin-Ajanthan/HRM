package com.affin.hrm.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * employees.employment_type used to be an enum (FULL_TIME, PART_TIME, ...) and still carries its
 * check constraint. It now holds the names HR defines (employment_types.name, e.g. "Full-Time"),
 * which that constraint rejects, so drop it on startup. Does nothing once it is gone.
 */
@Component
public class EmploymentTypeConstraintRemover implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EmploymentTypeConstraintRemover.class);

    private final JdbcTemplate jdbcTemplate;

    public EmploymentTypeConstraintRemover(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employment_type_check");
        } catch (Exception e) {
            log.warn("Could not drop employees_employment_type_check: {}", e.getMessage());
        }
    }
}
