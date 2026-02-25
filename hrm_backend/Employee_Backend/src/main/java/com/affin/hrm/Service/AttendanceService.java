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

    @Autowired
    private AttendanceRepo attendanceRepo;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private AuditService auditService;

    public AttendanceDTO clockIn(Long employeeId, LocalTime clockInTime) {
        LocalDate today = LocalDate.now();
        
        // Check if already clocked in today
        Optional<Attendance> existingAttendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, today);
        if (existingAttendance.isPresent() && existingAttendance.get().getClockInTime() != null) {
            throw new RuntimeException("Already clocked in today");
        }

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = existingAttendance.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(clockInTime != null ? clockInTime : LocalTime.now());
        attendance.setAttendanceType(Attendance.AttendanceType.MANUAL);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("CLOCK_IN", "Attendance", savedAttendance.getId(), 
                "Employee clocked in", employee.getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public AttendanceDTO clockOut(Long employeeId, LocalTime clockOutTime) {
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new RuntimeException("Already clocked out today");
        }

        attendance.setClockOutTime(clockOutTime != null ? clockOutTime : LocalTime.now());
        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("CLOCK_OUT", "Attendance", savedAttendance.getId(), 
                "Employee clocked out", attendance.getEmployee().getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public AttendanceDTO clockInGPS(Long employeeId, String location) {
        LocalDate today = LocalDate.now();
        
        Optional<Attendance> existingAttendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, today);
        if (existingAttendance.isPresent() && existingAttendance.get().getClockInTime() != null) {
            throw new RuntimeException("Already clocked in today");
        }

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = existingAttendance.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(LocalTime.now());
        attendance.setClockInLocation(location);
        attendance.setAttendanceType(Attendance.AttendanceType.GPS);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("CLOCK_IN_GPS", "Attendance", savedAttendance.getId(), 
                "Employee clocked in via GPS", employee.getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public AttendanceDTO clockOutGPS(Long employeeId, String location) {
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new RuntimeException("Already clocked out today");
        }

        attendance.setClockOutTime(LocalTime.now());
        attendance.setClockOutLocation(location);
        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("CLOCK_OUT_GPS", "Attendance", savedAttendance.getId(), 
                "Employee clocked out via GPS", attendance.getEmployee().getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public List<AttendanceDTO> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepo.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        return attendances.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getDailyAttendance(Long companyId, LocalDate date) {
        List<Attendance> attendances = attendanceRepo.findByCompanyIdAndDate(companyId, date);
        return attendances.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AttendanceDTO getTodayAttendance(Long employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> attendance = attendanceRepo.findByEmployeeIdAndDate(employeeId, today);
        return attendance.map(this::convertToDTO).orElse(null);
    }

    public AttendanceDTO requestAdjustment(Long attendanceId, String reason) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setIsAdjustmentRequested(true);
        attendance.setAdjustmentReason(reason);
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.PENDING);

        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("REQUEST_ATTENDANCE_ADJUSTMENT", "Attendance", savedAttendance.getId(), 
                "Requested attendance adjustment", attendance.getEmployee().getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public AttendanceDTO approveAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.APPROVED);
        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("APPROVE_ATTENDANCE_ADJUSTMENT", "Attendance", savedAttendance.getId(), 
                "Approved attendance adjustment", attendance.getEmployee().getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public AttendanceDTO rejectAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepo.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.REJECTED);
        Attendance savedAttendance = attendanceRepo.save(attendance);
        
        auditService.logAction("REJECT_ATTENDANCE_ADJUSTMENT", "Attendance", savedAttendance.getId(), 
                "Rejected attendance adjustment", attendance.getEmployee().getCompany().getId());

        return convertToDTO(savedAttendance);
    }

    public List<AttendanceDTO> getPendingAdjustments(Long companyId) {
        List<Attendance> attendances = attendanceRepo.findByIsAdjustmentRequestedAndAdjustmentStatus(
                true, Attendance.AdjustmentStatus.PENDING);
        
        // Filter by company
        return attendances.stream()
                .filter(a -> a.getEmployee().getCompany().getId().equals(companyId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = modelMapper.map(attendance, AttendanceDTO.class);
        
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getId());
            dto.setEmployeeName(attendance.getEmployee().getFullName());
            dto.setEmployeeIdNumber(attendance.getEmployee().getEmployeeId());
        }
        
        if (attendance.getAttendanceType() != null) {
            dto.setAttendanceType(attendance.getAttendanceType().name());
        }
        
        if (attendance.getStatus() != null) {
            dto.setStatus(attendance.getStatus().name());
        }
        
        if (attendance.getAdjustmentStatus() != null) {
            dto.setAdjustmentStatus(attendance.getAdjustmentStatus().name());
        }
        
        return dto;
    }
}
