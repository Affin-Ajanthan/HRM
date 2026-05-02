package com.affin.hrm.Controller;

import com.affin.hrm.DTO.CompanySummaryDTO;
import com.affin.hrm.Service.CompanyService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanySummaryDTO> getCompanies() {
        return companyService.getCompanies();
    }
}

