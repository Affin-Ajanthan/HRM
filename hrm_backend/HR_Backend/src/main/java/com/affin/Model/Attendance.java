package com.affin.hrm.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private AttendanceType attendanceType = AttendanceType.MANUAL; // MANUAL, GPS

    private String clockInLocation; // GPS coordinates for GPS-based attendance
    private String clockOutLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PRESENT; // PRESENT, ABSENT, LATE, HALF_DAY

    private String remarks;
    private Boolean isAdjustmentRequested = false;
    private String adjustmentReason;

    @Enumerated(EnumType.STRING)
    private AdjustmentStatus adjustmentStatus; // PENDING, APPROVED, REJECTED

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
