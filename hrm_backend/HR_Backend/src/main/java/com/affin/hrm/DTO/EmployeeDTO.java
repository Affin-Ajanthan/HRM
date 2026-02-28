package com.affin.hrm.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String employeeId;
    private String fullName;
    private String email;
    private String password;
    private String nic;
    private LocalDate dob;
    private String address;
    private String phone;
    private String gender;
    private String role;
    private String designation;
    private LocalDate joiningDate;
    private LocalDate terminationDate;
    private String departmentName;  // free-text
    private Long departmentId;      // entity
    private Long companyId;
    private String companyName;
    private String employmentType;
    private String status;

    // REMOVE any getDepartment() or setDepartment() methods — they don't exist anymore
}