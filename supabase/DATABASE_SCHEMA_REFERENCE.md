# 📚 Database Schema Reference

## Complete Entity-Relationship Documentation

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CEMETERY MANAGEMENT SYSTEM                    │
│                         Database Schema v1.0                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    ADMINS    │         │  EMPLOYEES   │         │   CLIENTS    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ username     │         │ username     │         │ email        │
│ password_hash│         │ password_hash│         │ password_hash│
│ name         │         │ name         │         │ name         │
│ email        │         │ email        │         │ phone        │
│ status       │         │ status       │         │ address      │
│ created_at   │         │ created_at   │         │ balance      │
│ created_by   │◄────┐   │ created_by   │◄────┐   │ status       │
└──────────────┘     │   └──────────────┘     │   └──────┬───────┘
                     │                        │          │
                     └────────────────────────┘          │
                                                          │
┌──────────────────────┐         ┌──────────────────────┤
│ CEMETERY_SECTIONS    │         │                      │
├──────────────────────┤         │                      │
│ id (PK)              │         │                      │
│ name                 │         │                      │
│ description          │         │                      │
│ total_capacity       │         │                      │
│ available_capacity   │         │                      │
└──────┬───────────────┘         │                      │
       │                         │                      │
       │      ┌──────────────────▼──────────────────┐   │
       └─────►│          LOTS                       │   │
              ├─────────────────────────────────────┤   │
              │ id (PK)                             │   │
              │ lot_number UNIQUE                   │   │
              │ section_id (FK)                     │   │
              │ lot_type                            │   │
              │ status                              │   │
              │ price                               │   │
              │ owner_id (FK) ──────────────────────┘   │
              │ occupant_name                           │
              │ map_id (FK)                             │
              │ map_position JSONB                      │
              └───┬─────────────────────┬───────────────┘
                  │                     │
       ┌──────────▼──────────┐  ┌──────▼───────────────┐
       │  CLIENT_LOTS        │  │     BURIALS          │
       ├─────────────────────┤  ├──────────────────────┤
       │ id (PK)             │  │ id (PK)              │
       │ client_id (FK)      │  │ lot_id (FK)          │
       │ lot_id (FK)         │  │ deceased_name        │
       │ purchase_date       │  │ burial_date          │
       │ purchase_price      │  │ family_name          │
       └─────────────────────┘  │ funeral_home         │
                                │ attendees_count      │
                                └──────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      FINANCIAL SYSTEM                              │
└────────────────────────────────────────────────────────────────────┘

       ┌──────────────────────────────┐
       │        PAYMENTS              │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ client_id (FK) ──────────────┼──► CLIENTS
       │ lot_id (FK) ─────────────────┼──► LOTS
       │ amount                       │
       │ payment_type                 │
       │ payment_status               │
       │ payment_method               │
       │ reference_number UNIQUE      │
       │ payment_date                 │
       │ stripe_payment_intent_id     │
       │ processed_by (FK)            │
       │ approved_by (FK) ────────────┼──► ADMINS
       └──────────────┬───────────────┘
                      │
          ┌───────────▼────────────┐
          │   PAYMENT_HISTORY      │
          ├────────────────────────┤
          │ id (PK)                │
          │ payment_id (FK)        │
          │ client_id (FK)         │
          │ amount                 │
          │ status                 │
          │ date                   │
          └────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                   CUSTOMER SERVICE SYSTEM                          │
└────────────────────────────────────────────────────────────────────┘

       ┌──────────────────────────────┐
       │        INQUIRIES             │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ name                         │
       │ email                        │
       │ phone                        │
       │ inquiry_type                 │
       │ message                      │
       │ status                       │
       │ priority                     │
       │ assigned_to (FK) ────────────┼──► EMPLOYEES
       │ assigned_by (FK) ────────────┼──► ADMINS
       │ related_lot_id (FK)          │
       └───┬──────────────────────────┘
           │
    ┌──────▼─────────────────┐   ┌──────────────────────┐
    │ INQUIRY_RESPONSES      │   │   INQUIRY_TAGS       │
    ├────────────────────────┤   ├──────────────────────┤
    │ id (PK)                │   │ id (PK)              │
    │ inquiry_id (FK)        │   │ inquiry_id (FK)      │
    │ respondent_id (FK)     │   │ tag                  │
    │ message                │   └──────────────────────┘
    │ response_method        │
    └────────────────────────┘

       ┌──────────────────────────────┐
       │   SERVICE_REQUESTS           │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ client_id (FK) ──────────────┼──► CLIENTS
       │ lot_id (FK) ─────────────────┼──► LOTS
       │ request_type                 │
       │ subject                      │
       │ status                       │
       │ assigned_to (FK) ────────────┼──► EMPLOYEES
       │ completed_by (FK)            │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │      APPOINTMENTS            │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ client_id (FK) ──────────────┼──► CLIENTS
       │ lot_id (FK) ─────────────────┼──► LOTS
       │ appointment_type             │
       │ appointment_date             │
       │ appointment_time             │
       │ status                       │
       │ assigned_to (FK) ────────────┼──► EMPLOYEES
       └──────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      CONTENT MANAGEMENT                            │
└────────────────────────────────────────────────────────────────────┘

       ┌──────────────────────────────┐
       │     CEMETERY_MAPS            │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ name                         │
       │ section_id (FK) ─────────────┼──► CEMETERY_SECTIONS
       │ image_url                    │
       │ width                        │
       │ height                       │
       │ is_published                 │
       │ created_by (FK)              │
       └───┬──────────────────────────┘
           │
    ┌──────▼─────────────────┐
    │ MAP_LOT_POSITIONS      │
    ├────────────────────────┤
    │ id (PK)                │
    │ map_id (FK)            │
    │ lot_id (FK) ───────────┼──► LOTS
    │ x_position             │
    │ y_position             │
    │ width                  │
    │ height                 │
    └────────────────────────┘

       ┌──────────────────────────────┐
       │           NEWS               │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ title                        │
       │ content                      │
       │ category                     │
       │ priority                     │
       │ is_published                 │
       │ target_audience              │
       │ published_at                 │
       │ view_count                   │
       │ created_by (FK)              │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │         CONTENT              │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ category                     │
       │ section                      │
       │ key                          │
       │ value                        │
       │ value_type                   │
       │ is_published                 │
       │ UNIQUE(category,section,key) │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │          PRICING             │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ lot_type UNIQUE              │
       │ price                        │
       │ description                  │
       │ features JSONB               │
       │ is_active                    │
       └──────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    SYSTEM ADMINISTRATION                           │
└────────────────────────────────────────────────────────────────────┘

       ┌──────────────────────────────┐
       │       MESSAGES               │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ sender_type                  │
       │ sender_id                    │
       │ recipient_type               │
       │ recipient_id                 │
       │ subject                      │
       │ body                         │
       │ message_type                 │
       │ priority                     │
       │ is_read                      │
       │ parent_message_id (FK)       │
       │ thread_id                    │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │      ACTIVITY_LOGS           │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ actor_type                   │
       │ actor_id                     │
       │ actor_username               │
       │ action                       │
       │ details                      │
       │ category                     │
       │ status                       │
       │ affected_resources JSONB     │
       │ ip_address                   │
       │ timestamp                    │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │  PASSWORD_RESET_REQUESTS     │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ requester_type               │
       │ requester_id                 │
       │ requester_username           │
       │ status                       │
       │ new_password_hash            │
       │ resolved_by (FK) ────────────┼──► ADMINS
       │ reset_token UNIQUE           │
       │ requested_at                 │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │     NOTIFICATIONS            │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ recipient_type               │
       │ recipient_id                 │
       │ notification_type            │
       │ message                      │
       │ is_read                      │
       │ related_payment_id (FK)      │
       │ related_inquiry_id (FK)      │
       │ related_service_id (FK)      │
       │ priority                     │
       └──────────────────────────────┘

       ┌──────────────────────────────┐
       │    SYSTEM_SETTINGS           │
       ├──────────────────────────────┤
       │ id (PK)                      │
       │ key UNIQUE                   │
       │ value                        │
       │ value_type                   │
       │ category                     │
       │ is_public                    │
       └──────────────────────────────┘
```

---

## 📋 Table Details

### Core Tables

#### 1. **admins**
```sql
CREATE TABLE admins (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admins(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES admins(id)
);
```
**Purpose**: System administrators (formerly super-admin)  
**Key Features**: Self-referencing for audit trail, soft delete support  
**Access**: Only admins can view/modify

#### 2. **employees**
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admins(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES admins(id)
);
```
**Purpose**: Operational staff (formerly admin)  
**Key Features**: Created by admins, assigned to inquiries/service requests  
**Access**: Admins can view all, employees can view self

#### 3. **clients**
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    balance DECIMAL(12,2) DEFAULT 0.00,
    join_date DATE DEFAULT CURRENT_DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    notes TEXT,
    preferred_contact_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);
```
**Purpose**: Lot owners/customers  
**Key Features**: Balance tracking, emergency contacts, soft delete  
**Access**: Staff can view all, clients can view self

---

## 🔗 Relationships

### One-to-Many
- `cemetery_sections` → `lots`
- `clients` → `payments`
- `lots` → `burials`
- `inquiries` → `inquiry_responses`
- `inquiries` → `inquiry_tags`
- `cemetery_maps` → `map_lot_positions`

### Many-to-One
- `lots` → `cemetery_sections`
- `lots` → `clients` (owner_id)
- `payments` → `clients`
- `payments` → `lots`
- `service_requests` → `clients`
- `appointments` → `clients`

### Many-to-Many
- `clients` ↔ `lots` (via `client_lots`)

### Self-Referencing
- `admins.created_by` → `admins.id`
- `messages.parent_message_id` → `messages.id`

---

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies for:
- **Admins**: Full access to system
- **Employees**: Operational data access
- **Clients**: Own data only
- **Public**: Read-only for specific data (available lots, news, pricing)

### Audit Trail
All tables include:
- `created_at` - Automatic timestamp
- `updated_at` - Updated via trigger
- `deleted_at` - Soft delete support
- `created_by`/`deleted_by` - Who performed the action

### Activity Logging
Every significant action is logged in `activity_logs`:
- User authentication
- Data modifications
- Payment processing
- System changes

---

## 🔄 Triggers & Functions

### Automatic Triggers

1. **update_updated_at_column()**
   - Updates `updated_at` on every row modification
   - Applied to all major tables

2. **soft_delete()**
   - Automatically sets `status='inactive'` when `deleted_at` is set
   - Applied to user tables

3. **update_client_balance_on_payment()**
   - Automatically adjusts client balance when payments are completed
   - Handles refunds

4. **create_notification_on_inquiry_assignment()**
   - Creates notification when inquiry is assigned to employee

---

## 📊 Data Types & Constraints

### Common Patterns

**Status Fields**:
```sql
status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'suspended'))
```

**Role/Type Enums**:
```sql
user_type VARCHAR(50) CHECK (user_type IN ('admin', 'employee', 'client'))
```

**Monetary Values**:
```sql
amount DECIMAL(12,2)  -- Supports up to 9,999,999,999.99
```

**JSONB Storage**:
```sql
features JSONB  -- Flexible nested data storage
map_position JSONB  -- Store {x, y, width, height}
```

---

## 🎯 Performance Optimization

### Indexes
- Primary keys (UUID) - Automatic
- Foreign keys - Manual indexes created
- Status fields - Partial indexes on active records
- Search fields - Text indexes (email, name, lot_number)
- Timestamp fields - For date range queries

### Query Optimization Tips

**Use indexes**:
```sql
-- Good: Uses index
SELECT * FROM lots WHERE status = 'Available';

-- Good: Uses index  
SELECT * FROM clients WHERE email = 'user@example.com';
```

**Avoid**:
```sql
-- Bad: Full table scan
SELECT * FROM lots WHERE LOWER(lot_number) = 'a-001';
```

---

## 📈 Scalability Considerations

### Current Limits
- **Clients**: Unlimited
- **Lots**: ~50,000 recommended per section
- **Payments**: Partitioning recommended after 1M records
- **Activity Logs**: Archive old logs (>1 year) to separate table

### Future Optimizations
1. **Partitioning**: `activity_logs` by timestamp
2. **Materialized Views**: Dashboard statistics
3. **Read Replicas**: For reporting queries
4. **Full Text Search**: PostgreSQL FTS for content

---

## ✅ Data Integrity Rules

### Constraints Enforced

1. **Referential Integrity**
   - Cannot delete section with lots
   - Cannot delete client with payments
   - Cascade deletes where appropriate

2. **Business Rules**
   - Lot owner must be a valid client
   - Payment must reference valid client and lot
   - Burial must reference valid lot

3. **Data Validation**
   - Email format validation
   - Phone number format
   - Status enum validation
   - Amount must be positive

---

**Schema Version**: 1.0.0  
**Last Updated**: November 18, 2024  
**Total Entities**: 28 tables  
**Total Relationships**: 45+ foreign keys  
**Total Constraints**: 100+ check constraints
