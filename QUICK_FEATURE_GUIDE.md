# Quick Guide to Current Features

## For Admins
1. Login at `/admin/login` with: admin/admin123
2. Manage lots (view, edit, assign owners - creation via maps only)
3. Manage clients (including account creation with username/password)
4. Update payment status (Paid, Under Payment, Overdue)
5. Handle inquiries and burial records
6. Add news and updates
7. Create lots via cemetery map drawing tool
8. Generate reports (Excel/Word export)
9. Manage front page content and pricing
10. **Approve employee actions** (lots, burials, payments)

## For Lot Owners
1. Login at `/login` with: client@example.com/password123
2. View your lots and payment status
3. Make payments (uses localStorage for demo)
4. View cemetery maps with your lot locations
5. Submit service requests
6. Track notifications

## For Visitors (Guest Mode)
1. Browse services from homepage
2. View lot types and pricing
3. Chat with AI assistant
4. Contact customer service
5. Access general information

## Important Notes
- **Lot Types**: Now labeled as **Standard** and **Premium** (formerly Lawn/Garden)
- **Lot Creation**: Only through map drawing tool (Add New Lot feature removed)
- **Employee Logout**: Redirects to Admin Login Page
- **Admin Approval**: Required for employee actions on lots, burials, and payments

## Demo Credentials
**Admin**
- Email: admin
- Password: admin123

**Employee**
- Login at `/admin/employee/login`
- Credentials: (configure in Admin portal)

**Client**
- Email: client@example.com
- Password: password123

## New Features
- **Front Page Management**: Employees can edit public website content and pricing
- **Client Account Creation**: Auto-create client accounts with username/password
- **Admin Approval Workflow**: Employee actions require admin approval
- **Corrected Lot Labels**: Standard/Premium (not Lawn/Garden)

## All Data Saved To
- Browser localStorage (key: `cemeteryData`)
- Supabase database for real-time data
- Persists across page reloads
- Activity logs for audit trail
