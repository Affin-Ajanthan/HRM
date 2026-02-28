package com.affin.hrm.Config;

import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Model.User;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.DepartmentRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import com.affin.hrm.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private DepartmentRepo departmentRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

        Employee employee = employeeRepo.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> migrateFromUserRepo(normalizedEmail));

        if (employee == null) {
            throw new UsernameNotFoundException("User not found with email: " + normalizedEmail);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()));

        return new org.springframework.security.core.userdetails.User(
                employee.getEmail(),
                employee.getPassword(),
                authorities
        );
    }

    private Employee migrateFromUserRepo(String normalizedEmail) {

        Optional<User> userOpt = userRepo.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return null;
        }

        User legacy = userOpt.get();

        Company company = companyRepo.findByRegistrationNumber("DEFAULT-REG-0001")
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setCompanyName("Default Company");
                    c.setRegistrationNumber("DEFAULT-REG-0001");
                    c.setStatus(Company.CompanyStatus.APPROVED);
                    return companyRepo.save(c);
                });

        Department department = departmentRepo.findByCompanyIdAndName(company.getId(), "General")
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName("General");
                    d.setDescription("General Department");
                    d.setCompany(company);
                    return departmentRepo.save(d);
                });

        Employee emp = new Employee();
        emp.setFullName(legacy.getFullName() != null ? legacy.getFullName() : "User");
        emp.setEmail(normalizedEmail);
        emp.setEmployeeId(
                legacy.getEmployeeId() != null ?
                        legacy.getEmployeeId() :
                        "EMP-" + System.currentTimeMillis()
        );
        emp.setNic(legacy.getNic());
        emp.setDob(legacy.getDob());
        emp.setAddress(legacy.getAddress());
        emp.setCompany(company);
        emp.setDepartment(department);
        emp.setRole(Employee.Role.valueOf(legacy.getRole()));
        emp.setStatus(Employee.EmployeeStatus.ACTIVE);
        emp.setJoiningDate(LocalDate.now());

        // IMPORTANT: Do NOT encode here
        emp.setPassword(legacy.getPassword());

        return employeeRepo.save(emp);
    }
}