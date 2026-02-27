package com.affin.hrm.Controller;

import com.affin.hrm.DTO.ApiResponse;
import com.affin.hrm.DTO.DepartmentDTO;
import com.affin.hrm.DTO.JobRoleDTO;
import com.affin.hrm.Service.AuthService;
import com.affin.hrm.Service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
public class DepartmentController {

    @Autowired private DepartmentService departmentService;
    @Autowired private AuthService authService;

    // ── DEPARTMENTS ──────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments() {
        try {
            Long companyId = authService.getCurrentEmployee().getCompany().getId();
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.getAllDepartments(companyId), "Departments retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getActiveDepartments() {
        try {
            Long companyId = authService.getCurrentEmployee().getCompany().getId();
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.getActiveDepartments(companyId), "Active departments retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO>> getDepartment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.getDepartmentById(id), "Department retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(
            @Valid @RequestBody DepartmentDTO dto) {
        try {
            Long companyId = authService.getCurrentEmployee().getCompany().getId();
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.createDepartment(dto, companyId), "Department created"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(
            @PathVariable Long id, @Valid @RequestBody DepartmentDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.updateDepartment(id, dto), "Department updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Department deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── JOB ROLES ────────────────────────────────────────────────────────────

    @GetMapping("/{departmentId}/job-roles")
    public ResponseEntity<ApiResponse<List<JobRoleDTO>>> getJobRoles(
            @PathVariable Long departmentId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.getJobRolesByDepartment(departmentId), "Job roles retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{departmentId}/job-roles/active")
    public ResponseEntity<ApiResponse<List<JobRoleDTO>>> getActiveJobRoles(
            @PathVariable Long departmentId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.getActiveJobRolesByDepartment(departmentId), "Active job roles retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{departmentId}/job-roles")
    public ResponseEntity<ApiResponse<JobRoleDTO>> createJobRole(
            @PathVariable Long departmentId, @Valid @RequestBody JobRoleDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.createJobRole(departmentId, dto), "Job role created"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/job-roles/{roleId}")
    public ResponseEntity<ApiResponse<JobRoleDTO>> updateJobRole(
            @PathVariable Long roleId, @Valid @RequestBody JobRoleDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.success(
                    departmentService.updateJobRole(roleId, dto), "Job role updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/job-roles/{roleId}")
    public ResponseEntity<ApiResponse<Void>> deleteJobRole(@PathVariable Long roleId) {
        try {
            departmentService.deleteJobRole(roleId);
            return ResponseEntity.ok(ApiResponse.success(null, "Job role removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}