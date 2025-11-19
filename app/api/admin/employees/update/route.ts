import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

// ============================================================================
// UPDATE EMPLOYEE API
// ============================================================================
// Update employee account information
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, password, status, updatedBy } = body

    console.log('[Update Employee API] Updating employee:', { id, name, email })

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const { data: existingEmployee, error: findError } = await supabaseServer
      .from('employees')
      .select('id, username, email')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (findError || !existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingEmployee.email) {
      const { data: existingEmail } = await supabaseServer
        .from('employees')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .is('deleted_at', null)
        .single()

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another employee' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null
    if (status !== undefined) updateData.status = status

    // Hash new password if provided
    if (password) {
      const saltRounds = 10
      updateData.password_hash = await bcrypt.hash(password, saltRounds)
    }

    // Update employee
    const { data: updatedEmployee, error: updateError } = await supabaseServer
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[Update Employee API] ❌ Database error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update employee' },
        { status: 500 }
      )
    }

    // Log activity
    const changedFields = Object.keys(updateData).filter(key => key !== 'password_hash')
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: 'admin',
        actor_id: updatedBy,
        actor_username: 'admin',
        action: 'EMPLOYEE_UPDATED',
        details: `Updated employee: ${existingEmployee.username}. Changed fields: ${changedFields.join(', ')}`,
        category: 'user_management',
        status: 'success',
        severity: 'normal',
        affected_resources: [{ type: 'employee', id: updatedEmployee.id, name: existingEmployee.username }]
      })

    console.log('[Update Employee API] ✅ Employee updated successfully:', updatedEmployee.id)

    return NextResponse.json({
      success: true,
      employee: {
        id: updatedEmployee.id,
        username: updatedEmployee.username,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        status: updatedEmployee.status,
        created_at: updatedEmployee.created_at
      }
    })

  } catch (error: any) {
    console.error('[Update Employee API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}
