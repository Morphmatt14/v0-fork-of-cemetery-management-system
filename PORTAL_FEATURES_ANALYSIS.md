# Cemetery Management System - Portal Features Analysis

## Overview
This document provides a comprehensive analysis of the existing Admin (Super Admin) Portal and Employee Portal systems, detailing all features, functions, and capabilities.

---

## 🔐 Authentication System

### Admin Portal Authentication
- **Login Route**: `/admin/login`
- **Session Storage**: localStorage-based
  - `adminSession`: Boolean flag
  - `adminUser`: Username storage
  - `currentUser`: Full user object with role
- **Protected Routes**: Dashboard requires valid admin session
- **Role Verification**: Explicitly checks `role === 'admin'`

### Employee Portal Authentication
- **Login Route**: `/admin/employee/login`
- **Session Storage**: localStorage-based
  - `employeeSession`: Boolean flag
  - `employeeUser`: Username storage
  - `currentUser`: Full user object with role
- **Protected Routes**: Dashboard requires valid employee session
- **Role Verification**: Explicitly checks `role === 'employee'`

---

## 👨‍💼 Super Admin Portal Features

### Dashboard Tabs & Sections

#### 1. **Overview Tab**
**Purpose**: Real-time system monitoring and statistics

**Features**:
- **Real-time Statistics** (from Supabase via `DashboardOverview` component):
  - Total cemetery lots
  - Available lots count
  - Occupied lots count
  - Total clients
  - Revenue metrics
  - Burial statistics

- **Admin-Specific Stats**:
  - Total admin accounts count
  - Pending password reset requests count
  - Recent activity logs count

**Data Source**: 
- `fetchDashboardStats()` API from `lib/dashboard-api.ts`
- Supabase database queries

#### 2. **Admin Management Tab**
**Purpose**: Create and manage admin accounts

**Features**:
- **Create Admin Account**:
  - Form fields: Name, Username, Password
  - Duplicate username validation
  - Success/error messaging
  - Activity logging for audit trail

- **View Admin List**:
  - Display all admin accounts
  - Show username, name, creation date
  - Visual card-based layout

- **Delete Admin Account**:
  - Confirmation dialog before deletion
  - Activity logging
  - Updates localStorage auth store

**Data Storage**: 
- localStorage `auth_store` object
- Activity logged via `logActivity()` function

#### 3. **Activity Monitoring Tab**
**Purpose**: Real-time monitoring of admin activities across the system

**Features**:
- **Activity Filters**:
  - Filter by admin username
  - Filter by category (payment, client, lot, map, password, system)
  - Apply filters button

- **Admin Activity Cards**:
  - Individual cards per admin showing:
    - Total activities count
    - Payment operations count
    - Client operations count
    - Lot/Map operations count
  - Real-time statistics display

- **Recent Activities Feed**:
  - Last 50 activities displayed
  - Shows: action, details, timestamp, status
  - Category badges (color-coded)
  - Admin username tracking
  - Affected records display
  - Success/error status indicators

**Activity Categories Tracked**:
- Payment operations
- Client management
- Lot management
- Map editor changes
- Password operations
- System operations

#### 4. **Messaging Tab**
**Purpose**: Communication system between super admin and regular admins

**Features**:
- **Compose Message**:
  - Select target admin from dropdown
  - Message type selection:
    - Report Request
    - Issue/Error Notification
    - General Message
  - Priority levels:
    - Normal
    - High
    - Urgent
  - Subject and message body
  - Activity logging for sent messages

- **Message History**:
  - View all sent messages
  - Priority badges (color-coded)
  - Message type badges
  - Timestamp display
  - Read status indicator
  - Recipient information

**Message Types**:
- `report_request`: Request reports from admins
- `issue`: Notify admins of issues/errors
- `general`: General communication

#### 5. **Password Resets Tab**
**Purpose**: Manage password reset requests from admins

**Features**:
- **View Reset Requests**:
  - Admin username
  - Request timestamp
  - Current status (pending/approved/rejected)
  - Resolved by information

- **Approve Request**:
  - Set new password input field
  - Approve button
  - Updates admin password in auth store
  - Activity logging

- **Reject Request**:
  - Reject button
  - Updates request status
  - Activity logging

**Request Statuses**:
- Pending
- Approved
- Rejected

#### 6. **Activity Logs Tab**
**Purpose**: Comprehensive audit trail of all system activities

**Features**:
- View all logged activities
- Display format:
  - Action performed
  - Details/description
  - Admin who performed action
  - Timestamp
  - Success/failure status
- Card-based layout
- Color-coded status badges

### Additional Super Admin Features

- **AI Help Widget**: Integrated AI assistance for super admin tasks
- **Logout Function**: Secure logout with session clearing
- **Responsive Design**: Mobile and desktop optimized
- **Auto-refresh**: Messages auto-reload every 10 seconds

---

## 👥 Employee Portal Features

### Dashboard Tabs & Sections

#### 1. **Overview Tab**
**Purpose**: Dashboard statistics and recent activity monitoring

**Features**:
- **Real-time Statistics** (from Supabase):
  - Total lots (occupied/available breakdown)
  - Total clients count
  - Monthly revenue with overdue payments
  - Pending inquiries count

- **Recent Burials Widget**:
  - Last 3 burials displayed
  - Shows: name, lot number, family, date
  - View details button

- **Pending Inquiries Widget**:
  - Shows unresolved inquiries
  - Status badges
  - Quick reply button
  - Limited to top 3 items

**Data Source**: 
- Supabase via `DashboardOverview` component
- localStorage for additional data

#### 2. **Lots Tab**
**Purpose**: Cemetery lot management and inventory

**Important Notes**:
- ⚠️ **Add New Lot feature is REMOVED** - Lots are only created through the map drawing tool
- Lot type labels have been corrected:
  - **Standard** (formerly labeled as "Lawn Lot")
  - **Premium** (formerly labeled as "Garden Lot")
  - **Family** (Estate)
  - **Mausoleum**

**Features**:
- **Assign Lot Owner**:
  - Link lot to client/owner
  - Updates lot status
  - Records ownership information

- **Edit Lot**:
  - Modify all lot attributes
  - Status change updates statistics
  - Map synchronization (if lot is linked to map)
  - Activity logging

- **Delete Lot**:
  - Confirmation dialog
  - Removes from system
  - Updates statistics
  - Map synchronization

- **View Lot Details**:
  - Full lot information display
  - Owner/occupant information
  - Payment history

- **Search Functionality**:
  - Search by lot ID
  - Search by section
  - Search by type
  - Search by status
  - Search by owner/occupant name

**Display Format**:
- Card-based layout
- Shows: ID, section, type, price, status
- Color-coded status badges
- Quick action buttons (Edit, View, Delete)

#### 3. **Burials Tab**
**Purpose**: Burial records management

**Features**:
- View burial records
- Burial information includes:
  - Deceased name
  - Date of burial
  - Lot assignment
  - Family name
  - Age
  - Cause of death
  - Funeral location
  - Burial time
  - Number of attendees
  - Notes/remarks

- **View Burial Details**:
  - Full burial information display
  - Associated lot information
  - Family contact details

#### 4. **Clients Tab**
**Purpose**: Client/customer relationship management

**Features**:
- **Add New Client**:
  - **Automatic Account Creation**: System automatically creates a client account when adding a new client
  - **Account Credentials**:
    - Username (employee sets this)
    - Password (employee sets this)
  - **Personal Information**:
    - Name
    - Email
    - Phone number
    - Address
  - **Emergency Contact**:
    - Emergency contact name
    - Emergency contact phone
  - Notes
  - Auto-assigns status as "Active"
  - Creates empty payment history
  - Client can use the username/password to access the Client Portal

- **Edit Client**:
  - Update all client information
  - Activity logging
  - Preserves payment history

- **View Client Details**:
  - Full client profile
  - Associated lots
  - Payment history
  - Current balance
  - Join date
  - Status (Active/Inactive)

- **Message Client**:
  - Send messages to clients
  - Subject and message body
  - Message type selection
  - **Note**: Clients can reply to messages, but their replies appear in the **Client Portal**, not the Employee Portal

- **Search Functionality**:
  - Search by name
  - Search by email
  - Search by phone
  - Search by address
  - Search by associated lot

**Client Information Tracked**:
- Personal details
- Contact information
- Lot ownership
- Payment balance
- Payment history
- Account status
- Emergency contacts

#### 5. **Payments Tab**
**Purpose**: Financial transaction management

**Features**:
- **View Payments**:
  - Client name
  - Payment date
  - Amount
  - Payment type (Full Payment, Down Payment, Installment, Partial)
  - **Payment Status**:
    - **Paid** - Payment completed in full
    - **Under Payment** - Payment plan in progress
    - **Overdue** - Payment past due date
  - Payment method (Bank Transfer, Credit Card, Cash, Online Banking)
  - Reference number
  - Associated lot

- **Update Payment Status**:
  - Change status between: Paid, Under Payment, Overdue
  - Modify client balances
  - Update payment records
  - Activity logging

- **Search Payments**:
  - Search by client name
  - Search by payment type
  - Search by payment method
  - Search by reference number
  - Search by lot number

**Payment Types Supported**:
- Full Payment
- Down Payment
- Installment
- Partial Payment

**Payment Methods Supported**:
- Bank Transfer
- Credit Card
- Cash
- Online Banking

#### 6. **Maps Tab**
**Purpose**: Interactive cemetery map management

**Important Notes**:
- ⚠️ **Lot Type Labels**: Ensure map displays correct labels (Standard, Premium) not old labels (Lawn Lot, Garden Lot)
- ⚠️ **Naming Behavior**: When drawing a lot on the map, the system does NOT automatically set the lot name
- ✅ **Correct Workflow**: Lot owner names and editing should be managed in the **Lots Section**, NOT during map drawing
- This is the **ONLY** way to create new lots in the system

**Features**:
- **Map Manager Component** (`<MapManager />`):
  - Visual lot layout
  - Interactive lot selection
  - **Lot creation via map interface** (primary lot creation method)
  - Lot status visualization with correct type labels
  - Drag-and-drop functionality
  - Section organization
  - Real-time updates
  - Manual editing required for lot names after creation

- **Lot Owner Selector** (`<LotOwnerSelector />`):
  - Link lots to clients
  - Visual owner assignment
  - Search and filter clients

- **Map Integration**:
  - Synchronizes with global lot system
  - Updates lot status across system
  - Stores map IDs with lots
  - Supports multiple cemetery maps
  - Lot details (names, owners) managed in Lots Section

**Map Features**:
- Visual representation of cemetery sections
- Color-coded lot status (Standard = blue, Premium = gold, etc.)
- Interactive lot management
- Owner assignment interface
- Real-time synchronization
- Lot creation only (naming and owner assignment done in Lots Section)

#### 7. **News Tab**
**Purpose**: News and announcements management

**Features**:
- **News Manager Component** (`<NewsManager />`):
  - Create news articles
  - Edit existing news
  - Delete news items
  - Publish/unpublish news
  - Schedule announcements

**News Management**:
- Title and content editing
- Publication status
- Date management
- Category organization

#### 8. **Inquiries Tab**
**Purpose**: Customer inquiry and support ticket management

**Features**:
- **View Inquiries**:
  - Customer name, email, phone
  - Inquiry type:
    - Lot Availability
    - Payment Plans
    - Maintenance
    - Documentation
    - General Information
  - Date and time received
  - Status (New, In Progress, Resolved)
  - Priority level (high, normal, low)
  - Message content
  - Source (Website Contact Form, Phone Call, Email, etc.)
  - Preferred contact method
  - Budget information
  - Timeline requirements

- **Reply to Inquiry**:
  - Compose reply message
  - Set follow-up date
  - Send copy option
  - Updates inquiry status to "In Progress"
  - Records response history

- **Mark as Resolved**:
  - Changes status to "Resolved"
  - Records resolution date
  - Records resolved by employee
  - Clears follow-up date

- **Reopen Inquiry**:
  - Changes status back to "In Progress"
  - Sets new follow-up date
  - Clears resolution information

- **Assign Inquiry**:
  - Assign to specific team member
  - Assign to department
  - Update assignment tracking

- **Update Priority**:
  - Change priority level (high, normal, low)
  - Priority-based sorting
  - Visual priority indicators

- **Response History**:
  - View all responses
  - Response timestamps
  - Respondent tracking
  - Communication method

- **Search Inquiries**:
  - Search by customer name
  - Search by email
  - Search by inquiry type
  - Search by message content

**Inquiry Status Flow**:
1. New → In Progress → Resolved
2. Resolved → Reopened (In Progress)

**Priority Levels**:
- High (urgent attention required)
- Normal (standard processing)
- Low (non-urgent)

#### 9. **Reports Tab**
**Purpose**: Generate and export system reports

**Features**:
- **Report Types Available**:
  1. **Occupancy Report**:
     - Total lots statistics
     - Occupied vs available breakdown
     - Section-wise analysis
     - Occupancy rates
  
  2. **Revenue Report**:
     - Total revenue calculation
     - Payment type analysis
     - Period-based revenue
     - Payment trends
  
  3. **Payment Report**:
     - All payment transactions
     - Payment method breakdown
     - Status tracking
     - Reference numbers
  
  4. **Inquiry Report**:
     - Inquiry statistics
     - Response rates
     - Resolution rates
     - Inquiry type analysis
     - Source analysis
  
  5. **Burial Report**:
     - Burial records
     - Date ranges
     - Lot assignments
     - Family information

- **Report Period Selection**:
  - Monthly
  - Quarterly
  - Yearly
  - Custom date range

- **Report Preview**:
  - View before export
  - Summary statistics
  - Detailed data tables
  - Section analysis
  - Visual formatting

- **Export Formats**:
  - **Excel (.xlsx)**:
    - Multiple sheets support
    - Formatted tables
    - Summary statistics
    - Professional styling
  
  - **Word (.doc)**:
    - Formatted document
    - Tables and headers
    - Professional layout
    - Summary sections

- **Report Features**:
  - Auto-generated titles
  - Date stamps
  - Summary statistics
  - Detailed data sections
  - Analysis breakdowns
  - Footer information

#### 10. **Front Page Management Tab** 🆕
**Purpose**: Manage public-facing website content and pricing

**Features**:
- **Update Front Page Content**:
  - Edit website homepage content
  - Update service descriptions
  - Modify welcome messages
  - Update contact information

- **Edit Labels and Pricing**:
  - Update lot type labels displayed to public
  - Modify pricing information:
    - Standard lot pricing
    - Premium lot pricing
    - Family lot pricing
    - Mausoleum pricing
  - Edit payment plan information
  - Update service fees

- **Content Management**:
  - Edit text sections
  - Update promotional content
  - Manage public announcements
  - Edit FAQ sections

**Important Notes**:
- ⚠️ Changes made here affect what the public sees on the website
- 💡 Employee identity is displayed within the portal (after login)
- 🔒 Employee identity is NOT shown on the login screen

### Additional Employee Portal Features

- **Notification System**:
  - Real-time message notifications
  - Unread count badge
  - Click to view messages
  - Auto-refresh every 10 seconds

- **Message Inbox**:
  - View messages from super admin
  - Message priority indicators
  - Read/unread status
  - Reply functionality
  - Message type badges

- **Activity Logging**:
  - All operations logged
  - Audit trail maintenance
  - Employee action tracking
  - Categories: lot, client, payment, map, system

- **AI Help Widget**: Context-aware assistance for employee tasks

- **Responsive Design**: Optimized for mobile and desktop use

- **Data Persistence**: localStorage-based data storage with auto-save

- **Search & Filter**: Comprehensive search across all data types

- **Logout Function**: Secure session termination
  - **Redirect Behavior**: When an employee logs out, they are redirected to the **Admin Login Page** (not the Employee Login Page)

---

## 🔐 Admin Approval Workflow 🆕

**Critical Requirement**: All actions performed by employees require Admin approval to maintain system integrity and oversight.

### Actions Requiring Admin Approval

#### **✅ Requires Admin Approval (Mandatory)**

1. **Creating or Editing Lots**:
   - New lot entries (note: lots are created via map, but details may need approval)
   - Changes to lot type, status, or pricing
   - Lot owner assignment changes
   - Status: Pending until admin reviews and approves

2. **Burial Assignments**:
   - Assigning deceased person to a lot
   - Changes to burial information
   - Burial record modifications
   - Status: Pending until admin reviews and approves

3. **Payment Updates**:
   - Changes to payment status (Paid, Under Payment, Overdue)
   - Payment record modifications
   - Balance adjustments
   - Status: Pending until admin reviews and approves

#### **⚠️ Optional Admin Approval (Recommended)**

4. **Adding New Clients**:
   - Creating new client accounts
   - Setting up client credentials
   - Admin approval: Optional (can be configured based on workflow)

5. **Creating Maps**:
   - Drawing new lots on cemetery maps
   - Map section modifications
   - Admin approval: Optional (depends on organizational workflow)

### Approval Workflow

**Employee Action → Pending Status → Admin Review → Approved/Rejected**

1. **Employee submits action**: Action is saved with "Pending" status
2. **Admin receives notification**: Appears in Admin approval queue
3. **Admin reviews**: Views details of requested change
4. **Admin decision**:
   - **Approve**: Action is executed, status changes to "Approved"
   - **Reject**: Action is not executed, employee is notified

### Benefits of Approval System

- ✅ **Quality Control**: Admin oversight prevents errors
- ✅ **Accountability**: All changes are tracked and audited
- ✅ **Training Tool**: New employees can be monitored
- ✅ **Security**: Prevents unauthorized or accidental changes
- ✅ **Audit Trail**: Complete record of who requested and who approved

---

## 🗄️ Data Management

### Data Storage Architecture

#### LocalStorage Structure
```javascript
{
  // Authentication
  "adminSession": "true",
  "adminUser": "username",
  "employeeSession": "true",
  "employeeUser": "username",
  "currentUser": JSON.stringify({ username, role }),
  
  // Auth Store
  "auth_store": {
    "adminUsers": [...],
    "passwordResetRequests": [...]
  },
  
  // Dashboard Data
  "globalData": {
    "stats": {...},
    "lots": [...],
    "clients": [...],
    "payments": [...],
    "burials": [...],
    "pendingInquiries": [...]
  },
  
  // Maps
  "cemeteryMaps": [...],
  
  // Messages
  "messages": [...]
}
```

#### Supabase Integration
- Real-time statistics via API
- Database queries for:
  - Lots count
  - Clients count
  - Revenue calculations
  - Burial records

### Data Models

#### Lot Model
```typescript
{
  id: string            // e.g., "A-001"
  section: string       // Cemetery section
  type: string          // Standard, Premium, Family, Mausoleum
  status: string        // Available, Reserved, Occupied, Maintenance
  price: number         // Price in PHP
  dimensions: string    // e.g., "2m x 1m"
  features: string      // Description of features
  description: string   // Full description
  dateAdded: string     // ISO date
  owner?: string        // Owner name
  ownerId?: string      // Owner ID
  occupant?: string     // Deceased name
  mapId?: string        // Associated map ID
  dateOccupied?: string // Occupation date
  dateReserved?: string // Reservation date
}
```

#### Client Model
```typescript
{
  id: number
  name: string
  email: string
  phone: string
  address: string
  lots: string[]        // Array of lot IDs
  balance: number       // Outstanding balance
  status: string        // Active, Inactive
  joinDate: string      // ISO date
  emergencyContact: string
  emergencyPhone: string
  notes: string
  paymentHistory: Payment[]
}
```

#### Inquiry Model
```typescript
{
  id: number
  name: string
  email: string
  phone: string
  type: string          // Lot Availability, Payment Plans, etc.
  date: string
  time: string
  status: string        // New, In Progress, Resolved
  message: string
  priority: string      // high, normal, low
  source: string        // Where inquiry came from
  preferredContact: string
  budget: string
  timeline: string
  responses: Response[]
  assignedTo: string
  tags: string[]
  followUpDate: string | null
  resolvedDate?: string
  resolvedBy?: string
}
```

#### Payment Model
```typescript
{
  id: number
  client: string
  date: string
  amount: number
  type: string          // Full Payment, Down Payment, etc.
  status: string        // Completed, Pending
  method: string        // Bank Transfer, Credit Card, etc.
  reference: string     // Payment reference number
  lot: string          // Associated lot ID
}
```

#### Burial Model
```typescript
{
  id: number
  name: string         // Deceased name
  date: string         // Burial date
  lot: string          // Lot ID
  family: string       // Family name
  age: number
  cause: string        // Cause of death
  funeral: string      // Funeral location
  burial: string       // Burial time
  attendees: number
  notes: string
}
```

---

## 🔄 System Integration

### Communication Flow
```
Super Admin Portal ←→ Messaging System ←→ Employee Portal
       ↓                                          ↓
Activity Logger ←→ Activity Monitoring ←→ Activity Logger
       ↓                                          ↓
     Auth Store                         Global Data Store
       ↓                                          ↓
Password Resets                         Lots/Clients/Payments
```

### API Endpoints Used

#### Authentication
- `/api/auth/login` - Login for both admin and employee

#### Dashboard
- `fetchDashboardStats(role)` - Get real-time statistics
- `logout(router)` - Logout function

### Shared Components

1. **DashboardOverview** - Statistics component used by both portals
2. **AIHelpWidget** - AI assistance widget (portal-specific)
3. **AdminNotificationBadge** - Message notification badge
4. **MapManager** - Cemetery map management
5. **NewsManager** - News and announcements
6. **LotOwnerSelector** - Lot-to-owner assignment

---

## 🔒 Security Features

1. **Role-Based Access Control**:
   - Separate admin and employee roles
   - Role verification on dashboard load
   - Protected routes with redirects

2. **Session Management**:
   - localStorage-based sessions
   - Session verification on page load
   - Auto-redirect if no valid session

3. **Activity Logging**:
   - All critical operations logged
   - Audit trail for accountability
   - Admin action monitoring

4. **Password Reset Workflow**:
   - Request → Super Admin Approval → Password Update
   - Logged and tracked
   - Rejected requests tracked

---

## 📊 Statistics & Monitoring

### Real-time Metrics Tracked

#### System-Wide
- Total cemetery lots
- Available lots count
- Occupied lots count
- Reserved lots count
- Maintenance lots count

#### Financial
- Monthly revenue
- Total payments
- Pending payments
- Overdue payments
- Payment by method breakdown

#### Customer
- Total clients
- Active clients
- Inactive clients
- Pending inquiries count

#### Operations
- Recent burials
- Burial records by period
- Admin activities count
- Employee activities count

---

## 🎨 User Interface Features

### Common UI Elements
- Card-based layouts
- Responsive grid system
- Modal dialogs for forms
- Alert dialogs for confirmations
- Toast notifications for feedback
- Badge components for status
- Search bars with icons
- Tabs for navigation
- Loading states
- Empty states

### Color Coding
- **Status Badges**:
  - Available: Blue/Default
  - Occupied: Gray/Secondary
  - Reserved: Outlined
  - Maintenance: Warning
  - Completed: Green
  - Pending: Yellow

- **Priority Badges**:
  - High: Red/Destructive
  - Normal: Blue/Default
  - Low: Gray/Secondary

---

## 📱 Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Responsive typography
- Touch-friendly buttons
- Collapsible sections on mobile
- Horizontal scrolling for tables
- Hamburger menus where appropriate

---

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js (React)
- **UI Components**: Custom components + shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + custom SVG components
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js App Router

### Backend Integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom localStorage-based system
- **API Routes**: Next.js API routes
- **Data Storage**: LocalStorage + Supabase

### Libraries Used
- `xlsx` - Excel export functionality
- Custom activity logger
- Custom messaging system
- Custom map store

---

## 📈 Future Enhancement Opportunities

Based on the existing features, potential improvements could include:

1. **Database Migration**: Move from localStorage to full Supabase integration
2. **Real-time Updates**: WebSocket-based real-time data sync
3. **Advanced Reporting**: More report types and custom report builder
4. **Email Integration**: Automated email notifications
5. **File Uploads**: Document and image uploads for clients
6. **Mobile App**: Native mobile apps for on-the-go management
7. **Advanced Analytics**: Dashboard analytics and trends
8. **Payment Gateway**: Integrate online payment processing
9. **Calendar Integration**: Booking and scheduling system
10. **Multi-language Support**: Internationalization

---

## Summary

The Cemetery Management System features two comprehensive portals:

**Super Admin Portal** focuses on:
- System administration
- Admin account management
- Activity monitoring
- Password reset approvals
- Messaging admins

**Employee Portal** focuses on:
- Daily operations
- Lot management
- Client relationships
- Payment tracking
- Inquiry handling
- Report generation
- Map management

Both portals share:
- Real-time statistics
- Activity logging
- Messaging system
- Responsive design
- AI assistance
- Secure authentication

The system provides a complete solution for cemetery management with robust features for operations, administration, and monitoring.
