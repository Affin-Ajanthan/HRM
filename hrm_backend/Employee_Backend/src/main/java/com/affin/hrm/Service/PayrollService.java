package com.affin.hrm.service;

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
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final PayslipRepository payslipRepository;
    private final SalaryRepository salaryRepository;
    private final AttendanceRepository attendanceRepository;

    public PayrollService(EmployeeRepository employeeRepository,
                          PayslipRepository payslipRepository,
                          SalaryRepository salaryRepository,
                          AttendanceRepository attendanceRepository) {
        this.employeeRepository = employeeRepository;
        this.payslipRepository = payslipRepository;
        this.salaryRepository = salaryRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public Payslip getOrCreatePayslip(Long employeeId, Integer month, Integer year) {
        return payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .orElseGet(() -> generatePayslip(employeeId, month, year));
    }

    public List<Payslip> getEmployeePayslips(Long employeeId) {
        return payslipRepository.findByEmployeeId(employeeId);
    }

    public Payslip generatePayslip(Long employeeId, Integer month, Integer year) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

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
