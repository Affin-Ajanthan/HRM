package com.affin.hrm.Service;

import com.affin.hrm.Config.JwtUtil;
import com.affin.hrm.DTO.AuthRequest;
import com.affin.hrm.DTO.AuthResponse;
import com.affin.hrm.DTO.RegisterRequest;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.DepartmentRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmployeeRepo employeeRepo;

        @Autowired
        private CompanyRepo companyRepo;

        @Autowired
        private DepartmentRepo departmentRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

        private static final String DEFAULT_COMPANY_NAME = "Default Company";
        private static final String DEFAULT_COMPANY_REG = "DEFAULT-REG-0001";

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateToken(authentication);

        Employee employee = employeeRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(
                jwt,
                employee.getEmail(),
                employee.getFullName(),
                employee.getRole().name(),
                employee.getCompany() != null ? employee.getCompany().getId() : null,
                employee.getId()
        );
    }

    public Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return employeeRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

        public Employee register(RegisterRequest request) {
                if (employeeRepo.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Employee with email already exists");
                }

                if (request.getEmployeeId() != null && employeeRepo.findByEmployeeId(request.getEmployeeId()).isPresent()) {
                        throw new RuntimeException("Employee ID already exists");
                }

                Company company = companyRepo.findByRegistrationNumber(DEFAULT_COMPANY_REG)
                                .orElseGet(() -> {
                                        Company newCompany = new Company();
                                        newCompany.setCompanyName(DEFAULT_COMPANY_NAME);
                                        newCompany.setRegistrationNumber(DEFAULT_COMPANY_REG);
                                        newCompany.setStatus(Company.CompanyStatus.APPROVED);
                                        return companyRepo.save(newCompany);
                                });

                String deptName = (request.getDepartment() == null || request.getDepartment().isBlank())
                                ? "General" : request.getDepartment().trim();

                Department department = departmentRepo.findByCompanyIdAndName(company.getId(), deptName)
                                .orElseGet(() -> {
                                        Department newDept = new Department();
                                        newDept.setName(deptName);
                                        newDept.setDescription(deptName + " Department");
                                        newDept.setCompany(company);
                                        return departmentRepo.save(newDept);
                                });

                Employee employee = new Employee();
                employee.setFullName(request.getFullName());
                employee.setEmail(request.getEmail());
                employee.setPassword(passwordEncoder.encode(request.getPassword()));
                employee.setEmployeeId(request.getEmployeeId() != null ? request.getEmployeeId() : "EMP-" + System.currentTimeMillis());
                employee.setNic(request.getNic());
                employee.setDob(request.getDob());
                employee.setAddress(request.getAddress());
                employee.setPhone(request.getPhone());
                employee.setDesignation(request.getDesignation());
                employee.setJoiningDate(request.getJoiningDate() != null ? request.getJoiningDate() : java.time.LocalDate.now());
                employee.setCompany(company);
                employee.setDepartment(department);

                if (request.getGender() != null) {
                        try {
                                employee.setGender(Employee.Gender.valueOf(request.getGender().trim().toUpperCase()));
                        } catch (Exception ignored) {
                                employee.setGender(Employee.Gender.OTHER);
                        }
                } else {
                        employee.setGender(Employee.Gender.OTHER);
                }

                if (request.getRole() != null) {
                        String normalizedRole = request.getRole().trim().toUpperCase()
                                        .replace("-", "_")
                                        .replace(" ", "_");
                        try {
                                employee.setRole(Employee.Role.valueOf(normalizedRole));
                        } catch (Exception ignored) {
                                employee.setRole(Employee.Role.EMPLOYEE);
                        }
                } else {
                        employee.setRole(Employee.Role.EMPLOYEE);
                }

                employee.setStatus(Employee.EmployeeStatus.ACTIVE);
                return employeeRepo.save(employee);
        }
}
