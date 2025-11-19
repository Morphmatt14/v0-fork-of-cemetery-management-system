# 🗄️ Cemetery Management System - Supabase Database Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Schema](#database-schema)
4. [Setup Instructions](#setup-instructions)
5. [Migration Execution](#migration-execution)
6. [Authentication Setup](#authentication-setup)
7. [Testing](#testing)
8. [API Integration](#api-integration)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

This guide provides complete instructions for setting up the Supabase PostgreSQL database for the Cemetery Management System. The database supports:

- **3 User Roles**: Admin, Employee, Client
- **30+ Tables** covering all operations
- **Row Level Security (RLS)** for data protection
- **Automatic triggers** for audit trails and data consistency
- **Full text search** capabilities
- **JSONB storage** for flexible data

### Key Features
✅ Role-based access control (RBAC)
✅ Soft deletes with audit trails
✅ Automatic timestamp management
✅ Payment processing integration
✅ Activity logging
✅ Real-time notifications
✅ Cemetery map management

---

## 🔧 Prerequisites

### Required
1. **Supabase Account**: https://supabase.com (Free tier available)
2. **Node.js**: v18+ for running migration scripts
3. **Environment Variables**: Already configured in `.env.local`

### Your Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://jpbbdfomoyisyqqtptli.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗂️ Database Schema

### Core Tables (Migration 001)

#### 1. Users & Authentication
- **`admins`** - System administrators (formerly super-admin)
- **`employees`** - Operational staff (formerly admin)
- **`clients`** - Lot owners/customers

#### 2. Cemetery Management
- **`cemetery_sections`** - Cemetery area divisions (Garden of Peace, etc.)
- **`lots`** - Individual burial plots
- **`client_lots`** - Many-to-many relationship between clients and lots
- **`burials`** - Burial records for occupied lots

### Operational Tables (Migration 002)

#### 3. Financial
- **`payments`** - Payment transactions
- **`payment_history`** - Payment event tracking

#### 4. Customer Service
- **`inquiries`** - Customer inquiries and questions
- **`inquiry_responses`** - Responses to inquiries
- **`inquiry_tags`** - Inquiry categorization
- **`service_requests`** - Maintenance and service requests
- **`appointments`** - Scheduled appointments
- **`notifications`** - System notifications for all users

### System Tables (Migration 003)

#### 5. Content & Communication
- **`cemetery_maps`** - Interactive cemetery maps
- **`map_lot_positions`** - Lot positions on maps
- **`news`** - News and announcements
- **`messages`** - Internal messaging between staff
- **`content`** - CMS content (homepage, services, etc.)
- **`pricing`** - Lot pricing configuration

#### 6. Administration
- **`activity_logs`** - Complete audit trail
- **`password_reset_requests`** - Password reset workflow
- **`system_settings`** - System configuration

---

## 🚀 Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com and sign in
2. Navigate to your project: `jpbbdfomoyisyqqtptli`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Execute Migrations

Run the migrations **in order**:

#### Migration 1: Core Tables
```sql
-- Copy and paste entire content from:
supabase/migrations/001_create_core_tables.sql
```
⏱️ Execution time: ~2-3 seconds
✅ Creates: 8 tables, 20+ indexes, triggers

#### Migration 2: Operational Tables
```sql
-- Copy and paste entire content from:
supabase/migrations/002_create_operational_tables.sql
```
⏱️ Execution time: ~2-3 seconds
✅ Creates: 9 tables, 25+ indexes, triggers

#### Migration 3: System Tables
```sql
-- Copy and paste entire content from:
supabase/migrations/003_create_system_tables.sql
```
⏱️ Execution time: ~2-3 seconds
✅ Creates: 11 tables, 30+ indexes, initial data

#### Migration 4: Row Level Security
```sql
-- Copy and paste entire content from:
supabase/migrations/004_row_level_security.sql
```
⏱️ Execution time: ~3-4 seconds
✅ Creates: 80+ RLS policies

### Step 3: Verify Installation

Run this query to check all tables:
```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected result: **28 tables** in public schema

---

## 🔐 Authentication Setup

### Password Hashing

The system uses **bcrypt** for password hashing. Before inserting the default admin/employee, generate proper hashes:

```bash
# Install bcrypt
npm install bcryptjs

# Node.js script to generate hash
const bcrypt = require('bcryptjs');
const password = 'admin123'; // Change this!
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

### Update Default Credentials

After getting the hash, update migration 001:

```sql
-- Replace placeholder hashes in 001_create_core_tables.sql
INSERT INTO admins (username, password_hash, name, email, status)
VALUES (
    'admin',
    '$2a$10$actual_bcrypt_hash_here',  -- Replace this
    'Master Admin',
    'admin@smpi.com',
    'active'
);

INSERT INTO employees (username, password_hash, name, email, status)
VALUES (
    'employee',
    '$2a$10$actual_bcrypt_hash_here',  -- Replace this
    'Default Employee',
    'employee@smpi.com',
    'active'
);
```

### Authentication Flow

The app will use these Supabase-specific settings for auth:

```typescript
// Set user context for RLS
await supabase.rpc('set_claim', {
  claim: 'app.user_role',
  value: 'admin' // or 'employee', 'client'
});

await supabase.rpc('set_claim', {
  claim: 'app.user_id',
  value: userId
});
```

---

## 🧪 Testing

### Test Data Insertion

```sql
-- Test: Insert a client
INSERT INTO clients (email, password_hash, name, phone, address)
VALUES (
    'test@example.com',
    '$2a$10$test_hash',
    'Test Client',
    '09123456789',
    '123 Test Street'
) RETURNING *;

-- Test: Insert a lot
INSERT INTO lots (lot_number, section_id, lot_type, status, price, dimensions)
VALUES (
    'TEST-001',
    (SELECT id FROM cemetery_sections WHERE name = 'Garden of Peace' LIMIT 1),
    'Standard',
    'Available',
    75000.00,
    '2m x 1m'
) RETURNING *;

-- Test: Create payment
INSERT INTO payments (
    client_id,
    lot_id,
    amount,
    payment_type,
    payment_status,
    reference_number
)
VALUES (
    (SELECT id FROM clients WHERE email = 'test@example.com'),
    (SELECT id FROM lots WHERE lot_number = 'TEST-001'),
    75000.00,
    'Full Payment',
    'Completed',
    'TEST-' || NOW()::text
) RETURNING *;

-- Verify client balance was updated
SELECT name, balance FROM clients WHERE email = 'test@example.com';
```

### Test RLS Policies

```sql
-- Set session variables to test as different users
SET app.user_role = 'employee';
SET app.user_id = '00000000-0000-0000-0000-000000000000';

-- Try to query lots (should work for employees)
SELECT * FROM lots LIMIT 5;

-- Try as client (should only see available lots)
SET app.user_role = 'client';
SELECT * FROM lots WHERE status = 'Available' LIMIT 5;
```

---

## 🔌 API Integration

### Update Supabase Client Configuration

Edit `lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'cemetery-management-system'
    }
  }
})

// Helper to set user context for RLS
export async function setUserContext(role: 'admin' | 'employee' | 'client', userId: string) {
  // Set custom claims for RLS
  await supabase.rpc('set_config', {
    parameter: 'app.user_role',
    value: role
  })
  
  await supabase.rpc('set_config', {
    parameter: 'app.user_id', 
    value: userId
  })
}

// Bcrypt password verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return bcrypt.compare(password, hash)
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  return bcrypt.hash(password, 10)
}
```

### Example CRUD Operations

```typescript
// Fetch all lots (respects RLS)
const { data: lots, error } = await supabase
  .from('lots')
  .select('*')
  .order('created_at', { ascending: false })

// Create new client
const { data: newClient, error } = await supabase
  .from('clients')
  .insert({
    email: 'client@example.com',
    password_hash: await hashPassword('password'),
    name: 'John Doe',
    phone: '09123456789'
  })
  .select()
  .single()

// Update payment status
const { data, error } = await supabase
  .from('payments')
  .update({ payment_status: 'Completed' })
  .eq('id', paymentId)
  .select()

// Delete with soft delete
const { error } = await supabase
  .from('lots')
  .update({ 
    deleted_at: new Date().toISOString(),
    deleted_by: adminId 
  })
  .eq('id', lotId)
```

---

## ⚠️ Troubleshooting

### Common Issues

#### 1. **Migration fails: "relation already exists"**
**Solution**: Tables were partially created. Drop and recreate:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- Then run migrations again
```

#### 2. **RLS blocks all queries**
**Solution**: Make sure user context is set:
```sql
-- Check current settings
SHOW app.user_role;
SHOW app.user_id;

-- Set properly
SELECT set_config('app.user_role', 'admin', false);
SELECT set_config('app.user_id', 'your-uuid-here', false);
```

#### 3. **Password hashing errors**
**Solution**: Install bcryptjs:
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

#### 4. **Triggers not firing**
**Solution**: Check trigger status:
```sql
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

#### 5. **Foreign key constraints fail**
**Solution**: Ensure referenced records exist first:
```sql
-- Check for orphaned records
SELECT * FROM lots WHERE section_id NOT IN (SELECT id FROM cemetery_sections);
```

---

## 📊 Database Statistics

After setup, verify table sizes:

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔄 Data Migration from localStorage

### Migration Script Template

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '@/lib/supabase-client'

async function migrateData() {
  // 1. Migrate Clients
  const clientsData = JSON.parse(localStorage.getItem('auth_store') || '{}')
  for (const client of clientsData.clientUsers || []) {
    await supabase.from('clients').insert({
      email: client.email,
      password_hash: client.password, // Hash these properly!
      name: client.name,
      phone: client.phone
    })
  }

  // 2. Migrate Lots
  const lotsData = JSON.parse(localStorage.getItem('globalData') || '{}')
  for (const lot of lotsData.lots || []) {
    await supabase.from('lots').insert({
      lot_number: lot.id,
      lot_type: lot.type,
      status: lot.status,
      price: lot.price,
      dimensions: lot.dimensions,
      features: lot.features,
      description: lot.description
    })
  }

  // Continue for other data types...
}
```

---

## 🎯 Next Steps

1. ✅ **Execute all 4 migrations** in Supabase SQL Editor
2. ✅ **Update password hashes** for default users
3. ✅ **Test authentication** with default credentials
4. ✅ **Verify RLS policies** work correctly
5. ✅ **Update frontend code** to use Supabase instead of localStorage
6. ✅ **Test all CRUD operations** through the UI
7. ✅ **Set up Stripe webhooks** for payment processing
8. ✅ **Enable database backups** in Supabase dashboard

---

## 📞 Support

For issues or questions:
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Project Issues**: Contact development team

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Migration 001 executed successfully
- [ ] Migration 002 executed successfully
- [ ] Migration 003 executed successfully
- [ ] Migration 004 (RLS) executed successfully
- [ ] Default admin user created with proper hash
- [ ] Default employee user created with proper hash
- [ ] Test data inserted successfully
- [ ] RLS policies tested and working
- [ ] Supabase client updated in codebase
- [ ] Authentication flow tested
- [ ] All CRUD operations verified
- [ ] Database backups enabled

---

**Database Version**: 1.0.0  
**Last Updated**: November 18, 2024  
**PostgreSQL Version**: 15.x (Supabase)  
**Total Tables**: 28  
**Total Indexes**: 75+  
**Total RLS Policies**: 80+
