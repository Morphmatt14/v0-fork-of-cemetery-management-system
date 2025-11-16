import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to hash passwords (in production, use bcrypt on server)
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, we'll use a simple hash
  // In production, use bcrypt or similar on the server side
  return `hashed_${password}`
}

// Verify password (in production, use bcrypt.compare on server)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return hash === `hashed_${password}`
}
