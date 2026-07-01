package com.affin.hrm.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Salary entity — stores salary structure for an employee.
 */
@Entity
@Table(name = "salaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"employee"})
@EqualsAndHashCode(of = "id")
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal houseAllowance = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal medicalAllowance = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal providentFund = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal grossSalary;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
