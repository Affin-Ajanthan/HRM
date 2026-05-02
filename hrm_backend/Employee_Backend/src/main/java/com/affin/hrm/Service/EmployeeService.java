package com.affin.hrm.Service;

import com.affin.hrm.DTO.EmployeeDTO;
import com.affin.hrm.Model.Company;
import com.affin.hrm.Model.Department;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.CompanyRepo;
import com.affin.hrm.Repo.DepartmentRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private CompanyRepo companyRepo;

    @Autowired
    private DepartmentRepo departmentRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public List<EmployeeDTO> getAllEmployeesByCompany(Long companyId) {
        List<Employee> employees = employeeRepo.findByCompanyId(companyId);
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EmployeeDTO> getActiveEmployeesByCompany(Long companyId) {
        List<Employee> employees = employeeRepo.findByCompanyIdAndStatus(companyId, Employee.EmployeeStatus.ACTIVE);
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return convertToDTO(employee);
    }

    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO, Long companyId) {
        // Check if email already exists
        String normalizedEmail = employeeDTO.getEmail() == null ? "" : employeeDTO.getEmail().trim().toLowerCase();
        if (employeeRepo.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new RuntimeException("Employee with email " + normalizedEmail + " already exists");
        }

        // Check if employee ID already exists
        if (employeeRepo.findByEmployeeId(employeeDTO.getEmployeeId()).isPresent()) {
            throw new RuntimeException("Employee ID " + employeeDTO.getEmployeeId() + " already exists");
        }

        Employee employee = new Employee();
        employee.setEmployeeId(employeeDTO.getEmployeeId());
        employee.setFullName(employeeDTO.getFullName());
        employee.setEmail(normalizedEmail);
        employee.setPassword(passwordEncoder.encode(employeeDTO.getPassword()));
        employee.setNic(employeeDTO.getNic());
        employee.setDob(employeeDTO.getDob());
        employee.setAddress(employeeDTO.getAddress());
        employee.setPhone(employeeDTO.getPhone());
        
        if (employeeDTO.getGender() != null) {
            employee.setGender(Employee.Gender.valueOf(employeeDTO.getGender()));
        }
        
        if (employeeDTO.getRole() != null) {
            employee.setRole(Employee.Role.valueOf(employeeDTO.getRole()));
        } else {
            employee.setRole(Employee.Role.EMPLOYEE);
        }

        employee.setDesignation(employeeDTO.getDesignation());
        employee.setJoiningDate(employeeDTO.getJoiningDate() != null ? employeeDTO.getJoiningDate() : LocalDate.now());
        employee.setStatus(Employee.EmployeeStatus.ACTIVE);

        // Set company
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        employee.setCompany(company);

        // Set department if provided
        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepo.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + employeeDTO.getDepartmentId()));
            employee.setDepartment(department);
        }

        Employee savedEmployee = employeeRepo.save(employee);
        
        // Audit log
        auditService.logAction("CREATE_EMPLOYEE", "Employee", savedEmployee.getId(), 
                "Created employee: " + savedEmployee.getFullName(), companyId);

        return convertToDTO(savedEmployee);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setFullName(employeeDTO.getFullName());
        employee.setNic(employeeDTO.getNic());
        employee.setDob(employeeDTO.getDob());
        employee.setAddress(employeeDTO.getAddress());
        employee.setPhone(employeeDTO.getPhone());
        
        if (employeeDTO.getGender() != null) {
            employee.setGender(Employee.Gender.valueOf(employeeDTO.getGender()));
        }

        employee.setDesignation(employeeDTO.getDesignation());

        // Update department if provided
        if (employeeDTO.getDepartmentId() != null) {
            Department department = departmentRepo.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + employeeDTO.getDepartmentId()));
            employee.setDepartment(department);
        }

        Employee updatedEmployee = employeeRepo.save(employee);
        
        // Audit log
        auditService.logAction("UPDATE_EMPLOYEE", "Employee", updatedEmployee.getId(), 
                "Updated employee: " + updatedEmployee.getFullName(), employee.getCompany().getId());

        return convertToDTO(updatedEmployee);
    }

    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setStatus(Employee.EmployeeStatus.INACTIVE);
        employeeRepo.save(employee);
        
        // Audit log
        auditService.logAction("DEACTIVATE_EMPLOYEE", "Employee", employee.getId(), 
                "Deactivated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    public void terminateEmployee(Long id, LocalDate terminationDate) {
        Employee employee = employeeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employee.setStatus(Employee.EmployeeStatus.TERMINATED);
        employee.setTerminationDate(terminationDate);
        employeeRepo.save(employee);
        
        // Audit log
        auditService.logAction("TERMINATE_EMPLOYEE", "Employee", employee.getId(), 
                "Terminated employee: " + employee.getFullName(), employee.getCompany().getId());
    }

    public List<EmployeeDTO> getEmployeesByDepartment(Long departmentId) {
        List<Employee> employees = employeeRepo.findByDepartmentId(departmentId);
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = modelMapper.map(employee, EmployeeDTO.class);
        dto.setPassword(null); // Never send password in response
        
        if (employee.getCompany() != null) {
            dto.setCompanyId(employee.getCompany().getId());
            dto.setCompanyName(employee.getCompany().getCompanyName());
        }
        
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        }
        
        if (employee.getGender() != null) {
            dto.setGender(employee.getGender().name());
        }
        
        if (employee.getRole() != null) {
            dto.setRole(employee.getRole().name());
        }
        
        if (employee.getStatus() != null) {
            dto.setStatus(employee.getStatus().name());
        }
        
        return dto;
    }

    /**
     * Sync employee from User_Backend microservice
     * This method creates or updates an employee in hrm_db_employee
     */
    public Employee saveEmployee(Employee employee) {
        try {
            // Check if employee already exists by email
            String normalizedEmail = employee.getEmail() != null ? employee.getEmail().trim().toLowerCase() : null;
            
            if (normalizedEmail == null || normalizedEmail.isBlank()) {
                throw new RuntimeException("Employee email is required");
            }
            
            Employee existingEmployee = employeeRepo.findByEmailIgnoreCase(normalizedEmail).orElse(null);
            
            // Ensure company exists or create a default one
            Company companyRecord = getOrCreateCompany(employee);
            
            // Ensure department exists or create a default one
            Department department = getOrCreateDepartment(employee, companyRecord);
            
            if (existingEmployee != null) {
                // Update existing employee
                existingEmployee.setFullName(employee.getFullName());
                existingEmployee.setPassword(employee.getPassword());
                existingEmployee.setEmployeeId(employee.getEmployeeId());
                existingEmployee.setNic(employee.getNic());
                existingEmployee.setDob(employee.getDob());
                existingEmployee.setAddress(employee.getAddress());
                existingEmployee.setPhone(employee.getPhone());
                existingEmployee.setGender(employee.getGender());
                existingEmployee.setRole(employee.getRole());
                existingEmployee.setStatus(employee.getStatus());
                existingEmployee.setDesignation(employee.getDesignation());
                existingEmployee.setJoiningDate(employee.getJoiningDate());
                existingEmployee.setCompany(companyRecord);
                existingEmployee.setDepartment(department);
                
                Employee saved = employeeRepo.save(existingEmployee);
                System.out.println("[EMPLOYEE_SERVICE] Updated existing employee: " + normalizedEmail);
                return saved;
            } else {
                // Create new employee
                employee.setEmail(normalizedEmail);
                employee.setCompany(companyRecord);
                employee.setDepartment(department);
                
                if (employee.getStatus() == null) {
                    employee.setStatus(Employee.EmployeeStatus.ACTIVE);
                }
                if (employee.getRole() == null) {
                    employee.setRole(Employee.Role.EMPLOYEE);
                }
                
                Employee saved = employeeRepo.save(employee);
                System.out.println("[EMPLOYEE_SERVICE] Created new employee: " + normalizedEmail);
                return saved;
            }
        } catch (Exception e) {
            System.err.println("[EMPLOYEE_SERVICE ERROR] Failed to save employee: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private Company getOrCreateCompany(Employee employee) {
        Company company = null;
        if (employee.getCompany() != null && employee.getCompany().getId() != null) {
            company = companyRepo.findById(employee.getCompany().getId()).orElse(null);
        }
        
        if (company == null) {
            company = companyRepo.findByRegistrationNumber("DEFAULT-REG-0001")
                    .orElseGet(() -> {
                        Company newCompany = new Company();
                        newCompany.setCompanyName(employee.getCompany() != null && employee.getCompany().getCompanyName() != null 
                            ? employee.getCompany().getCompanyName() : "Default Company");
                        newCompany.setRegistrationNumber("DEFAULT-REG-0001");
                        newCompany.setStatus(Company.CompanyStatus.APPROVED);
                        return companyRepo.save(newCompany);
                    });
            System.out.println("[EMPLOYEE_SERVICE] Using/created company: " + company.getCompanyName());
        }
        
        return company;
    }

    private Department getOrCreateDepartment(Employee employee, Company company) {
        Department department = null;
        if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
            department = departmentRepo.findById(employee.getDepartment().getId()).orElse(null);
        }
        
        if (department == null) {
            String deptName = employee.getDepartment() != null && employee.getDepartment().getName() != null
                    ? employee.getDepartment().getName() : "General";
            
            final Company finalCompany = company;
            department = departmentRepo.findByCompanyIdAndName(company.getId(), deptName)
                    .orElseGet(() -> {
                        Department newDept = new Department();
                        newDept.setName(deptName);
                        newDept.setDescription(deptName + " Department");
                        newDept.setCompany(finalCompany);
                        return departmentRepo.save(newDept);
                    });
            System.out.println("[EMPLOYEE_SERVICE] Using/created department: " + department.getName());
        }
        
        return department;
    }
}
