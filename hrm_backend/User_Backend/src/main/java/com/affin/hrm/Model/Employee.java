package com.affin.hrm.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private String nic;
    private LocalDate dob;
    private String address;
    private String phone;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.EMPLOYEE; // ADMIN, HR_MANAGER, EMPLOYEE

    private String designation;

    // Full-time, Part-time, Contract, Internship, Temporary (see EMPLOYMENT_TYPES)
    @Column(name = "employment_type", length = 30)
    private String employmentType;

    private LocalDate joiningDate;
    private LocalDate terminationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status = EmployeeStatus.ACTIVE; // ACTIVE, INACTIVE, TERMINATED

    private String resetPasswordToken;
    private LocalDateTime resetPasswordTokenExpiry;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static final java.util.List<String> EMPLOYMENT_TYPES =
            java.util.List.of("Full-time", "Part-time", "Contract", "Internship", "Temporary");

    /** Returns the canonical value, null when blank, or throws when not one of EMPLOYMENT_TYPES. */
    public static String normalizeEmploymentType(String value) {
        if (value == null || value.isBlank()) return null;
        String v = value.trim();
        return EMPLOYMENT_TYPES.stream()
                .filter(t -> t.equalsIgnoreCase(v))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid employment type '" + value + "'. Allowed: " + String.join(", ", EMPLOYMENT_TYPES)));
    }

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public enum Role {
        ADMIN, HR_MANAGER, EMPLOYEE
    }

    public enum EmployeeStatus {
        ACTIVE, INACTIVE, TERMINATED
    }
}
