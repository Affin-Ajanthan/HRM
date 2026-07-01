package com.affin.hrm.service;

import com.affin.hrm.dto.AttendanceDTO;
import com.affin.hrm.exception.BusinessException;
import com.affin.hrm.exception.ResourceNotFoundException;
import com.affin.hrm.model.Attendance;
import com.affin.hrm.model.Employee;
import com.affin.hrm.repository.AttendanceRepository;
import com.affin.hrm.repository.EmployeeRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Attendance service — handles clock-in/out, GPS tracking, and adjustment requests.
 */
@Service
@Transactional
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;
    private final AuditService auditService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             ModelMapper modelMapper,
                             AuditService auditService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.modelMapper = modelMapper;
        this.auditService = auditService;
    }

    public AttendanceDTO clockIn(Long employeeId, LocalTime clockInTime) {
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockInTime() != null) {
            throw new BusinessException("Already clocked in today");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Attendance attendance = existing.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(clockInTime != null ? clockInTime : LocalTime.now());
        attendance.setAttendanceType(Attendance.AttendanceType.MANUAL);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("CLOCK_IN", "Attendance", saved.getId(),
                "Employee clocked in", employee.getCompany().getId());
        log.info("Employee {} clocked in at {}", employeeId, saved.getClockInTime());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockOut(Long employeeId, LocalTime clockOutTime) {
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BusinessException("No clock-in record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new BusinessException("Already clocked out today");
        }

        attendance.setClockOutTime(clockOutTime != null ? clockOutTime : LocalTime.now());
        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("CLOCK_OUT", "Attendance", saved.getId(),
                "Employee clocked out", attendance.getEmployee().getCompany().getId());
        log.info("Employee {} clocked out at {}", employeeId, saved.getClockOutTime());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockInGPS(Long employeeId, String location) {
        LocalDate today = LocalDate.now();

        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent() && existing.get().getClockInTime() != null) {
            throw new BusinessException("Already clocked in today");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        Attendance attendance = existing.orElse(new Attendance());
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockInTime(LocalTime.now());
        attendance.setClockInLocation(location);
        attendance.setAttendanceType(Attendance.AttendanceType.GPS);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);

        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("CLOCK_IN_GPS", "Attendance", saved.getId(),
                "Employee clocked in via GPS", employee.getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO clockOutGPS(Long employeeId, String location) {
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new BusinessException("No clock-in record found for today"));

        if (attendance.getClockOutTime() != null) {
            throw new BusinessException("Already clocked out today");
        }

        attendance.setClockOutTime(LocalTime.now());
        attendance.setClockOutLocation(location);
        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("CLOCK_OUT_GPS", "Attendance", saved.getId(),
                "Employee clocked out via GPS", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getEmployeeAttendance(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getDailyAttendance(Long companyId, LocalDate date) {
        return attendanceRepository.findByCompanyIdAndDate(companyId, date)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceDTO getTodayAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(this::convertToDTO).orElse(null);
    }

    public AttendanceDTO requestAdjustment(Long attendanceId, String reason) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));

        attendance.setIsAdjustmentRequested(true);
        attendance.setAdjustmentReason(reason);
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.PENDING);

        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("REQUEST_ATTENDANCE_ADJUSTMENT", "Attendance", saved.getId(),
                "Requested attendance adjustment", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO approveAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.APPROVED);
        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("APPROVE_ATTENDANCE_ADJUSTMENT", "Attendance", saved.getId(),
                "Approved attendance adjustment", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    public AttendanceDTO rejectAdjustment(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));
        attendance.setAdjustmentStatus(Attendance.AdjustmentStatus.REJECTED);
        Attendance saved = attendanceRepository.save(attendance);
        auditService.logAction("REJECT_ATTENDANCE_ADJUSTMENT", "Attendance", saved.getId(),
                "Rejected attendance adjustment", attendance.getEmployee().getCompany().getId());
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getPendingAdjustments(Long companyId) {
        return attendanceRepository.findByIsAdjustmentRequestedAndAdjustmentStatus(true, Attendance.AdjustmentStatus.PENDING)
                .stream()
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
        if (attendance.getAttendanceType() != null) dto.setAttendanceType(attendance.getAttendanceType().name());
        if (attendance.getStatus() != null) dto.setStatus(attendance.getStatus().name());
        if (attendance.getAdjustmentStatus() != null) dto.setAdjustmentStatus(attendance.getAdjustmentStatus().name());
        return dto;
    }
}
