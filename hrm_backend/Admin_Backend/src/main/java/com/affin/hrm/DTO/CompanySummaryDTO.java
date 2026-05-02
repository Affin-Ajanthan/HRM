package com.affin.hrm.DTO;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanySummaryDTO {
    private Long id;
    private String name;
    private String industry;
    private String contact;
    private String phone;
    private Integer employees;
    private String address;
    private LocalDate submittedOn;
    private String status;
}

