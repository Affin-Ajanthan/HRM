package com.affin.hrm.controller;

import com.affin.hrm.dto.*;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.*;
import com.affin.hrm.repository.*;
import com.affin.hrm.service.EmployeeService;
import com.affin.hrm.service.PayrollService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Internal API controller — for inter-service communication ONLY.
 * These endpoints are NOT protected by JWT (service-to-service calls).
 * Should NOT be exposed to the public internet in production.
 */
@RestController
@RequestMapping("/api/internal")
public class InternalController {

    private static final Logger log = LoggerFactory.getLogger(InternalController.class);

    private final EmployeeRepository employeeRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final EmployeeService employeeService;
    private final PayrollService payrollService;
    private final SalaryRepository salaryRepository;
    private final ModelMapper modelMapper;

    public InternalController(EmployeeRepository employeeRepository,
                              CompanyRepository companyRepository,
                              DepartmentRepository departmentRepository,
                              AttendanceRepository attendanceRepository,
                              LeaveApplicationRepository leaveApplicationRepository,
                              EmployeeService employeeService,
                              PayrollService payrollService,
                              SalaryRepository salaryRepository,
                              ModelMapper modelMapper) {
        this.employeeRepository = employeeRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.employeeService = employeeService;
        this.payrollService = payrollService;
        this.salaryRepository = salaryRepository;
        this.modelMapper = modelMapper;
    }

    // ── Dashboard Statistics ─────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", employeeRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalDepartments", departmentRepository.count());
        stats.put("presentToday", attendanceRepository.countPresentByCompanyIdAndDate(null, LocalDate.now()));
        stats.put("pendingLeaves", leaveApplicationRepository.countByCompanyIdAndStatus(null, LeaveApplication.LeaveStatus.PENDING));
        log.debug("Internal stats requested");
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getCompanyStats(@PathVariable Long companyId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", employeeRepository.countByCompanyIdAndStatus(companyId, Employee.EmployeeStatus.ACTIVE));
        stats.put("presentToday", attendanceRepository.countPresentByCompanyIdAndDate(companyId, LocalDate.now()));
        stats.put("pendingLeaves", leaveApplicationRepository.countByCompanyIdAndStatus(companyId, LeaveApplication.LeaveStatus.PENDING));
        return ResponseEntity.ok(stats);
    }

    // ── Employees ────────────────────────────────────────────────

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        List<EmployeeDTO> employees = employeeRepository.findAll().stream()
                .map(this::convertToEmployeeDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return ResponseEntity.ok(convertToEmployeeDTO(employee));
    }

    @GetMapping("/employees/company/{companyId}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByCompany(@PathVariable Long companyId) {
        List<EmployeeDTO> employees = employeeRepository.findByCompanyId(companyId).stream()
                .map(this::convertToEmployeeDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employees/admins")
    public ResponseEntity<List<EmployeeDTO>> getAdminUsers() {
        List<EmployeeDTO> admins = employeeRepository.findAll().stream()
                .filter(e -> e.getRole() == Employee.Role.ADMIN || e.getRole() == Employee.Role.HR_MANAGER)
                .map(this::convertToEmployeeDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(admins);
    }

    @PutMapping("/employees/{id}/role")
    public ResponseEntity<EmployeeDTO> updateEmployeeRole(@PathVariable Long id, @RequestParam String role) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setRole(Employee.Role.valueOf(role.trim().toUpperCase()));
        employeeRepository.save(employee);
        log.info("Internal: Updated role for {} to {}", employee.getEmail(), role);
        return ResponseEntity.ok(convertToEmployeeDTO(employee));
    }

    @PutMapping("/employees/{id}/status")
    public ResponseEntity<EmployeeDTO> updateEmployeeStatus(@PathVariable Long id, @RequestParam String status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setStatus(Employee.EmployeeStatus.valueOf(status.trim().toUpperCase()));
        employeeRepository.save(employee);
        log.info("Internal: Updated status for {} to {}", employee.getEmail(), status);
        return ResponseEntity.ok(convertToEmployeeDTO(employee));
    }

    // ── Companies ────────────────────────────────────────────────

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        List<CompanyDTO> companies = companyRepository.findAll().stream()
                .map(c -> {
                    CompanyDTO dto = modelMapper.map(c, CompanyDTO.class);
                    dto.setEmployeeCount(employeeRepository.countByCompanyIdAndStatus(c.getId(), Employee.EmployeeStatus.ACTIVE));
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        CompanyDTO dto = modelMapper.map(company, CompanyDTO.class);
        dto.setEmployeeCount(employeeRepository.countByCompanyIdAndStatus(id, Employee.EmployeeStatus.ACTIVE));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO dto) {
        Company company = new Company();
        company.setCompanyName(dto.getCompanyName());
        company.setRegistrationNumber(dto.getRegistrationNumber());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setAddress(dto.getAddress());
        company.setWebsite(dto.getWebsite());
        company.setStatus(Company.CompanyStatus.PENDING);
        Company saved = companyRepository.save(company);
        log.info("Internal: Created company {} ({})", saved.getCompanyName(), saved.getRegistrationNumber());
        return ResponseEntity.ok(modelMapper.map(saved, CompanyDTO.class));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Long id, @RequestBody CompanyDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        if (dto.getCompanyName() != null) company.setCompanyName(dto.getCompanyName());
        if (dto.getEmail() != null) company.setEmail(dto.getEmail());
        if (dto.getPhone() != null) company.setPhone(dto.getPhone());
        if (dto.getAddress() != null) company.setAddress(dto.getAddress());
        if (dto.getWebsite() != null) company.setWebsite(dto.getWebsite());
        if (dto.getStatus() != null) company.setStatus(Company.CompanyStatus.valueOf(dto.getStatus()));
        Company saved = companyRepository.save(company);
        return ResponseEntity.ok(modelMapper.map(saved, CompanyDTO.class));
    }

    // ── Departments ──────────────────────────────────────────────

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDTO>> getAllDepartments() {
        List<DepartmentDTO> departments = departmentRepository.findAll().stream()
                .map(d -> modelMapper.map(d, DepartmentDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/departments/company/{companyId}")
    public ResponseEntity<List<DepartmentDTO>> getDepartmentsByCompany(@PathVariable Long companyId) {
        List<DepartmentDTO> departments = departmentRepository.findByCompanyId(companyId).stream()
                .map(d -> modelMapper.map(d, DepartmentDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    // ── Attendance ───────────────────────────────────────────────

    @GetMapping("/attendance/daily")
    public ResponseEntity<List<AttendanceDTO>> getDailyAttendance(@RequestParam(required = false) String date,
                                                                   @RequestParam(required = false) Long companyId) {
        LocalDate targetDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        List<Attendance> attendances;
        if (companyId != null) {
            attendances = attendanceRepository.findByCompanyIdAndDate(companyId, targetDate);
        } else {
            attendances = attendanceRepository.findAll().stream()
                    .filter(a -> a.getDate().equals(targetDate))
                    .collect(Collectors.toList());
        }
        List<AttendanceDTO> dtos = attendances.stream()
                .map(a -> modelMapper.map(a, AttendanceDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ── Leave ────────────────────────────────────────────────────

    @GetMapping("/leave/pending")
    public ResponseEntity<List<LeaveApplicationDTO>> getPendingLeaves(@RequestParam(required = false) Long companyId) {
        List<LeaveApplication> leaves;
        if (companyId != null) {
            leaves = leaveApplicationRepository.findByCompanyIdAndStatus(companyId, LeaveApplication.LeaveStatus.PENDING);
        } else {
            leaves = leaveApplicationRepository.findAll().stream()
                    .filter(l -> l.getStatus() == LeaveApplication.LeaveStatus.PENDING)
                    .collect(Collectors.toList());
        }
        List<LeaveApplicationDTO> dtos = leaves.stream()
                .map(l -> modelMapper.map(l, LeaveApplicationDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ── Private Helpers ──────────────────────────────────────────

    private EmployeeDTO convertToEmployeeDTO(Employee employee) {
        EmployeeDTO dto = modelMapper.map(employee, EmployeeDTO.class);
        dto.setPassword(null);
        if (employee.getCompany() != null) {
            dto.setCompanyId(employee.getCompany().getId());
            dto.setCompanyName(employee.getCompany().getCompanyName());
        }
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        }
        if (employee.getGender() != null) dto.setGender(employee.getGender().name());
        if (employee.getRole() != null) dto.setRole(employee.getRole().name());
        if (employee.getStatus() != null) dto.setStatus(employee.getStatus().name());
        return dto;
    }

    // ── Internal Payroll & Salary Endpoints ────────────────────────

    @PostMapping("/payroll/generate")
    public ResponseEntity<List<Payslip>> generateBulkPayroll(@RequestParam Long companyId,
                                                             @RequestParam Integer month,
                                                             @RequestParam Integer year) {
        log.info("Internal: Bulk payroll generation requested for company: {}, month: {}, year: {}", companyId, month, year);
        List<Payslip> generated = payrollService.generateBulkPayroll(companyId, month, year);
        return ResponseEntity.ok(generated);
    }

    @GetMapping("/salaries")
    public ResponseEntity<List<Salary>> getAllSalaries() {
        return ResponseEntity.ok(salaryRepository.findAll());
    }

    @GetMapping("/salaries/employee/{id}")
    public ResponseEntity<Salary> getSalaryByEmployeeId(@PathVariable Long id) {
        Salary salary = salaryRepository.findByEmployeeId(id).orElse(null);
        return ResponseEntity.ok(salary);
    }

    @PostMapping("/salaries")
    public ResponseEntity<Salary> saveSalary(@RequestBody Salary salary) {
        if (salary.getEmployee() != null && salary.getEmployee().getId() != null) {
            Employee emp = employeeRepository.findById(salary.getEmployee().getId()).orElse(null);
            if (emp != null) {
                salary.setEmployee(emp);
                BigDecimal basic = salary.getBasicSalary() != null ? salary.getBasicSalary() : BigDecimal.ZERO;
                BigDecimal house = salary.getHouseAllowance() != null ? salary.getHouseAllowance() : BigDecimal.ZERO;
                BigDecimal transport = salary.getTransportAllowance() != null ? salary.getTransportAllowance() : BigDecimal.ZERO;
                BigDecimal medical = salary.getMedicalAllowance() != null ? salary.getMedicalAllowance() : BigDecimal.ZERO;
                BigDecimal other = salary.getOtherAllowances() != null ? salary.getOtherAllowances() : BigDecimal.ZERO;
                BigDecimal tax = salary.getTax() != null ? salary.getTax() : BigDecimal.ZERO;
                BigDecimal pf = salary.getProvidentFund() != null ? salary.getProvidentFund() : BigDecimal.ZERO;
                
                salary.setGrossSalary(basic.add(house).add(transport).add(medical).add(other));
                salary.setNetSalary(salary.getGrossSalary().subtract(tax).subtract(pf));

                // If already exists, update existing
                Salary existing = salaryRepository.findByEmployeeId(emp.getId()).orElse(null);
                if (existing != null) {
                    existing.setBasicSalary(basic);
                    existing.setHouseAllowance(house);
                    existing.setTransportAllowance(transport);
                    existing.setMedicalAllowance(medical);
                    existing.setOtherAllowances(other);
                    existing.setTax(tax);
                    existing.setProvidentFund(pf);
                    existing.setGrossSalary(salary.getGrossSalary());
                    existing.setNetSalary(salary.getNetSalary());
                    return ResponseEntity.ok(salaryRepository.save(existing));
                }
                return ResponseEntity.ok(salaryRepository.save(salary));
            }
        }
        return ResponseEntity.badRequest().build();
    }
}
