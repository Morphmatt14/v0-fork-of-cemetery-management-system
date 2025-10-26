# Supabase Backend Setup Guide

## Overview
This cemetery management system is integrated with Supabase for data persistence, authentication, and real-time updates.

## Project Details
- **Project ID**: jbdxvyelmrzondimdlld
- **Supabase URL**: https://jbdxvyelmrzondimdlld.supabase.co

## Environment Variables Setup

### 1. Get Your Credentials
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **jbdxvyelmrzondimdlld**
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_KEY` (keep this secret!)

### 2. Update .env.local
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://jbdxvyelmrzondimdlld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
\`\`\`

## Database Schema

### Tables Created

#### 1. Clients Table
\`\`\`sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Active',
  join_date TEXT DEFAULT CURRENT_DATE::TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### 2. Lots Table
\`\`\`sql
CREATE TABLE lots (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Available',
  price DECIMAL NOT NULL,
  dimensions TEXT,
  features TEXT,
  description TEXT,
  owner_id UUID REFERENCES clients(id),
  occupant_name TEXT,
  date_added TEXT DEFAULT CURRENT_DATE::TEXT,
  date_occupied TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### 3. Payments Table
\`\`\`sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  lot_id TEXT NOT NULL REFERENCES lots(id),
  date TEXT DEFAULT CURRENT_DATE::TEXT,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  method TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### 4. Inquiries Table
\`\`\`sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  priority TEXT DEFAULT 'normal',
  assigned_to TEXT,
  date_created TEXT DEFAULT CURRENT_DATE::TEXT,
  date_resolved TEXT,
  resolved_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### 5. Burials Table
\`\`\`sql
CREATE TABLE burials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  lot_id TEXT NOT NULL REFERENCES lots(id),
  family_name TEXT NOT NULL,
  cause_of_death TEXT NOT NULL,
  funeral_location TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Row Level Security (RLS) Policies

### Enable RLS on All Tables
\`\`\`sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE burials ENABLE ROW LEVEL SECURITY;
\`\`\`

### Create Policies for Authenticated Users
\`\`\`sql
-- Allow authenticated users to read their own data
CREATE POLICY "Allow users to read their own data"
ON clients FOR SELECT USING (
  auth.uid()::text = id
);

-- Allow service role to perform all operations
CREATE POLICY "Service role has full access"
ON clients FOR ALL USING (
  auth.role() = 'service_role'
);
\`\`\`

## Using Supabase in Components

### Example: Fetch Clients
\`\`\`typescript
import { supabase } from "@/lib/supabase"

const { data: clients, error } = await supabase
  .from("clients")
  .select("*")
  .eq("status", "Active")

if (error) console.error("Error:", error)
else console.log("Clients:", clients)
\`\`\`

### Example: Create a New Client
\`\`\`typescript
const { data, error } = await supabase
  .from("clients")
  .insert([
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "09123456789",
      status: "Active",
    },
  ])
  .select()

if (error) console.error("Error:", error)
else console.log("New client:", data?.[0])
\`\`\`

### Example: Update Client
\`\`\`typescript
const { data, error } = await supabase
  .from("clients")
  .update({ status: "Inactive" })
  .eq("id", clientId)
  .select()

if (error) console.error("Error:", error)
else console.log("Updated:", data?.[0])
\`\`\`

### Example: Delete Client
\`\`\`typescript
const { error } = await supabase
  .from("clients")
  .delete()
  .eq("id", clientId)

if (error) console.error("Error:", error)
else console.log("Client deleted")
\`\`\`

## Real-time Subscriptions

### Subscribe to Changes
\`\`\`typescript
const subscription = supabase
  .channel("clients-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "clients" },
    (payload) => {
      console.log("Change received!", payload)
    }
  )
  .subscribe()

// Unsubscribe when done
subscription.unsubscribe()
\`\`\`

## Authentication Setup (Optional)

### Enable Email Authentication
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email Provider**
4. Configure email templates if needed

### Sign Up Example
\`\`\`typescript
import { supabase } from "@/lib/supabase"

const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "SecurePassword123!",
})

if (error) console.error("Error:", error)
else console.log("User signed up:", data.user)
\`\`\`

### Sign In Example
\`\`\`typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "SecurePassword123!",
})

if (error) console.error("Error:", error)
else console.log("User signed in:", data.user)
\`\`\`

## Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check Supabase project status in dashboard
- Ensure network connectivity

### Authentication Errors
- Clear browser cookies/localStorage
- Check RLS policies are correctly configured
- Verify user has necessary permissions

### Data Not Persisting
- Ensure tables exist in Supabase
- Check RLS policies allow insert/update operations
- Verify error responses in browser console

## API Reference

See `lib/supabase.ts` and `lib/supabase-server.ts` for available functions and helper methods.

## Support
For issues with Supabase, visit: https://supabase.com/docs
