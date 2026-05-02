package com.affin.hrm.Controller;

import com.affin.hrm.DTO.SystemUserDTO;
import com.affin.hrm.Service.SystemUserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class SystemUserController {
    private final SystemUserService systemUserService;

    public SystemUserController(SystemUserService systemUserService) {
        this.systemUserService = systemUserService;
    }

    @GetMapping
    public List<SystemUserDTO> getSystemUsers() {
        return systemUserService.getSystemUsers();
    }
}

