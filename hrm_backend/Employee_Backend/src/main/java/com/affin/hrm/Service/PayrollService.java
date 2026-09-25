package com.affin.hrm.service;

import com.affin.hrm.dto.PaySheetDTO;
import com.affin.hrm.dto.PayslipDTO;
import com.affin.hrm.model.Employee;
import com.affin.hrm.model.Payslip;
import com.affin.hrm.model.Salary;
import com.affin.hrm.model.Attendance;
import com.affin.hrm.repository.EmployeeRepository;
import com.affin.hrm.repository.PayslipRepository;
import com.affin.hrm.repository.SalaryRepository;
import com.affin.hrm.repository.AttendanceRepository;
import com.affin.hrm.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final PayslipRepository payslipRepository;
    private final SalaryRepository salaryRepository;
    private final AttendanceRepository attendanceRepository;
    private final HrServiceClient hrServiceClient;

    public PayrollService(EmployeeRepository employeeRepository,
                          PayslipRepository payslipRepository,
                          SalaryRepository salaryRepository,
                          AttendanceRepository attendanceRepository,
                          HrServiceClient hrServiceClient) {
        this.employeeRepository = employeeRepository;
        this.payslipRepository = payslipRepository;
        this.salaryRepository = salaryRepository;
        this.attendanceRepository = attendanceRepository;
        this.hrServiceClient = hrServiceClient;
    }

    public Payslip getOrCreatePayslip(Long employeeId, Integer month, Integer year) {
        return payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .orElseGet(() -> generatePayslip(employeeId, month, year));
    }

    public List<Payslip> getEmployeePayslips(Long employeeId) {
        return payslipRepository.findByEmployeeId(employeeId);
    }

    /** The employee's payslips as DTOs, newest month first. */
    @Transactional(readOnly = true)
    public List<PayslipDTO> getEmployeePayslipDTOs(Long employeeId) {
        return payslipRepository.findByEmployeeId(employeeId).stream()
                .sorted(Comparator.comparing(Payslip::getYear).thenComparing(Payslip::getMonth).reversed())
                .map(PayrollService::toDTO)
                .collect(Collectors.toList());
    }

    public PayslipDTO getOrCreatePayslipDTO(Long employeeId, Integer month, Integer year) {
        return toDTO(getOrCreatePayslip(employeeId, month, year));
    }

    /**
     * Generates the month's payslips for the given employees, matched by email (employee ids and
     * company ids differ between the service databases). Payslips that already exist are kept.
     */
    public List<PayslipDTO> generateBulkPayrollForEmails(List<String> emails, Integer month, Integer year) {
        List<PayslipDTO> generated = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String email : emails) {
            if (email == null || email.isBlank() || !seen.add(email.trim().toLowerCase())) continue;
            employeeRepository.findByEmailIgnoreCase(email.trim())
                    .filter(emp -> emp.getStatus() == Employee.EmployeeStatus.ACTIVE)
                    .ifPresent(emp -> generated.add(toDTO(getOrCreatePayslip(emp.getId(), month, year))));
        }
        return generated;
    }

    public Payslip generatePayslip(Long employeeId, Integer month, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Salary HR set for the employee's job role plus their individual allowances / deductions
        Optional<PaySheetDTO> paySheet = hrServiceClient.findPaySheet(employee.getEmail())
                .filter(PaySheetDTO::isConfigured);
        if (paySheet.isPresent()) {
            return payslipRepository.save(fromPaySheet(employee, paySheet.get(), month, year));
        }

        // Get salary structure or create default
        Salary salary = salaryRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> createDefaultSalary(employee));

        // Calculate present days
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        
        long presentDaysCount = attendances.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();

        int totalWorkingDays = 22; // Assumption
        int presentDays = presentDaysCount > 0 ? (int) presentDaysCount : totalWorkingDays; // Fallback to full month if no attendance
        int absentDays = Math.max(0, totalWorkingDays - presentDays);

        BigDecimal basic = salary.getBasicSalary();
        BigDecimal allowances = salary.getHouseAllowance()
                .add(salary.getTransportAllowance())
                .add(salary.getMedicalAllowance())
                .add(salary.getOtherAllowances());

        BigDecimal standardDeductions = salary.getTax().add(salary.getProvidentFund()).add(salary.getOtherDeductions());
        
        // Unpaid leave deduction logic
        BigDecimal dailyRate = basic.divide(BigDecimal.valueOf(totalWorkingDays), 2, RoundingMode.HALF_UP);
        BigDecimal absentDeduction = dailyRate.multiply(BigDecimal.valueOf(absentDays));
        BigDecimal totalDeductions = standardDeductions.add(absentDeduction);

        BigDecimal gross = basic.add(allowances);
        BigDecimal net = gross.subtract(totalDeductions);

        Payslip payslip = new Payslip();
        payslip.setEmployee(employee);
        payslip.setMonth(month);
        payslip.setYear(year);
        payslip.setBasicSalary(basic);
        payslip.setTotalAllowances(allowances);
        payslip.setTotalDeductions(totalDeductions);
        payslip.setGrossSalary(gross);
        payslip.setNetSalary(net);
        payslip.setWorkingDays(totalWorkingDays);
        payslip.setPresentDays(presentDays);
        payslip.setAbsentDays(absentDays);
        payslip.setStatus(Payslip.PayslipStatus.PAID);

        return payslipRepository.save(payslip);
    }

    public List<Payslip> generateBulkPayroll(Long companyId, Integer month, Integer year) {
        List<Employee> employees = employeeRepository.findByCompanyId(companyId);
        List<Payslip> generated = new ArrayList<>();
        for (Employee emp : employees) {
            if (emp.getStatus() == Employee.EmployeeStatus.ACTIVE) {
                generated.add(getOrCreatePayslip(emp.getId(), month, year));
            }
        }
        return generated;
    }

    /**
     * Payslip from the HR pay sheet: amounts exactly as HR set them (net = basic + total allowance
     * - total deduction), so it matches the HR payroll page. Attendance days are recorded for reference.
     */
    private Payslip fromPaySheet(Employee employee, PaySheetDTO sheet, Integer month, Integer year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        int presentDays = (int) attendanceRepository.findByEmployeeIdAndDateBetween(employee.getId(), startDate, endDate).stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        int totalWorkingDays = 22; // Assumption, same as the attendance-based payslips

        BigDecimal basic = zeroIfNull(sheet.getBasicSalary());
        BigDecimal allowances = zeroIfNull(sheet.getTotalAllowance());
        BigDecimal deductions = zeroIfNull(sheet.getTotalDeduction());

        Payslip payslip = new Payslip();
        payslip.setEmployee(employee);
        payslip.setMonth(month);
        payslip.setYear(year);
        payslip.setBasicSalary(basic);
        payslip.setTotalAllowances(allowances);
        payslip.setTotalDeductions(deductions);
        payslip.setGrossSalary(basic.add(allowances));
        payslip.setNetSalary(zeroIfNull(sheet.getNetTotal()));
        payslip.setWorkingDays(totalWorkingDays);
        payslip.setPresentDays(presentDays);
        payslip.setAbsentDays(Math.max(0, totalWorkingDays - presentDays));
        payslip.setStatus(Payslip.PayslipStatus.PAID);
        return payslip;
    }

    private static BigDecimal zeroIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    public static PayslipDTO toDTO(Payslip p) {
        PayslipDTO dto = new PayslipDTO();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployee() != null ? p.getEmployee().getId() : null);
        dto.setMonth(p.getMonth());
        dto.setYear(p.getYear());
        dto.setBasicSalary(p.getBasicSalary());
        dto.setTotalAllowances(p.getTotalAllowances());
        dto.setTotalDeductions(p.getTotalDeductions());
        dto.setGrossSalary(p.getGrossSalary());
        dto.setNetSalary(p.getNetSalary());
        dto.setWorkingDays(p.getWorkingDays());
        dto.setPresentDays(p.getPresentDays());
        dto.setAbsentDays(p.getAbsentDays());
        dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        return dto;
    }

    private Salary createDefaultSalary(Employee employee) {
        BigDecimal basic = BigDecimal.valueOf(50000.00);
        BigDecimal house = BigDecimal.valueOf(5000.00);
        BigDecimal transport = BigDecimal.valueOf(3000.00);
        BigDecimal medical = BigDecimal.valueOf(2000.00);
        BigDecimal other = BigDecimal.valueOf(0.00);
        BigDecimal tax = BigDecimal.valueOf(1000.00);
        BigDecimal pf = BigDecimal.valueOf(2000.00);

        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setBasicSalary(basic);
        salary.setHouseAllowance(house);
        salary.setTransportAllowance(transport);
        salary.setMedicalAllowance(medical);
        salary.setOtherAllowances(other);
        salary.setTax(tax);
        salary.setProvidentFund(pf);
        salary.setOtherDeductions(BigDecimal.ZERO);
        salary.setGrossSalary(basic.add(house).add(transport).add(medical).add(other));
        salary.setNetSalary(salary.getGrossSalary().subtract(tax).subtract(pf));

        return salaryRepository.save(salary);
    }
}
