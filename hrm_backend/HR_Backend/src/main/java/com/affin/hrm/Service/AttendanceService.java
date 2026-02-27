package com.affin.hrm.Service;

import com.affin.hrm.DTO.AttendanceDTO;
import com.affin.hrm.Model.Attendance;
import com.affin.hrm.Model.Employee;
import com.affin.hrm.Repo.AttendanceRepo;
import com.affin.hrm.Repo.EmployeeRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    @Autowired private AttendanceRepo attendanceRepo;
    @Autowired private EmployeeRepo employeeRepo;
    @Autowired private ModelMapper modelMapper;
    @Autowired private AuditService auditService;

    public AttendanceDTO clockIn(Long employeeId, LocalTime clockInTime) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepo.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockInTime() != null)
            throw new RuntimeException("Already clocked in today");

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = existing.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(clockInTime != null ? clockInTime : LocalTime.now());
        attendance.setAttendanceType(Attendance.AttendanceType.MANUAL);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance saved = attendanceRepo.save(attendance);
        auditService.logAction("CLOCK_IN", "Attendance", saved.getId(),
                "Employee clocked in", employee.getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockOut(Long employeeId, LocalTime clockOutTime) {
        Attendance attendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));
        if (attendance.getClockOutTime() != null)
            throw new RuntimeException("Already clocked out today");

        attendance.setClockOutTime(clockOutTime != null ? clockOutTime : LocalTime.now());
        Attendance saved = attendanceRepo.save(attendance);
        auditService.logAction("CLOCK_OUT", "Attendance", saved.getId(),
                "Employee clocked out", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockInGPS(Long employeeId, String location) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepo.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockInTime() != null)
            throw new RuntimeException("Already clocked in today");

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = existing.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(LocalTime.now());
        attendance.setClockInLocation(location);
        attendance.setAttendanceType(Attendance.AttendanceType.GPS);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance saved = attendanceRepo.save(attendance);
        auditService.logAction("CLOCK_IN_GPS", "Attendance", saved.getId(),
                "Employee clocked in via GPS", employee.getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockOutGPS(Long employeeId, String location) {
        Attendance attendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));
        if (attendance.getClockOutTime() != null)
            throw new RuntimeException("Already clocked out today");

        attendance.setClockOutTime(LocalTime.now());
        attendance.setClockOutLocation(location);
        Attendance saved = attendanceRepo.save(attendance);
        auditService.logAction("CLOCK_OUT_GPS", "Attendance", saved.getId(),
                "Employee clocked out via GPS", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO getTodayAttendance(Long employeeId) {
        return attendanceRepo.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(this::convertToDTO).orElse(null);
    }

    public List<AttendanceDTO> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepo.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getDailyAttendance(Long companyId, LocalDate date) {
        return attendanceRepo.findByCompanyIdAndDate(companyId, date).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public AttendanceDTO requestAdjustment(Long attendanceId, String reason) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setIsAdjustmentRequested(true);
        attendance.setAdjustmentReason(reason);
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.PENDING);
        return convertToDTO(attendanceRepo.save(attendance));
    }

    public AttendanceDTO approveAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.APPROVED);
        return convertToDTO(attendanceRepo.save(attendance));
    }

    public AttendanceDTO rejectAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.REJECTED);
        return convertToDTO(attendanceRepo.save(attendance));
    }

    public List<AttendanceDTO> getPendingAdjustments(Long companyId) {
        return attendanceRepo.findByIsAdjustmentRequestedAndAdjustmentStatus(
                true, Attendance.AdjustmentStatus.PENDING).stream()
                .filter(a -> a.getEmployee().getCompany().getId().equals(companyId))
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = modelMapper.map(attendance, AttendanceDTO.class);
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getId());
            dto.setEmployeeName(attendance.getEmployee().getFullName());
            dto.setEmployeeIdNumber(attendance.getEmployee().getEmployeeId());
        }
        if (attendance.getAttendanceType() != null) dto.setAttendanceType(attendance.getAttendanceType().name());
        if (attendance.getStatus() != null) dto.setStatus(attendance.getStatus().name());
        if (attendance.getAdjustmentStatus() != null) dto.setAdjustmentStatus(attendance.getAdjustmentStatus().name());
        return dto;
    }
}
