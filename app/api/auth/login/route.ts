import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

// ============================================================================
// SERVER-SIDE LOGIN API
// ============================================================================
// This runs on the server where bcrypt works properly
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, userType } = body

    console.log('[API] Login attempt:', { username, userType })

    // Validate input
    if (!username || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine which table to query
    const table = userType === 'admin' ? 'admins' : 
                  userType === 'employee' ? 'employees' : 'clients'
    
    const usernameField = userType === 'client' ? 'email' : 'username'

    // Fetch user from database
    const { data: user, error } = await supabaseServer
      .from(table)
      .select('*')
      .eq(usernameField, username)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (error || !user) {
      console.log('[API] User not found:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('[API] User found:', { 
      id: user.id, 
      username: user.username || user.email 
    })

    // Verify password using bcrypt (server-side)
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    console.log('[API] Password verification:', passwordValid)

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await supabaseServer
      .from(table)
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: userType,
        actor_id: user.id,
        actor_username: user.username || user.email,
        action: 'login',
        details: `${userType} logged in successfully`,
        category: 'system',
        status: 'success',
        timestamp: new Date().toISOString()
      })

    // Return user data (without password hash)
    const userData = {
      id: user.id,
      username: user.username || undefined,
      email: user.email,
      name: user.name,
      status: user.status,
      created_at: user.created_at,
      last_login: user.last_login
    }

    console.log('[API] ✅ Login successful')

    return NextResponse.json({
      success: true,
      user: userData,
      role: userType
    })

  } catch (error: any) {
    console.error('[API] Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
