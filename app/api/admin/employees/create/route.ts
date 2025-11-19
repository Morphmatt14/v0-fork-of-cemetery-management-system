import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

// ============================================================================
// CREATE EMPLOYEE API
// ============================================================================
// Create a new employee account
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, name, email, phone, createdBy } = body

    console.log('[Create Employee API] Creating employee:', { username, name, email })

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingEmployee } = await supabaseServer
      .from('employees')
      .select('id')
      .eq('username', username)
      .is('deleted_at', null)
      .single()

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists (if provided)
    if (email) {
      const { data: existingEmail } = await supabaseServer
        .from('employees')
        .select('id')
        .eq('email', email)
        .is('deleted_at', null)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create employee
    const { data: newEmployee, error } = await supabaseServer
      .from('employees')
      .insert({
        username,
        password_hash,
        name: name || null,
        email: email || null,
        phone: phone || null,
        status: 'active',
        created_by: createdBy || null
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Employee API] ❌ Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create employee' },
        { status: 500 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: 'admin',
        actor_id: createdBy,
        actor_username: 'admin',
        action: 'EMPLOYEE_CREATED',
        details: `Created new employee: ${username}${name ? ` (${name})` : ''}`,
        category: 'user_management',
        status: 'success',
        severity: 'normal'
      })

    console.log('[Create Employee API] ✅ Employee created successfully:', newEmployee.id)

    return NextResponse.json({
      success: true,
      employee: {
        id: newEmployee.id,
        username: newEmployee.username,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        status: newEmployee.status,
        created_at: newEmployee.created_at
      }
    })

  } catch (error: any) {
    console.error('[Create Employee API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
