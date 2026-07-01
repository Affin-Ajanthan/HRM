/**
 * ============================================================
 *  HRM Frontend — Centralized API Service
 * ============================================================
 *
 *  All API URLs are loaded from environment variables.
 *  See .env.example for configuration.
 * ============================================================
 */

// ─── Base URLs from environment variables ─────────────────────
export const BASE_URL     = import.meta.env.VITE_API_BASE_URL     || "http://localhost:5004/api";
export const AUTH_URL     = import.meta.env.VITE_AUTH_URL          || "http://localhost:5002/api";
export const EMPLOYEE_URL = import.meta.env.VITE_EMPLOYEE_URL     || "http://localhost:5003/api";
export const ADMIN_URL    = import.meta.env.VITE_ADMIN_URL         || "http://localhost:5001/api";

// ─── Shared fetch helper ──────────────────────────────────────
async function request(method, url, body = null) {
  const token = localStorage.getItem("token");
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const res = await fetch(url, opts);

    if (!res.ok) {
      let errMsg = res.statusText;
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json();
          errMsg = err.message || err.error || err.detail || JSON.stringify(err) || res.statusText;
        } else {
          const text = await res.text();
          errMsg = text || res.statusText;
        }
      } catch (e) {
        // Failed to parse error body
      }
      throw new Error(`${res.status}: ${errMsg}`);
    }

    return await res.json();
  } catch (error) {
    if (error.message && error.message.startsWith("Failed to fetch")) {
      throw new Error("Unable to connect to server. Please check if the backend is running.");
    }
    throw error;
  }
}

// ─── AUTH ────────────────────────────────────────────────────
export const authApi = {
  /** Login — returns { token, email, fullName, role, companyId, id } */
  login: async (email, password) => {
    return request("POST", `${AUTH_URL}/auth/login`, { email, password });
  },

  /** Register — creates a new employee account */
  register: async (payload) => {
    return request("POST", `${AUTH_URL}/auth/register`, payload);
  },

  /** Check if user exists */
  checkUser: async (email) => {
    return request("GET", `${AUTH_URL}/auth/check-user/${encodeURIComponent(email)}`);
  },

  /** Get current user info */
  me: async () => {
    return request("GET", `${EMPLOYEE_URL}/auth/me`);
  },
};

// ─── EMPLOYEE DATA ────────────────────────────────────────────
export const employeeApi = {
  // Profile
  getProfile:       () => request("GET", `${EMPLOYEE_URL}/employee/profile`),
  updateProfile:    (data) => request("PUT", `${EMPLOYEE_URL}/employee/profile`, data),

  // Attendance
  clockIn:          () => request("POST", `${EMPLOYEE_URL}/employee/attendance/clock-in`),
  clockOut:         () => request("POST", `${EMPLOYEE_URL}/employee/attendance/clock-out`),
  clockInGPS:       (latitude, longitude) => request("POST", `${EMPLOYEE_URL}/employee/attendance/clock-in-gps?latitude=${latitude}&longitude=${longitude}`),
  clockOutGPS:      (latitude, longitude) => request("POST", `${EMPLOYEE_URL}/employee/attendance/clock-out-gps?latitude=${latitude}&longitude=${longitude}`),
  getTodayAttendance:    () => request("GET", `${EMPLOYEE_URL}/employee/attendance/today`),
  getAttendanceHistory:  (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return request("GET", `${EMPLOYEE_URL}/employee/attendance/history?${params.toString()}`);
  },
  requestAttendanceAdjustment: (attendanceId, reason) =>
    request("POST", `${EMPLOYEE_URL}/employee/attendance/adjustment-request?attendanceId=${attendanceId}&reason=${encodeURIComponent(reason)}`),

  // Leave
  applyLeave:       (data) => request("POST", `${EMPLOYEE_URL}/employee/leave/apply`, data),
  getLeaves:        () => request("GET", `${EMPLOYEE_URL}/employee/leave`),
  cancelLeave:      (leaveId) => request("POST", `${EMPLOYEE_URL}/employee/leave/${leaveId}/cancel`),
  getLeaveBalance:  () => request("GET", `${EMPLOYEE_URL}/employee/leave/balance`),
};

// ─── HR DATA ─────────────────────────────────────────────────
export const hrApi = {
  // Employees
  getEmployees:     () => request("GET", `${BASE_URL}/hr/employees`),
  getEmployee:      (id) => request("GET", `${BASE_URL}/hr/employees/${id}`),
  createEmployee:   (data) => request("POST", `${BASE_URL}/hr/employees`, data),
  updateEmployee:   (id, data) => request("PUT", `${BASE_URL}/hr/employees/${id}`, data),
  deactivateEmployee: (id) => request("POST", `${BASE_URL}/hr/employees/${id}/deactivate`),

  // Attendance
  getDailyAttendance: (date) => request("GET", `${BASE_URL}/hr/attendance/daily${date ? '?date=' + date : ''}`),
  getPendingAdjustments: () => request("GET", `${BASE_URL}/hr/attendance/adjustments`),
  approveAdjustment: (id) => request("POST", `${BASE_URL}/hr/attendance/adjustments/${id}/approve`),
  rejectAdjustment: (id) => request("POST", `${BASE_URL}/hr/attendance/adjustments/${id}/reject`),

  // Leave
  getPendingLeaves: () => request("GET", `${BASE_URL}/hr/leave/pending`),
  approveLeave:     (leaveId) => request("POST", `${BASE_URL}/hr/leave/${leaveId}/approve`),
  rejectLeave:      (leaveId, reason) => request("POST", `${BASE_URL}/hr/leave/${leaveId}/reject?reason=${encodeURIComponent(reason)}`),

  // Dashboard
  getDashboardStats:() => request("GET", `${BASE_URL}/hr/dashboard/stats`),
};

// ─── ADMIN DATA ───────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getDashboardStats: () => request("GET", `${ADMIN_URL}/admin/stats`),
  getCompanyStats:   (companyId) => request("GET", `${ADMIN_URL}/admin/stats/company/${companyId}`),

  // Companies
  getCompanies:      () => request("GET", `${ADMIN_URL}/admin/companies`),
  getCompany:        (id) => request("GET", `${ADMIN_URL}/admin/companies/${id}`),
  createCompany:     (data) => request("POST", `${ADMIN_URL}/admin/companies`, data),
  updateCompany:     (id, data) => request("PUT", `${ADMIN_URL}/admin/companies/${id}`, data),
  approveCompany:    (id) => request("POST", `${ADMIN_URL}/admin/companies/${id}/approve`),
  rejectCompany:     (id, reason) => request("POST", `${ADMIN_URL}/admin/companies/${id}/reject?reason=${encodeURIComponent(reason)}`),
  suspendCompany:    (id, reason) => request("POST", `${ADMIN_URL}/admin/companies/${id}/suspend?reason=${encodeURIComponent(reason)}`),

  // Users
  getSystemUsers:    () => request("GET", `${ADMIN_URL}/admin/users`),
  getUsersByCompany: (companyId) => request("GET", `${ADMIN_URL}/admin/users/company/${companyId}`),
  getAdminUsers:     () => request("GET", `${ADMIN_URL}/admin/users/admins`),
  updateUserRole:    (id, role) => request("PUT", `${ADMIN_URL}/admin/users/${id}/role?role=${encodeURIComponent(role)}`),
  updateUserStatus:  (id, status) => request("PUT", `${ADMIN_URL}/admin/users/${id}/status?status=${encodeURIComponent(status)}`),
  resetUserPassword: (id, password) => request("POST", `${ADMIN_URL}/admin/users/${id}/reset-password`, { password }),

  // Audit Logs
  getAuditLogs:      (companyId) => request("GET", `${ADMIN_URL}/admin/audit-logs${companyId ? '?companyId=' + companyId : ''}`),
  getAuditLogsByRange: (startDate, endDate) => request("GET", `${ADMIN_URL}/admin/audit-logs/range?startDate=${startDate}&endDate=${endDate}`),

  // System Configuration
  getConfigurations: () => request("GET", `${ADMIN_URL}/admin/config`),
  getConfiguration:  (key) => request("GET", `${ADMIN_URL}/admin/config/${key}`),
  updateConfiguration: (key, value) => request("PUT", `${ADMIN_URL}/admin/config/${key}`, { value }),

  // Auth (admin-specific login)
  login:             (email, password) => request("POST", `${ADMIN_URL}/auth/login`, { email, password }),
};
