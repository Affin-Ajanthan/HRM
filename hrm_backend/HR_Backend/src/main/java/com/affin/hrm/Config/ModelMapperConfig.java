package com.affin.hrm.Config;

import com.affin.hrm.DTO.EmployeeDTO;
import com.affin.hrm.Model.Employee;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {

        ModelMapper mapper = new ModelMapper();

        // Prevent ambiguity errors
        mapper.getConfiguration()
                .setAmbiguityIgnored(true)
                .setMatchingStrategy(MatchingStrategies.STRICT);

        // Explicit mapping control
        TypeMap<Employee, EmployeeDTO> typeMap =
                mapper.createTypeMap(Employee.class, EmployeeDTO.class);

        typeMap.addMappings(m -> {
            m.skip(EmployeeDTO::setDepartmentName);
            m.skip(EmployeeDTO::setDepartmentId);
            m.skip(EmployeeDTO::setCompanyId);
            m.skip(EmployeeDTO::setCompanyName);
        });

        return mapper;
    }
}