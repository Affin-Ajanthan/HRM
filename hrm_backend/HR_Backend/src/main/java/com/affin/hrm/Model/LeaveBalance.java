package com.affin.hrm.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * LeaveBalance entity — tracks leave balance per employee per type per year.
 */
@Entity
@Table(name = "leave_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"employee", "leaveType"})
@EqualsAndHashCode(of = "id")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer totalDays;

    @Column(nullable = false)
    private Integer usedDays = 0;

    @Column(nullable = false)
    private Integer remainingDays;
}
