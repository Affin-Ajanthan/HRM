package com.affin.hrm.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String employeeId;
    private String nic;
    private LocalDate dob;
    private String address;
    private String phone;
    private String gender;
    private String role;
    private String department;
    private String designation;
    private LocalDate joiningDate;
}
