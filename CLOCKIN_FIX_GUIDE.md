# HRM Clock-in "User Not Found" - Fix Documentation

## Problem Description

When users attempt to clock in after registration, they receive the error:
```
Failed to clock in: User not found
Status: 400
```

## Root Cause Analysis

The HRM system uses a **microservices architecture** with **three separate databases**:

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **User_Backend** | 5002 | `hrm_db_user` | User authentication & registration |
| **Employee_Backend** | 5003 | `hrm_db_employee` | Attendance tracking & leaves |
| **HR_Backend** | 5004 | `hrm_db_hr` | HR management & reports |

### The Flow (Before Fix)

1. **User registers** → Calls `User_Backend` (port 5002)
   - Employee created in `hrm_db_user` ✓

2. **User logs in** → Calls `User_Backend` (port 5002)
   - Receives JWT token ✓

3. **User clicks Clock In** → Calls `Employee_Backend` (port 5003)
   - Tries to find employee in `hrm_db_employee` ✗
   - **Employee doesn't exist** (was only created in `hrm_db_user`)
   - Returns: "User not found" error

### Why Sync Failed

The `User_Backend` attempted to sync employee data to `Employee_Backend` via:
```
POST http://localhost:5003/api/employee/sync
```

But this endpoint was protected by a **class-level security restriction**:
```java
@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasAnyRole('EMPLOYEE', 'HR_MANAGER', 'ADMIN')")  // ← Blocks unauthenticated access
public class EmployeeController {
    @PostMapping("/sync")
    @PreAuthorize("permitAll()")  // ← Method-level permission is overridden
    public ResponseEntity<ApiResponse<?>> syncEmployee(@RequestBody Employee employee) {
        // ...
    }
}
```

The **method-level `@PreAuthorize("permitAll()")` was ineffective** because the class-level restriction took precedence, causing the sync call to fail silently.

## Solution

### Changes Made

#### 1. Created Public SyncController in Employee_Backend
**File**: `Employee_Backend/src/main/java/com/affin/hrm/Controller/SyncController.java`

```java
@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@PreAuthorize("permitAll()")  // ← No auth required
public class SyncController {
    @PostMapping("/employee")
    public ResponseEntity<ApiResponse<?>> syncEmployee(@RequestBody Employee employee) {
        // Sync employee data to hrm_db_employee
    }
}
```

**Key Points:**
- Public endpoint at `/api/sync/employee` (requires NO authentication)
- Separate controller avoids class-level auth restrictions
- Saves/updates employee in `hrm_db_employee`

#### 2. Created SyncController in HR_Backend
**File**: `HR_Backend/src/main/java/com/affin/hrm/Controller/SyncController.java`

- Similar structure for consistency
- Acknowledges sync requests from User_Backend

#### 3. Updated User_Backend AuthService
**File**: `User_Backend/src/main/java/com/affin/hrm/Service/AuthService.java`

Changed sync URL from:
```java
String employeeBackendUrl = "http://localhost:5003/api/employee/sync";
```

To:
```java
String employeeBackendUrl = "http://localhost:5003/api/sync/employee";
```

#### 4. Removed Duplicate Endpoint
**File**: `Employee_Backend/src/main/java/com/affin/hrm/Controller/EmployeeController.java`

Removed the restricted sync endpoint that is now in `SyncController`.

---

## Updated Data Flow (After Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER REGISTRATION                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────┐
                    │  User_Backend   │ (port 5002)
                    │  hrm_db_user    │
                    └─────────────────┘
                              │
                   (1) Save employee here ✓
                              │
              (2) Call public sync endpoint ──────┐
                              │                   ↓
                              │         ┌─────────────────────┐
                              │         │ Employee_Backend    │
                              │         │ /api/sync/employee  │
                              │         │ hrm_db_employee     │
                              │         └─────────────────────┘
                              │                   │
                              │        (3) Save employee here ✓
                              │                   │
                   (Later...)  │          User logs in
                              │                   │
┌─────────────────────────────────────────────────────────────────┐
│                         CLOCK-IN REQUEST                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
            ┌─────────────────────────────┐
            │  Employee_Backend           │ (port 5003)
            │  /api/employee/clock-in     │
            │  hrm_db_employee            │
            └─────────────────────────────┘
                              │
                    (4) Find employee ✓
                              │
                    (5) Create attendance record ✓
                              │
                         SUCCESS! ✓
```

---

## Deployment Instructions

### Step 1: Backup Current Databases
```sql
-- Optional but recommended
BACKUP DATABASE hrm_db_employee TO DISK = 'C:\backup\hrm_db_employee.bak';
BACKUP DATABASE hrm_db_user TO DISK = 'C:\backup\hrm_db_user.bak';
```

### Step 2: Stop Running Services
```powershell
# Stop all three backends (if running)
# - User_Backend (port 5002)
# - Employee_Backend (port 5003)
# - HR_Backend (port 5004)
```

### Step 3: Deploy New Code

Each backend has been rebuilt:
- ✓ `Employee_Backend/build/libs/hrm-0.0.1-SNAPSHOT.jar`
- ✓ `User_Backend/build/libs/hrm-0.0.1-SNAPSHOT.jar`
- ✓ `HR_Backend/build/libs/hrm-0.0.1-SNAPSHOT.jar`

**Deploy the new JAR files:**

```powershell
# Example for Employee_Backend
cd d:\Projects\HRM\hrm_backend\Employee_Backend
java -jar build\libs\hrm-0.0.1-SNAPSHOT.jar

# In another terminal for User_Backend
cd d:\Projects\HRM\hrm_backend\User_Backend
java -jar build\libs\hrm-0.0.1-SNAPSHOT.jar

# In another terminal for HR_Backend
cd d:\Projects\HRM\hrm_backend\HR_Backend
java -jar build\libs\hrm-0.0.1-SNAPSHOT.jar
```

### Step 4: Verify Deployment

#### Test Sync Health
```bash
curl -X GET http://localhost:5003/api/sync/health
# Expected response:
# {
#   "success": true,
#   "data": "OK",
#   "message": "Sync service is healthy"
# }
```

#### Test Clock-in
1. Register a new user
2. Log in with the new user
3. Click "Clock In" button
4. **Expected**: ✓ Clocked in successfully

#### Check Console Logs

Look for sync confirmation in **User_Backend** console:
```
[SYNC] Employee synced to Employee_Backend: user@example.com
[SYNC Controller] Syncing employee from User_Backend: user@example.com
[SYNC Controller] Employee synced successfully: user@example.com (ID: 123)
```

---

## Testing Checklist

- [ ] All three backends are running without errors
- [ ] Sync health endpoint returns OK
- [ ] New user can register successfully
- [ ] New user can log in with correct credentials
- [ ] Clock-in button works without errors
- [ ] Clock-in record appears in attendance table
- [ ] Console logs show sync messages
- [ ] Existing users can still clock in (if they were manually synced before)

---

## Troubleshooting

### Issue: Still getting "User not found"

**Cause**: Old backends still running with cached bytecode

**Solution**:
1. Stop all backends completely
2. Wait 5 seconds
3. Start fresh with new JAR files

```powershell
# Clean kill (PowerShell)
Get-Process java | Stop-Process -Force
Start-Sleep -Seconds 5
# Then restart services
```

### Issue: "Cannot connect to Employee_Backend"

**Cause**: Firewall or port not listening

**Solution**:
```powershell
# Check if ports are open
Test-NetConnection localhost -Port 5003

# Check if service is running
Get-Process java | Select-Object Name, Id, ProcessName
```

### Issue: Sync endpoint returns 404

**Cause**: Old code still deployed

**Solution**:
1. Verify JAR file timestamp (should be recent)
2. Check console output for "SyncController" messages
3. Restart service

### Issue: Employee synced but still can't clock in

**Cause**: Employee record in wrong database or malformed

**Solution**:
```sql
-- Check if employee exists in hrm_db_employee
SELECT * FROM public.employees WHERE email = 'user@example.com';

-- Check if employee exists in hrm_db_user  
SELECT * FROM public.employees WHERE email = 'user@example.com';

-- If missing, manually sync by re-registering user
```

---

## Files Modified

1. **Created**: `Employee_Backend/src/main/java/com/affin/hrm/Controller/SyncController.java`
2. **Created**: `HR_Backend/src/main/java/com/affin/hrm/Controller/SyncController.java`
3. **Modified**: `User_Backend/src/main/java/com/affin/hrm/Service/AuthService.java`
4. **Modified**: `Employee_Backend/src/main/java/com/affin/hrm/Controller/EmployeeController.java`

---

## Success Indicators

After deployment, users should be able to:
1. ✓ Register successfully
2. ✓ Log in without issues
3. ✓ Click "Clock In" and see success message
4. ✓ View attendance records
5. ✓ Clock out successfully

---

## References

- Microservices Architecture Pattern
- Spring Security @PreAuthorize behavior
- Inter-service communication best practices
- Database synchronization strategies

