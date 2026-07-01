package com.affin.hrm.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Attendance entity — tracks employee clock-in/out records.
 */
@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"employee"})
@EqualsAndHashCode(of = "id")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    private LocalTime clockInTime;
    private LocalTime clockOutTime;

    @Enumerated(EnumType.STRING)
    private AttendanceType attendanceType = AttendanceType.MANUAL;

    private String clockInLocation;
    private String clockOutLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private String remarks;
    private Boolean isAdjustmentRequested = false;
    private String adjustmentReason;

    @Enumerated(EnumType.STRING)
    private AdjustmentStatus adjustmentStatus;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AttendanceType {
        MANUAL, GPS
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY
    }

    public enum AdjustmentStatus {
        PENDING, APPROVED, REJECTED
    }
}
