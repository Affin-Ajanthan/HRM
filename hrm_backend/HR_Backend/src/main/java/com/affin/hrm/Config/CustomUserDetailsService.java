package com.affin.hrm.config;

import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.EmployeeRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads user details from the employees table for Spring Security authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

        Employee employee = employeeRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + normalizedEmail));

        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())
        );

        return new User(employee.getEmail(), employee.getPassword(), authorities);
    }
}
