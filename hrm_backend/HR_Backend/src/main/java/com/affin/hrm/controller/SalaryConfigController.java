package com.affin.hrm.controller;

import com.affin.hrm.dto.AdditionalPaymentDTO;
import com.affin.hrm.dto.ApiResponse;
import com.affin.hrm.dto.BasicPaymentDTO;
import com.affin.hrm.dto.PaySheetDTO;
import com.affin.hrm.model.Employee;
import com.affin.hrm.service.AuthService;
import com.affin.hrm.service.SalaryConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HR salary configuration: job role salaries (basic payments), individual allowances /
 * deductions (additional payments) and the resulting pay sheet of each employee.
 */
@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class SalaryConfigController {

    private final SalaryConfigService salaryConfigService;
    private final AuthService authService;

    public SalaryConfigController(SalaryConfigService salaryConfigService, AuthService authService) {
        this.salaryConfigService = salaryConfigService;
        this.authService = authService;
    }

    @GetMapping("/basic-payments")
    public ResponseEntity<ApiResponse<List<BasicPaymentDTO>>> getBasicPayments(
            @RequestParam(required = false) Long departmentId) {
        Employee hr = authService.getCurrentEmployee();
        return ResponseEntity.ok(ApiResponse.success(
                salaryConfigService.getBasicPayments(hr.getCompany().getId(), departmentId)));
    }

    @PostMapping("/basic-payments")
    public ResponseEntity<ApiResponse<List<BasicPaymentDTO>>> saveBasicPayments(
            @RequestBody BasicPaymentDTO.SaveRequest request) {
        Employee hr = authService.getCurrentEmployee();
        List<BasicPaymentDTO> saved = salaryConfigService.saveBasicPayments(request, hr);
        return ResponseEntity.ok(ApiResponse.success(saved, saved.size() + " salary row(s) saved"));
    }

    @GetMapping("/additional-payments")
    public ResponseEntity<ApiResponse<List<AdditionalPaymentDTO>>> getAdditionalPayments(
            @RequestParam(required = false) String employeeEmail) {
        Employee hr = authService.getCurrentEmployee();
        return ResponseEntity.ok(ApiResponse.success(
                salaryConfigService.getAdditionalPayments(hr.getCompany().getId(), employeeEmail)));
    }

    @PostMapping("/additional-payments")
    public ResponseEntity<ApiResponse<List<AdditionalPaymentDTO>>> saveAdditionalPayments(
            @RequestBody AdditionalPaymentDTO.SaveRequest request) {
        Employee hr = authService.getCurrentEmployee();
        List<AdditionalPaymentDTO> saved = salaryConfigService.saveAdditionalPayments(request, hr);
        return ResponseEntity.ok(ApiResponse.success(saved, saved.size() + " allowance/deduction(s) saved"));
    }

    /** Body: the employees to work pay sheets out for, with their details from the user database. */
    @PostMapping("/payroll/sheet")
    public ResponseEntity<ApiResponse<List<PaySheetDTO>>> getPaySheets(
            @RequestBody List<PaySheetDTO.EmployeeRef> employees) {
        Employee hr = authService.getCurrentEmployee();
        return ResponseEntity.ok(ApiResponse.success(
                salaryConfigService.getPaySheets(hr.getCompany().getId(), employees)));
    }
}
