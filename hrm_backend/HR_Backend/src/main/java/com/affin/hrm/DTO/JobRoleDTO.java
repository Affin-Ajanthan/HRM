package com.affin.hrm.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobRoleDTO {

    private Long id;

    @NotBlank(message = "Job role title is required")
    private String title;

    private String description;
    private Double minSalary;
    private Double maxSalary;
    private Long departmentId;
    private String departmentName;
    private Boolean active;
}