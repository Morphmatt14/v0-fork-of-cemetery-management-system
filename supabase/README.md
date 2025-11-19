# 🗄️ Supabase Database - Cemetery Management System

Complete database setup for migrating from localStorage to Supabase PostgreSQL.

---

## 📁 Directory Structure

```
supabase/
├── migrations/
│   ├── 001_create_core_tables.sql       # Users, lots, cemetery sections, burials
│   ├── 002_create_operational_tables.sql # Payments, inquiries, service requests
│   ├── 003_create_system_tables.sql     # Maps, news, messages, activity logs
│   └── 004_row_level_security.sql       # RLS policies for all tables
├── DATABASE_SETUP_GUIDE.md              # Step-by-step setup instructions
├── DATABASE_SCHEMA_REFERENCE.md         # Complete ERD and table documentation
└── README.md                            # This file
```

---

## 🚀 Quick Start

### 1. **Execute Migrations** (5 minutes)

Access your Supabase SQL Editor: https://supabase.com/dashboard/project/jpbbdfomoyisyqqtptli/sql

Run migrations **in order**:

```bash
# 1. Core Tables (users, lots, burials)
migrations/001_create_core_tables.sql

# 2. Operational Tables (payments, inquiries)
migrations/002_create_operational_tables.sql

# 3. System Tables (maps, news, logs)
migrations/003_create_system_tables.sql

# 4. Row Level Security
migrations/004_row_level_security.sql
```

### 2. **Update Password Hashes** (2 minutes)

Generate bcrypt hashes for default users:

```bash
npm install bcryptjs
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10))"
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('emp123', 10))"
```

Update the hashes in `001_create_core_tables.sql` section 7.

### 3. **Verify Setup** (1 minute)

```sql
-- Check table count (should be 28)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies (should be 80+)
SELECT COUNT(*) FROM pg_policies;

-- Test query
SELECT * FROM cemetery_sections;
```

---

## 📊 Database Overview

### 28 Tables Across 6 Categories

#### 👥 **Users** (3 tables)
- `admins` - System administrators
- `employees` - Operational staff  
- `clients` - Lot owners

#### 🪦 **Cemetery** (5 tables)
- `cemetery_sections` - Area divisions
- `lots` - Burial plots
- `client_lots` - Ownership mapping
- `burials` - Burial records
- `cemetery_maps` - Interactive maps

#### 💰 **Financial** (2 tables)
- `payments` - Transaction records
- `payment_history` - Payment events

#### 🎫 **Service** (7 tables)
- `inquiries` - Customer questions
- `inquiry_responses` - Staff responses
- `inquiry_tags` - Categorization
- `service_requests` - Maintenance requests
- `appointments` - Scheduled visits
- `notifications` - System alerts
- `news` - Announcements

#### 📝 **Content** (5 tables)
- `content` - CMS content
- `pricing` - Lot pricing
- `map_lot_positions` - Map coordinates
- `messages` - Staff messaging
- `system_settings` - Configuration

#### 🔍 **Administration** (2 tables)
- `activity_logs` - Audit trail
- `password_reset_requests` - Password resets

---

## 🔐 Security Features

### Row Level Security (RLS)
✅ **80+ policies** enforce role-based access:
- Admins: Full system access
- Employees: Operational data access
- Clients: Own records only
- Public: Read-only (lots, news, pricing)

### Audit Trail
✅ Every table tracks:
- `created_at` - When created
- `updated_at` - Last modification (automatic)
- `deleted_at` - Soft delete timestamp
- `created_by` / `deleted_by` - Who did it

### Activity Logging
✅ All actions logged:
- User authentication
- Data modifications
- Payment processing
- System changes

---

## 🔄 Data Migration from localStorage

### Current Data Storage (localStorage)

Your app currently stores data in:
- `auth_store` - User credentials
- `globalData` - Lots, clients, payments
- `news_store` - News articles
- `admin_activity_logs` - Activity logs
- `password_reset_requests` - Reset requests
- `messages` - Internal messages

### Migration Strategy

**Option 1: Manual Migration** (Recommended)
1. Export localStorage data to JSON files
2. Transform data to match new schema
3. Import via SQL INSERT statements

**Option 2: Programmatic Migration**
1. Create migration script using Supabase client
2. Read from localStorage
3. Write to Supabase with proper error handling

### Example Migration Code

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'

async function migrateClients() {
  const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
  
  for (const client of authStore.clientUsers || []) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        email: client.email,
        password_hash: await bcrypt.hash(client.password, 10),
        name: client.name,
        phone: client.phone,
        address: client.address || null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to migrate client:', client.email, error)
    } else {
      console.log('Migrated client:', data.email)
    }
  }
}

// Run migration
migrateClients().then(() => console.log('Migration complete'))
```

---

## 📚 Documentation Files

### 📖 DATABASE_SETUP_GUIDE.md
**Complete setup instructions** including:
- Prerequisites and environment setup
- Step-by-step migration execution
- Authentication and password hashing
- Testing and verification
- API integration examples
- Troubleshooting guide

### 📊 DATABASE_SCHEMA_REFERENCE.md
**Technical reference** including:
- Full Entity-Relationship Diagram (ERD)
- Table definitions and constraints
- Relationship mappings
- Security policies
- Performance optimization tips
- Data integrity rules

---

## 🔌 Integration Guide

### Update Supabase Client

Edit `lib/supabase-client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Set user context for RLS
export async function setUserContext(
  role: 'admin' | 'employee' | 'client', 
  userId: string
) {
  await supabase.rpc('set_config', {
    parameter: 'app.user_role',
    value: role
  })
  
  await supabase.rpc('set_config', {
    parameter: 'app.user_id',
    value: userId
  })
}
```

### Replace localStorage Calls

**Before** (localStorage):
```typescript
const lots = JSON.parse(localStorage.getItem('globalData') || '{}').lots
```

**After** (Supabase):
```typescript
const { data: lots, error } = await supabase
  .from('lots')
  .select('*')
  .order('created_at', { ascending: false })
```

---

## ✅ Setup Checklist

### Pre-Migration
- [ ] Backup current localStorage data
- [ ] Review existing data structure
- [ ] Plan migration strategy

### Database Setup
- [ ] Execute migration 001 (Core Tables)
- [ ] Execute migration 002 (Operational Tables)
- [ ] Execute migration 003 (System Tables)
- [ ] Execute migration 004 (Row Level Security)
- [ ] Generate and update password hashes
- [ ] Verify all tables created (28 tables)
- [ ] Verify all indexes created (75+)
- [ ] Verify all triggers created (10+)
- [ ] Verify RLS policies active (80+)

### Testing
- [ ] Test admin login
- [ ] Test employee login
- [ ] Test client registration
- [ ] Test lot creation
- [ ] Test payment processing
- [ ] Test inquiry submission
- [ ] Verify RLS permissions work
- [ ] Test soft deletes
- [ ] Verify audit trails

### Integration
- [ ] Update supabase-client.ts
- [ ] Replace auth-store.ts calls
- [ ] Replace localStorage calls with Supabase queries
- [ ] Update all CRUD operations
- [ ] Test authentication flow
- [ ] Verify session management
- [ ] Test all user workflows

### Production
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Configure connection pooling
- [ ] Enable database replication (optional)
- [ ] Document API endpoints
- [ ] Train staff on new system

---

## 🎯 Key Features

### ✅ Implemented
- **Complete schema** for all app features
- **Role-based access control** with RLS
- **Soft deletes** with audit trail
- **Automatic triggers** for data consistency
- **Activity logging** for all operations
- **Payment tracking** with balance updates
- **Interactive maps** with lot positioning
- **Inquiry management** with responses
- **Service requests** with assignments
- **Notification system** for all users
- **Content management** for website
- **System settings** configuration

### 🔮 Future Enhancements
- Full-text search on inquiries and news
- Database partitioning for large datasets
- Real-time subscriptions for live updates
- Automatic backup scheduling
- Performance monitoring dashboard
- Data archival for old records

---

## 📞 Support & Resources

### Documentation
- 📖 [Database Setup Guide](./DATABASE_SETUP_GUIDE.md)
- 📊 [Schema Reference](./DATABASE_SCHEMA_REFERENCE.md)
- 🌐 [Supabase Docs](https://supabase.com/docs)
- 🐘 [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Your Supabase Project
- **URL**: https://jpbbdfomoyisyqqtptli.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/jpbbdfomoyisyqqtptli
- **SQL Editor**: https://supabase.com/dashboard/project/jpbbdfomoyisyqqtptli/sql

---

## 📈 Migration Timeline

### Estimated Timeline: 2-4 days

**Day 1: Database Setup** (4-6 hours)
- Execute all migrations
- Update password hashes
- Test database operations
- Verify RLS policies

**Day 2: Code Integration** (6-8 hours)
- Update Supabase client
- Replace localStorage with DB queries
- Update authentication logic
- Test CRUD operations

**Day 3: Data Migration** (4-6 hours)
- Export existing localStorage data
- Transform data format
- Import to Supabase
- Verify data integrity

**Day 4: Testing & Deployment** (4-6 hours)
- End-to-end testing
- Fix any bugs
- Deploy to production
- Monitor for issues

---

## ⚠️ Important Notes

### Before Migration
1. **Backup all localStorage data** - Export to JSON files
2. **Test in development first** - Don't migrate production data immediately
3. **Update password hashes** - Never store plain text passwords

### During Migration
1. **Run migrations in order** - Dependencies exist between migrations
2. **Verify each step** - Check table count and policies after each migration
3. **Test RLS policies** - Ensure permissions work correctly

### After Migration
1. **Enable database backups** - Supabase dashboard → Database → Backups
2. **Monitor performance** - Check query execution times
3. **Document changes** - Update team on new database structure

---

**Database Version**: 1.0.0  
**Last Updated**: November 18, 2024  
**Supabase Project**: jpbbdfomoyisyqqtptli  
**PostgreSQL Version**: 15.x  
**Total Tables**: 28  
**Total Indexes**: 75+  
**Total RLS Policies**: 80+  
**Total Triggers**: 10+
