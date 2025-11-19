import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// ============================================================================
// USER CONTEXT FOR ROW LEVEL SECURITY (RLS)
// ============================================================================

/**
 * Set user context for RLS policies
 * Must be called after successful login to enable proper data access
 */
export async function setUserContext(
  role: 'admin' | 'employee' | 'client',
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Set user role
    const { error: roleError } = await supabase.rpc('set_config', {
      parameter: 'app.user_role',
      value: role
    })
    
    if (roleError) throw roleError

    // Set user ID
    const { error: idError } = await supabase.rpc('set_config', {
      parameter: 'app.user_id',
      value: userId
    })
    
    if (idError) throw idError

    return { success: true }
  } catch (error: any) {
    console.error('Failed to set user context:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Clear user context (logout)
 */
export async function clearUserContext(): Promise<void> {
  try {
    await supabase.rpc('set_config', {
      parameter: 'app.user_role',
      value: ''
    })
    
    await supabase.rpc('set_config', {
      parameter: 'app.user_id',
      value: ''
    })
  } catch (error) {
    console.error('Failed to clear user context:', error)
  }
}

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - Bcrypt hash from database
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const cleanHash = hash?.trim()
    return await bcrypt.compare(password, cleanHash)
  } catch (error) {
    console.error('[VerifyPassword] Error:', error)
    return false
  }
}
