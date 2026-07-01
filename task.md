# Inter-Service Communication — Tasks

## Step 1: Employee_Backend — Internal API
- [ ] Create `InternalController.java` (service-to-service endpoints)
- [ ] Update `SecurityConfig` to allow `/api/internal/**` without auth
- [ ] Add service URL env vars to `.env`

## Step 2: Admin_Backend — Use RestTemplate
- [ ] Add `RestTemplateConfig.java` with Employee service URL
- [ ] Refactor `AdminService.java` to call Employee_Backend via REST
- [ ] Remove unused Employee/Company JPA models & repositories
- [ ] Keep only admin-owned tables (AuditLog, SystemConfiguration)

## Step 3: HR_Backend — Use RestTemplate
- [ ] Add `RestTemplateConfig.java` with Employee service URL
- [ ] Refactor HR services to call Employee_Backend via REST
- [ ] Remove duplicate Employee/Company JPA models & repositories

## Step 4: Verification
- [ ] Build all 4 services
- [ ] Test registration → admin visibility flow
