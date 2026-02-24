package com.affin.hrm.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private Long id;
    private String employeeId;
    private String fullName;
    private String email;
    private String role;
    private String gender;
    private String designation;
    private LocalDate joiningDate;
    private Long companyId;
    private String companyName;
    private Long departmentId;
    private String departmentName;
}

