/**
 * ============================================================
 *  HRM Frontend — Centralized API Service
 * ============================================================
 *
 *  HOW TO RECONNECT STEP BY STEP:
 *  --------------------------------
 *  1. Set MOCK_AUTH   = false  → Reconnects Login & Register
 *  2. Set MOCK_HR     = false  → Reconnects HR Dashboard data
 *  3. Set MOCK_ADMIN  = false  → Reconnects Admin Dashboard data
 *
 *  BASE URLs (change if your ports differ):
 *  ----------------------------------------
 *  USER_BACKEND  → http://localhost:5002  (Auth, Register)
 *  HR_BACKEND    → http://localhost:5004  (HR data)
 *  ADMIN_BACKEND → http://localhost:5004  (Admin data)
 * ============================================================
 */

// ─── Toggle these to reconnect each module ────────────────────
export const MOCK_AUTH  = true;   // Step 1: Login & Register
export const MOCK_HR    = true;   // Step 2: HR Dashboard
export const MOCK_ADMIN = true;   // Step 3: Admin Dashboard
// ─────────────────────────────────────────────────────────────

export const BASE_URL   = "http://localhost:5004/api";
export const AUTH_URL   = "http://localhost:5002/api";  // User_Backend

// ─── Shared fetch helper (used when MOCK = false) ────────────
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
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ─── AUTH ────────────────────────────────────────────────────
export const authApi = {
  /** Login — returns { token, email, fullName, role, companyId, id } */
  login: async (email, password) => {
    if (MOCK_AUTH) {
      // Mock users — matches any password for demo purposes
      await delay(600);
      const MOCK_USERS = {
        "admin@test.com":  { id:1, token:"mock-admin-token",  email:"admin@test.com",  fullName:"Admin User",   role:"ADMIN",      companyId:1 },
        "hr@test.com":     { id:2, token:"mock-hr-token",     email:"hr@test.com",     fullName:"HR Manager",   role:"HR_MANAGER", companyId:1 },
        "emp@test.com":    { id:3, token:"mock-emp-token",    email:"emp@test.com",    fullName:"John Employee",role:"EMPLOYEE",   companyId:1 },
      };
      const user = MOCK_USERS[email.toLowerCase().trim()];
      if (!user) throw new Error("Invalid email or password.");
      return { data: user };
    }
    // REAL call
    return request("POST", `${BASE_URL}/auth/login`, { email, password });
  },

  /** Register — creates a new employee account */
  register: async (payload) => {
    if (MOCK_AUTH) {
      await delay(800);
      console.log("📦 [MOCK] Register payload:", payload);
      return { message: "Account created successfully (mock)." };
    }
    return request("POST", `${BASE_URL}/auth/register`, payload);
  },
};

// ─── HR DATA ─────────────────────────────────────────────────
export const hrApi = {
  getEmployees:    () => MOCK_HR ? mockResolve(MOCK_DATA.employees)    : request("GET", `${BASE_URL}/employees`),
  getDepartments:  () => MOCK_HR ? mockResolve(MOCK_DATA.departments)  : request("GET", `${BASE_URL}/departments`),
  getAttendance:   () => MOCK_HR ? mockResolve(MOCK_DATA.attendance)   : request("GET", `${BASE_URL}/attendance`),
  getLeave:        () => MOCK_HR ? mockResolve(MOCK_DATA.leave)        : request("GET", `${BASE_URL}/leave`),
  getNotifications:() => MOCK_HR ? mockResolve(MOCK_DATA.notifications): request("GET", `${BASE_URL}/notifications`),
  getDashboardStats:()=> MOCK_HR ? mockResolve(MOCK_DATA.hrStats)      : request("GET", `${BASE_URL}/dashboard/stats`),
};

// ─── ADMIN DATA ───────────────────────────────────────────────
export const adminApi = {
  getCompanies:     () => MOCK_ADMIN ? mockResolve(MOCK_DATA.companies)   : request("GET", `${BASE_URL}/companies`),
  getSystemUsers:   () => MOCK_ADMIN ? mockResolve(MOCK_DATA.employees)   : request("GET", `${BASE_URL}/users`),
  getDashboardStats:()  => MOCK_ADMIN ? mockResolve(MOCK_DATA.adminStats) : request("GET", `${BASE_URL}/admin/stats`),
};

// ─── Helpers ──────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const mockResolve = (data) => Promise.resolve(data);

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_DATA = {
  adminStats: {
    totalCompanies: 24,
    pendingApprovals: 3,
    activeUsers: 156,
    systemHealth: "Good",
  },
  hrStats: {
    totalEmployees: 148,
    presentToday: 132,
    onLeave: 8,
    newJoining: 4,
  },
  employees: [
    { id:1, fullName:"John Doe",       email:"john@test.com",  department:"Engineering", designation:"Senior Developer", status:"ACTIVE", role:"EMPLOYEE",   joiningDate:"2022-03-15" },
    { id:2, fullName:"Jane Smith",     email:"jane@test.com",  department:"HR",          designation:"HR Executive",     status:"ACTIVE", role:"HR_MANAGER", joiningDate:"2021-07-01" },
    { id:3, fullName:"Mike Johnson",   email:"mike@test.com",  department:"Finance",     designation:"Accountant",       status:"ACTIVE", role:"EMPLOYEE",   joiningDate:"2023-01-10" },
    { id:4, fullName:"Sarah Williams", email:"sarah@test.com", department:"Marketing",   designation:"Marketing Lead",   status:"ACTIVE", role:"EMPLOYEE",   joiningDate:"2022-11-20" },
    { id:5, fullName:"David Brown",    email:"david@test.com", department:"Operations",  designation:"Ops Manager",      status:"ACTIVE", role:"EMPLOYEE",   joiningDate:"2020-05-08" },
  ],
  departments: [
    { id:1, name:"Engineering", headCount:35, manager:"Alice Lee" },
    { id:2, name:"HR",          headCount:10, manager:"Bob Tan"   },
    { id:3, name:"Finance",     headCount:15, manager:"Carol Wu"  },
    { id:4, name:"Marketing",   headCount:12, manager:"Dan Roy"   },
    { id:5, name:"Operations",  headCount:18, manager:"Eve Chan"  },
  ],
  attendance: [
    { id:1, employeeName:"John Doe",       date:"2026-05-02", checkIn:"09:00", checkOut:"18:00", status:"Present" },
    { id:2, employeeName:"Jane Smith",     date:"2026-05-02", checkIn:"08:45", checkOut:"17:45", status:"Present" },
    { id:3, employeeName:"Mike Johnson",   date:"2026-05-02", checkIn:null,    checkOut:null,    status:"Absent"  },
    { id:4, employeeName:"Sarah Williams", date:"2026-05-02", checkIn:"10:15", checkOut:"18:30", status:"Late"    },
  ],
  leave: [
    { id:1, employeeName:"Mike Johnson",   type:"Sick Leave",   from:"2026-05-01", to:"2026-05-03", status:"Approved",  reason:"Fever" },
    { id:2, employeeName:"Sarah Williams", type:"Annual Leave",  from:"2026-05-10", to:"2026-05-15", status:"Pending",   reason:"Family trip" },
    { id:3, employeeName:"David Brown",    type:"Casual Leave", from:"2026-04-28", to:"2026-04-29", status:"Rejected",  reason:"Personal work" },
  ],
  notifications: [
    { id:1, title:"Leave Request",     message:"Mike Johnson submitted a sick leave request.", time:"2h ago", read:false, type:"info"    },
    { id:2, title:"New Employee",      message:"Sarah Williams joined the Marketing team.",    time:"1d ago", read:false, type:"success" },
    { id:3, title:"Payroll Processed", message:"January 2026 payroll has been processed.",    time:"3d ago", read:true,  type:"success" },
  ],
  companies: [
    { id:1, companyName:"Tech Solutions Ltd",  registrationNumber:"REG-001", status:"APPROVED", employeeCount:50  },
    { id:2, companyName:"Global Marketing Inc", registrationNumber:"REG-002", status:"PENDING",  employeeCount:120 },
    { id:3, companyName:"Finance Corp",         registrationNumber:"REG-003", status:"APPROVED", employeeCount:75  },
  ],
};
