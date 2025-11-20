---
description: Validate the entire codebase (Lint, Types, Build, and Manual Workflows)
---

# Validation Protocols

Run these steps to validate the codebase state.

## Phase 1: Static Analysis & Build

Run these commands to ensure code quality and build integrity.

### 1. Linting
Check for code quality issues.
```bash
npm run lint
```

### 2. Type Checking
Verify TypeScript types.
```bash
npx tsc
```

### 3. Build Verification
Ensure the application builds for production.
```bash
npm run build
```

## Phase 2: Manual Verification Workflows

Since there are no automated E2E tests, perform these manual checks to verify critical user journeys.

### 1. Super Admin Workflow
- [ ] **Login**: Navigate to `/super-admin/login` and login with super admin credentials.
- [ ] **Dashboard**: Verify `/super-admin/dashboard` loads with statistics.
- [ ] **Admin Management**:
    - [ ] Create a new admin account.
    - [ ] Verify the new admin appears in the list.
    - [ ] Delete the created admin.
- [ ] **Messaging**: Send a message to an admin and verify success toast.

### 2. Admin (Employee) Workflow
- [ ] **Login**: Navigate to `/admin/login` and login with admin credentials.
- [ ] **Dashboard**: Verify `/admin/dashboard` loads.
- [ ] **Lot Management**:
    - [ ] Add a new lot.
    - [ ] Edit the lot details.
    - [ ] Verify lot appears in the list.
- [ ] **Client Management**:
    - [ ] Add a new client.
    - [ ] Verify client appears in the list.
- [ ] **Payments**:
    - [ ] Record a payment for a client.
    - [ ] Verify payment appears in history.

### 3. Client (Lot Owner) Workflow
- [ ] **Login**: Navigate to `/login` and login with client credentials.
- [ ] **Dashboard**: Verify `/client/dashboard` loads with personal stats.
- [ ] **My Lots**: Check that assigned lots are visible.
- [ ] **Payments**: Verify payment history matches records.
- [ ] **Requests**: Submit a service request and verify it appears in the list.

## Phase 3: External Integrations

### 1. Database (Supabase)
- [ ] Verify data persistence after page reloads (if connected).
- [ ] Check that new records (admins, clients, lots) are saved.

### 2. Payment (Stripe - if active)
- [ ] Verify payment intent creation (if applicable in current env).

## Validation Complete
If all phases pass, the system is ready for deployment/production use.
