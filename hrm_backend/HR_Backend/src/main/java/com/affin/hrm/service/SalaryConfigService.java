package com.affin.hrm.service;

import com.affin.hrm.dto.AdditionalPaymentDTO;
import com.affin.hrm.dto.BasicPaymentDTO;
import com.affin.hrm.dto.PaySheetDTO;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.*;
import com.affin.hrm.repository.AdditionalPaymentRepository;
import com.affin.hrm.repository.BasicPaymentRepository;
import com.affin.hrm.repository.EmployeeRepository;
import com.affin.hrm.repository.EmploymentTypeRepository;
import com.affin.hrm.repository.JobRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * HR salary configuration — what each job role is paid per employment type (basic_payments) and
 * individual allowances / deductions per employee (additional_payments), and the pay sheet that
 * combines them.
 * <p>
 * Like leave entitlements, an employee's basic payment is not copied onto the employee: it is the
 * row of the job role in their department whose title matches their designation, for their
 * employment type, worked out on every call. Saving a job role's salary therefore updates every
 * employee of that job role straight away.
 */
@Service
@Transactional
public class SalaryConfigService {

    private static final Logger log = LoggerFactory.getLogger(SalaryConfigService.class);
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("999999999");
    private static final int MAX_NAME_LENGTH = 100;

    private final BasicPaymentRepository basicPaymentRepository;
    private final AdditionalPaymentRepository additionalPaymentRepository;
    private final JobRoleRepository jobRoleRepository;
    private final EmploymentTypeRepository employmentTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditService auditService;

    public SalaryConfigService(BasicPaymentRepository basicPaymentRepository,
                               AdditionalPaymentRepository additionalPaymentRepository,
                               JobRoleRepository jobRoleRepository,
                               EmploymentTypeRepository employmentTypeRepository,
                               EmployeeRepository employeeRepository,
                               AuditService auditService) {
        this.basicPaymentRepository = basicPaymentRepository;
        this.additionalPaymentRepository = additionalPaymentRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employmentTypeRepository = employmentTypeRepository;
        this.employeeRepository = employeeRepository;
        this.auditService = auditService;
    }

    // ── Job role salaries (basic_payments) ───────────────────────

    @Transactional(readOnly = true)
    public List<BasicPaymentDTO> getBasicPayments(Long companyId, Long departmentId) {
        List<BasicPayment> rows = departmentId == null
                ? basicPaymentRepository.findByCompanyIdOrderByUpdatedAtDesc(companyId)
                : basicPaymentRepository.findByCompanyIdAndDepartmentIdOrderByUpdatedAtDesc(companyId, departmentId);

        // How many employees each row currently pays
        List<BasicPayment> all = departmentId == null ? rows : basicPaymentRepository.findByCompanyIdOrderByUpdatedAtDesc(companyId);
        Map<Long, Integer> counts = new HashMap<>();
        for (Employee e : employeeRepository.findByCompanyId(companyId)) {
            if (e.getStatus() == Employee.EmployeeStatus.TERMINATED) continue;
            BasicPayment match = findBasicPayment(all, departmentName(e), e.getDesignation(), e.getEmploymentType());
            if (match != null) counts.merge(match.getId(), 1, Integer::sum);
        }
        return rows.stream().map(p -> toDTO(p, counts.getOrDefault(p.getId(), 0))).collect(Collectors.toList());
    }

    /**
     * Saves salary rows for one job role. A row for a job role + employment type that already
     * exists is updated rather than duplicated.
     */
    public List<BasicPaymentDTO> saveBasicPayments(BasicPaymentDTO.SaveRequest request, Employee hr) {
        Long companyId = hr.getCompany().getId();
        if (request.getJobRoleId() == null) {
            throw new BusinessException("Job role is required");
        }
        JobRole jobRole = jobRoleRepository.findById(request.getJobRoleId())
                .filter(r -> r.getDepartment().getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("JobRole", "id", request.getJobRoleId()));
        if (request.getPayments() == null || request.getPayments().isEmpty()) {
            throw new BusinessException("Add at least one salary row");
        }

        Map<Long, EmploymentType> employmentTypes = employmentTypeRepository.findByCompanyIdAndActive(companyId, true).stream()
                .collect(Collectors.toMap(EmploymentType::getId, t -> t));
        Set<Long> seen = new HashSet<>();
        List<BasicPaymentDTO> saved = new ArrayList<>();

        int rowNo = 0;
        for (BasicPaymentDTO row : request.getPayments()) {
            rowNo++;
            String where = "Row " + rowNo + ": ";
            EmploymentType employmentType = Optional.ofNullable(row.getEmploymentTypeId()).map(employmentTypes::get)
                    .orElseThrow(() -> new BusinessException(where + "select an employment type"));
            if (!seen.add(employmentType.getId())) {
                throw new BusinessException(where + employmentType.getName() + " is listed twice");
            }
            BasicPayment.Period period = parsePeriod(row.getPeriod(), where);
            BigDecimal basic = amount(row.getBasicSalary(), where + "basic salary", true);
            BigDecimal allowance = amount(row.getAllowance(), where + "allowance", false);
            BigDecimal deduction = amount(row.getDeduction(), where + "deduction", false);
            BigDecimal total = basic.add(allowance).subtract(deduction);
            if (total.signum() < 0) {
                throw new BusinessException(where + "deduction cannot be more than basic salary + allowance");
            }

            BasicPayment payment = basicPaymentRepository
                    .findByJobRoleIdAndEmploymentTypeId(jobRole.getId(), employmentType.getId())
                    .orElseGet(BasicPayment::new);
            payment.setCompany(hr.getCompany());
            payment.setDepartment(jobRole.getDepartment());
            payment.setJobRole(jobRole);
            payment.setEmploymentType(employmentType);
            payment.setPeriod(period);
            payment.setBasicSalary(basic);
            payment.setAllowance(allowance);
            payment.setDeduction(deduction);
            payment.setTotalSalary(total);
            payment.setCreatedById(hr.getId());
            payment.setCreatedByName(hr.getFullName());
            saved.add(toDTO(basicPaymentRepository.save(payment), null));
        }

        audit("ASSIGN_SALARY", "JobRole", jobRole.getId(),
                "Set " + saved.size() + " salary row(s) for " + title(jobRole), companyId);
        log.info("{} set {} salary row(s) for job role {} in company {}", hr.getEmail(), saved.size(), jobRole.getId(), companyId);
        return saved;
    }

    /** Removes a single job role salary row (one employment type's basic/allowance/deduction). */
    public void deleteBasicPayment(Long id, Employee hr) {
        Long companyId = hr.getCompany().getId();
        BasicPayment payment = basicPaymentRepository.findById(id)
                .filter(p -> p.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("BasicPayment", "id", id));

        String jobRoleTitle = title(payment.getJobRole());
        String employmentTypeName = payment.getEmploymentType().getName();
        basicPaymentRepository.delete(payment);
        basicPaymentRepository.flush();
        audit("DELETE", "BasicPayment", id,
                "Deleted salary row for " + jobRoleTitle + " (" + employmentTypeName + ")", companyId);
        log.info("{} deleted basic payment {} for company {}", hr.getEmail(), id, companyId);
    }

    // ── Individual allowances / deductions (additional_payments) ─

    @Transactional(readOnly = true)
    public List<AdditionalPaymentDTO> getAdditionalPayments(Long companyId, String employeeEmail) {
        List<AdditionalPayment> rows = employeeEmail == null || employeeEmail.isBlank()
                ? additionalPaymentRepository.findByCompanyIdOrderByIdAsc(companyId)
                : additionalPaymentRepository.findByCompanyIdAndEmployeeEmailIgnoreCaseOrderByIdAsc(companyId, employeeEmail.trim());
        return rows.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Replaces an employee's individual allowances / deductions with the submitted list. */
    public List<AdditionalPaymentDTO> saveAdditionalPayments(AdditionalPaymentDTO.SaveRequest request, Employee hr) {
        Long companyId = hr.getCompany().getId();
        String email = request.getEmployeeEmail() == null ? "" : request.getEmployeeEmail().trim().toLowerCase();
        if (email.isEmpty()) {
            throw new BusinessException("Select an employee");
        }
        List<AdditionalPaymentDTO> items = request.getItems() == null ? List.of() : request.getItems();

        List<AdditionalPayment> toSave = new ArrayList<>();
        int rowNo = 0;
        for (AdditionalPaymentDTO item : items) {
            rowNo++;
            String where = "Row " + rowNo + ": ";
            String name = item.getName() == null ? "" : item.getName().trim().replaceAll("\\s+", " ");
            if (name.isEmpty()) {
                throw new BusinessException(where + "enter a name");
            }
            if (name.length() > MAX_NAME_LENGTH) {
                throw new BusinessException(where + "name must be at most " + MAX_NAME_LENGTH + " characters");
            }
            AdditionalPayment.Type type;
            try {
                type = AdditionalPayment.Type.valueOf(item.getType() == null ? "" : item.getType().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(where + "select Allowance or Deduction");
            }
            BigDecimal amount = amount(item.getAmount(), where + "amount", true);

            AdditionalPayment p = new AdditionalPayment();
            p.setCompany(hr.getCompany());
            p.setEmployeeEmail(email);
            p.setEmployeeCode(request.getEmployeeCode());
            p.setEmployeeName(request.getEmployeeName());
            p.setName(name);
            p.setType(type);
            p.setAmount(amount);
            p.setCreatedById(hr.getId());
            p.setCreatedByName(hr.getFullName());
            toSave.add(p);
        }

        additionalPaymentRepository.deleteByCompanyIdAndEmployeeEmailIgnoreCase(companyId, email);
        additionalPaymentRepository.flush();
        List<AdditionalPaymentDTO> saved = additionalPaymentRepository.saveAll(toSave).stream()
                .map(this::toDTO).collect(Collectors.toList());

        audit("SET_ADDITIONAL_PAYMENTS", "Employee", null,
                "Set " + saved.size() + " individual allowance/deduction(s) for " + email, companyId);
        log.info("{} set {} additional payment(s) for {} in company {}", hr.getEmail(), saved.size(), email, companyId);
        return saved;
    }

    // ── Pay sheet ────────────────────────────────────────────────

    /** Pay sheets for the given employees (details as held in the user database). */
    @Transactional(readOnly = true)
    public List<PaySheetDTO> getPaySheets(Long companyId, List<PaySheetDTO.EmployeeRef> employees) {
        List<BasicPayment> payments = basicPaymentRepository.findByCompanyIdOrderByUpdatedAtDesc(companyId);
        Map<String, List<AdditionalPayment>> additional = additionalPaymentRepository.findByCompanyIdOrderByIdAsc(companyId).stream()
                .collect(Collectors.groupingBy(a -> a.getEmployeeEmail().toLowerCase()));
        List<PaySheetDTO> sheets = new ArrayList<>();
        for (PaySheetDTO.EmployeeRef ref : employees == null ? List.<PaySheetDTO.EmployeeRef>of() : employees) {
            if (ref.getEmail() == null || ref.getEmail().isBlank()) continue;
            sheets.add(buildSheet(ref, payments, additional.getOrDefault(ref.getEmail().trim().toLowerCase(), List.of())));
        }
        return sheets;
    }

    /** Pay sheet of one employee, from their record in hrm_db_hr. Used by Employee_Backend. */
    @Transactional(readOnly = true)
    public PaySheetDTO getPaySheet(Employee employee) {
        PaySheetDTO.EmployeeRef ref = new PaySheetDTO.EmployeeRef();
        ref.setEmail(employee.getEmail());
        ref.setEmployeeCode(employee.getEmployeeId());
        ref.setFullName(employee.getFullName());
        ref.setDepartmentName(departmentName(employee));
        ref.setDesignation(employee.getDesignation());
        ref.setEmploymentType(employee.getEmploymentType());
        Long companyId = employee.getCompany().getId();
        return buildSheet(ref,
                basicPaymentRepository.findByCompanyIdOrderByUpdatedAtDesc(companyId),
                additionalPaymentRepository.findByCompanyIdAndEmployeeEmailIgnoreCaseOrderByIdAsc(companyId, employee.getEmail()));
    }

    private PaySheetDTO buildSheet(PaySheetDTO.EmployeeRef ref, List<BasicPayment> payments, List<AdditionalPayment> additional) {
        PaySheetDTO sheet = new PaySheetDTO();
        sheet.setEmployeeEmail(ref.getEmail().trim());
        sheet.setEmployeeCode(ref.getEmployeeCode());
        sheet.setEmployeeName(ref.getFullName());
        sheet.setDepartmentName(ref.getDepartmentName());
        sheet.setDesignation(ref.getDesignation());
        sheet.setEmploymentType(ref.getEmploymentType());

        BasicPayment match = findBasicPayment(payments, ref.getDepartmentName(), ref.getDesignation(), ref.getEmploymentType());
        if (match != null) {
            sheet.setConfigured(true);
            sheet.setBasicPaymentId(match.getId());
            sheet.setPeriod(match.getPeriod().name());
            sheet.setBasicSalary(match.getBasicSalary());
            sheet.setRoleAllowance(match.getAllowance());
            sheet.setRoleDeduction(match.getDeduction());
        }

        BigDecimal extraAllowance = BigDecimal.ZERO;
        BigDecimal extraDeduction = BigDecimal.ZERO;
        for (AdditionalPayment a : additional) {
            if (a.getType() == AdditionalPayment.Type.ALLOWANCE) extraAllowance = extraAllowance.add(a.getAmount());
            else extraDeduction = extraDeduction.add(a.getAmount());
        }
        sheet.setAdditionalAllowance(extraAllowance);
        sheet.setAdditionalDeduction(extraDeduction);
        sheet.setAdditionalItems(additional.stream().map(this::toDTO).collect(Collectors.toList()));

        sheet.setTotalAllowance(sheet.getRoleAllowance().add(extraAllowance));
        sheet.setTotalDeduction(sheet.getRoleDeduction().add(extraDeduction));
        sheet.setNetTotal(sheet.getBasicSalary().add(sheet.getTotalAllowance()).subtract(sheet.getTotalDeduction()));
        return sheet;
    }

    /**
     * The basic payment of the job role whose title matches the designation (in the employee's
     * department when known), for the employee's employment type. If the employee has no
     * employment type and the job role has a single salary row, that row is used.
     */
    private static BasicPayment findBasicPayment(List<BasicPayment> payments, String departmentName,
                                                 String designation, String employmentType) {
        String title = normalize(designation);
        if (title.isEmpty()) return null;
        String dept = normalize(departmentName);
        String type = normalize(employmentType);

        List<BasicPayment> forRole = payments.stream()
                .filter(p -> !Boolean.FALSE.equals(p.getJobRole().getActive()))
                .filter(p -> normalize(title(p.getJobRole())).equals(title))
                .filter(p -> dept.isEmpty() || normalize(p.getDepartment().getName()).equals(dept))
                .collect(Collectors.toList());
        return forRole.stream()
                .filter(p -> normalize(p.getEmploymentType().getName()).equals(type))
                .findFirst()
                .orElse(type.isEmpty() && forRole.size() == 1 ? forRole.get(0) : null);
    }

    // ── helpers ──────────────────────────────────────────────────

    private static String departmentName(Employee e) {
        return e.getDepartment() != null ? e.getDepartment().getName() : e.getDepartmentName();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private static String title(JobRole role) {
        return role.getJobTitle() != null ? role.getJobTitle() : role.getTitle();
    }

    private static BasicPayment.Period parsePeriod(String value, String where) {
        try {
            return BasicPayment.Period.valueOf(value == null ? "" : value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(where + "select Monthly, Weekly or Annual");
        }
    }

    /** Validates a money amount; blank optional amounts become 0. */
    private static BigDecimal amount(BigDecimal value, String what, boolean required) {
        if (value == null) {
            if (required) throw new BusinessException(what + " is required");
            return BigDecimal.ZERO.setScale(2);
        }
        if (value.signum() < 0) {
            throw new BusinessException(what + " cannot be negative");
        }
        if (required && value.signum() == 0) {
            throw new BusinessException(what + " must be more than 0");
        }
        if (value.compareTo(MAX_AMOUNT) > 0) {
            throw new BusinessException(what + " is too large");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private void audit(String action, String entity, Long id, String description, Long companyId) {
        try {
            auditService.logAction(action, entity, id, description, companyId);
        } catch (Exception ignored) {
            // auditing must never block the actual change
        }
    }

    private BasicPaymentDTO toDTO(BasicPayment p, Integer employeeCount) {
        BasicPaymentDTO dto = new BasicPaymentDTO();
        dto.setId(p.getId());
        dto.setDepartmentId(p.getDepartment().getId());
        dto.setDepartmentName(p.getDepartment().getName());
        dto.setJobRoleId(p.getJobRole().getId());
        dto.setJobRoleTitle(title(p.getJobRole()));
        dto.setEmploymentTypeId(p.getEmploymentType().getId());
        dto.setEmploymentTypeName(p.getEmploymentType().getName());
        dto.setPeriod(p.getPeriod().name());
        dto.setBasicSalary(p.getBasicSalary());
        dto.setAllowance(p.getAllowance());
        dto.setDeduction(p.getDeduction());
        dto.setTotalSalary(p.getTotalSalary());
        dto.setEmployeeCount(employeeCount);
        dto.setCreatedByName(p.getCreatedByName());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private AdditionalPaymentDTO toDTO(AdditionalPayment a) {
        AdditionalPaymentDTO dto = new AdditionalPaymentDTO();
        dto.setId(a.getId());
        dto.setEmployeeEmail(a.getEmployeeEmail());
        dto.setEmployeeCode(a.getEmployeeCode());
        dto.setEmployeeName(a.getEmployeeName());
        dto.setName(a.getName());
        dto.setType(a.getType().name());
        dto.setAmount(a.getAmount());
        dto.setCreatedByName(a.getCreatedByName());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
