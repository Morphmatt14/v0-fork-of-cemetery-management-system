// ============================================================================
// SERVER-SIDE SUPABASE CLIENT
// ============================================================================
// Uses service_role key for elevated permissions (bypasses RLS)
// ⚠️ ONLY use this on the server side (API routes, server components)
// NEVER expose service_role key to the client
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Environment variables validated

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables')
}

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
}

// Server-side client with service role (bypasses RLS)
// IMPORTANT: Use service_role key as BOTH parameters to bypass all RLS
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// Supabase server client ready for API routes
