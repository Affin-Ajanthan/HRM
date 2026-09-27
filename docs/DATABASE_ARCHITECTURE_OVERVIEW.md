# 🌐 HRM Microservices Architecture & Database Interconnection Guide

This document provides a high-level overview of the **4 Microservices Architecture** in the HRM System, showing how each database (`hrm_db_user`, `hrm_db_hr`, `hrm_db_employee`, `hrm_db_admin`) operates, its owned entities/tables, and how data is synchronized across services.

---

## 🏛️ System Overview Diagram

```mermaid
flowchart TB
    subgraph Frontend["💻 HRM React Frontend (Port 5173)"]
        UI_Admin["Admin Portal (/admin/*)"]
        UI_HR["HR Manager Portal (/hr/*)"]
        UI_Emp["Employee Portal (/employee/*)"]
        UI_Public["Public Landing & Company Request (/login, /createaccount)"]
    end

    subgraph Service_User["1️⃣ User Service (Port 5002)"]
        UserBackend["User_Backend\n(Authentication & Security)"]
        DB_User[("hrm_db_user\nPostgreSQL")]
        UserBackend --- DB_User
    end

    subgraph Service_HR["2️⃣ HR Service (Port 5005)"]
        HRBackend["HR_Backend\n(Payroll, Depts, Policy)"]
        DB_HR[("hrm_db_hr\nPostgreSQL")]
        HRBackend --- DB_HR
    end

    subgraph Service_Emp["3️⃣ Employee Service (Port 5006)"]
        EmployeeBackend["Employee_Backend\n(Attendance, Leave, Allowance)"]
        DB_Emp[("hrm_db_employee\nPostgreSQL")]
        EmployeeBackend --- DB_Emp
    end

    subgraph Service_Admin["4️⃣ Admin Service (Port 5007)"]
        AdminBackend["Admin_Backend\n(App Reviews, Audit, Email)"]
        DB_Admin[("hrm_db_admin\nPostgreSQL")]
        AdminBackend --- DB_Admin
    end

    %% Frontend Routing
    UI_Public -->|Auth & Register| UserBackend
    UI_Admin -->|System Oversight & Reviews| AdminBackend
    UI_HR -->|HR Operations & Depts| HRBackend
    UI_Emp -->|Clock-in, Leave, Profile| EmployeeBackend

    %% Service-to-Service REST Communication & Sync
    AdminBackend -->|1. Provision HR Account & Status Update| EmployeeBackend
    AdminBackend -->|2. Sync Approved Company| HRBackend
    EmployeeBackend -->|3. Sync Approved Company & HR Account| UserBackend
    UserBackend -->|4. Sync User Profile Updates| EmployeeBackend
    UserBackend -->|5. Sync User Profile Updates| HRBackend
```

---

## 💾 Detailed Database Schemas & Owned Tables

```mermaid
erDiagram
    %% User DB
    hrm_db_user {
        BIGINT id PK
        VARCHAR email
        VARCHAR password
        VARCHAR role "EMPLOYEE | HR_MANAGER | ADMIN"
        BIGINT company_id FK
        VARCHAR employee_id
        BOOLEAN must_change_password
    }

    %% HR DB
    hrm_db_hr {
        BIGINT id PK
        VARCHAR company_name
        VARCHAR registration_number
        DECIMAL basic_salary
        VARCHAR department_name
        VARCHAR employment_type
        VARCHAR work_location
    }

    %% Employee DB
    hrm_db_employee {
        BIGINT id PK
        VARCHAR employee_id
        TIMESTAMP clock_in_time
        TIMESTAMP clock_out_time
        VARCHAR leave_status "PENDING | APPROVED | REJECTED"
        DECIMAL allowance_amount
    }

    %% Admin DB
    hrm_db_admin {
        BIGINT id PK
        VARCHAR action "APPROVE_COMPANY | REJECT_COMPANY"
        VARCHAR entity "Company | Employee"
        VARCHAR description
        VARCHAR config_key
        VARCHAR config_value
    }
```

---

## 🔄 Core Data Flow Scenarios

### 1️⃣ Company Registration & Admin Approval Flow
1. **Public Submission**: Client submits company request via Frontend -> Saved in `Employee_Backend` / `User_Backend` as `PENDING`.
2. **Admin Review**: System Administrator approves/rejects application via `Admin_Backend` (Port 5007).
3. **Auto-Provisioning**: `Admin_Backend` invokes `Employee_Backend` to set company status to `APPROVED` and provision an `HR_MANAGER` account with `mustChangePassword = true`.
4. **Automated Notification**: `Admin_Backend`'s `EmailService` sends an approval welcome email (or rejection email with stated reasons) to the client.
5. **Database Sync**:
   - `Admin_Backend` syncs company data to `HR_Backend` (`hrm_db_hr`).
   - `Employee_Backend` syncs company & HR Manager details to `User_Backend` (`hrm_db_user`).
   - `Admin_Backend` writes audit log record (`APPROVE_COMPANY`) into `hrm_db_admin`.

---

### 2️⃣ Employee Account Creation & Access Flow
1. **HR Creation**: HR Manager adds an employee via HR Portal.
2. **User Database Creation**: Saved into `hrm_db_user` under HR Manager's company ID.
3. **Multi-Service Propagation**: `User_Backend`'s `SyncService` propagates employee record to `hrm_db_employee` (for attendance/leave) and `hrm_db_hr` (for payroll/salaries).
4. **Login Verification**: Employee logs in via `User_Backend` JWT endpoint; authentication checks `hrm_db_user`.

---

## 📊 Quick Service Reference Matrix

| Microservice | Port | Database Name | Primary Responsibilities | Key Tables |
| :--- | :--- | :--- | :--- | :--- |
| **`User_Backend`** | `5002` | `hrm_db_user` | JWT Authentication, Security, Passwords, User Directory | `employees`, `users`, `companies`, `departments`, `session_logs` |
| **`HR_Backend`** | `5005` | `hrm_db_hr` | Payroll Policy, Department Management, Salary Structures | `companies`, `departments`, `basic_payments`, `leave_allocations` |
| **`Employee_Backend`**| `5006` | `hrm_db_employee` | Daily Operations, Attendance Clocking, Leave Requests, Allowances | `employees`, `attendance`, `leave_applications`, `allowance_requests` |
| **`Admin_Backend`** | `5007` | `hrm_db_admin` | System Administration, Application Approval/Rejection, Emailing, Audit Logs | `audit_logs`, `system_configurations` |
