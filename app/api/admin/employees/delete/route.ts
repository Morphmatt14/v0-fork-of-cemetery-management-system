import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// DELETE EMPLOYEE API
// ============================================================================
// Soft delete an employee account
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('id')
    const username = searchParams.get('username')
    const deletedBy = searchParams.get('deletedBy')

    console.log('[Delete Employee API] Deleting employee:', { employeeId, username })

    if (!employeeId && !username) {
      return NextResponse.json(
        { success: false, error: 'Employee ID or username is required' },
        { status: 400 }
      )
    }

    // Find the employee
    let query = supabaseServer
      .from('employees')
      .select('id, username, name, email')
      .is('deleted_at', null)

    if (employeeId) {
      query = query.eq('id', employeeId)
    } else {
      query = query.eq('username', username)
    }

    const { data: employee, error: findError } = await query.single()

    if (findError || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Soft delete the employee
    const { error: deleteError } = await supabaseServer
      .from('employees')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy || null,
        status: 'inactive'
      })
      .eq('id', employee.id)

    if (deleteError) {
      console.error('[Delete Employee API] ❌ Database error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete employee' },
        { status: 500 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: 'admin',
        actor_id: deletedBy,
        actor_username: 'admin',
        action: 'EMPLOYEE_DELETED',
        details: `Deleted employee: ${employee.username}${employee.name ? ` (${employee.name})` : ''}`,
        category: 'user_management',
        status: 'success',
        severity: 'normal',
        affected_resources: [{ type: 'employee', id: employee.id, name: employee.username }]
      })

    console.log('[Delete Employee API] ✅ Employee deleted successfully:', employee.id)

    return NextResponse.json({
      success: true,
      message: `Employee '${employee.username}' deleted successfully`
    })

  } catch (error: any) {
    console.error('[Delete Employee API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
