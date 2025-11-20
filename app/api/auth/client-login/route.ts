import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * POST /api/auth/client-login
 * Authenticate client with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('[Client Login API] Login attempt for email:', email)

    // Find client by email
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !client) {
      console.log('[Client Login API] Client not found')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password (database uses password_hash field)
    const passwordMatch = await bcrypt.compare(password, client.password_hash)

    if (!passwordMatch) {
      console.log('[Client Login API] Password mismatch')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if client account is active
    if (client.status !== 'active') {
      console.log('[Client Login API] Client account not active:', client.status)
      return NextResponse.json(
        { error: 'Your account is not active. Please contact cemetery administration.' },
        { status: 403 }
      )
    }

    console.log('[Client Login API] Login successful for client:', client.id)

    // Return client data (without password_hash)
    const { password_hash: _, ...clientData } = client

    return NextResponse.json({
      success: true,
      user: {
        id: client.id,
        name: client.name || client.full_name, // Try both name fields for compatibility
        email: client.email,
        phone: client.phone,
        ...clientData
      },
      message: 'Login successful'
    })

  } catch (error: any) {
    console.error('[Client Login API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
