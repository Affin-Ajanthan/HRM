package com.affin.hrm.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeIdNumber;
    private LocalDate date;
    private LocalTime clockInTime;
    private LocalTime clockOutTime;
    private String attendanceType;
    private String clockInLocation;
    private String clockOutLocation;
    private String status;
    private String remarks;
    private Boolean isAdjustmentRequested;
    private String adjustmentReason;
    private String adjustmentStatus;
}
