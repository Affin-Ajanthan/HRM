package com.affin.hrm.Repo;

import com.affin.hrm.Model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepo extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByEmployeeId(Long employeeId);
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.employee.company.id = :companyId AND a.date = :date")
    List<Attendance> findByCompanyIdAndDate(@Param("companyId") Long companyId, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Attendance a WHERE a.employee.department.id = :departmentId AND a.date BETWEEN :startDate AND :endDate")
    List<Attendance> findByDepartmentIdAndDateBetween(@Param("departmentId") Long departmentId, 
                                                       @Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);
    
    List<Attendance> findByIsAdjustmentRequestedAndAdjustmentStatus(Boolean isAdjustmentRequested, Attendance.AdjustmentStatus status);
}
