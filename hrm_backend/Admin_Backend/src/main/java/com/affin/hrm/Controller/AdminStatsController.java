package com.affin.hrm.Controller;

import com.affin.hrm.DTO.AdminStatsDTO;
import com.affin.hrm.Service.AdminStatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminStatsController {
    private final AdminStatsService adminStatsService;

    public AdminStatsController(AdminStatsService adminStatsService) {
        this.adminStatsService = adminStatsService;
    }

    @GetMapping("/stats")
    public AdminStatsDTO getStats() {
        return adminStatsService.getStats();
    }
}

