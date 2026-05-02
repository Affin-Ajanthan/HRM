package com.affin.hrm.DTO;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String company;
    private String status;
    private LocalDate joinedOn;
}

