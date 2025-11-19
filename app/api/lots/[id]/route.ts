import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { UpdateLotInput } from '@/lib/types/lots'

// ============================================================================
// GET /api/lots/[id] - Get lot details by ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('[Lots API] GET by ID:', id)

    const { data, error } = await supabaseServer
      .from('lots')
      .select(`
        *,
        cemetery_sections (
          id,
          name,
          description,
          location
        ),
        clients (
          id,
          name,
          email,
          phone,
          address
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      console.error('[Lots API] GET by ID - Not found:', error)
      return NextResponse.json(
        { success: false, error: 'Lot not found' },
        { status: 404 }
      )
    }

    console.log('[Lots API] GET by ID - Success')

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('[Lots API] GET by ID - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT /api/lots/[id] - Update lot
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateLotInput & { updated_by?: string } = await request.json()

    console.log('[Lots API] PUT - Updating lot:', id, body)

    // Check if lot exists
    const { data: existingLot } = await supabaseServer
      .from('lots')
      .select('id, lot_number, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existingLot) {
      return NextResponse.json(
        { success: false, error: 'Lot not found' },
        { status: 404 }
      )
    }

    // Validate lot_type if provided
    if (body.lot_type) {
      const validLotTypes = ['Standard', 'Premium', 'Family']
      if (!validLotTypes.includes(body.lot_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid lot_type' },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['Available', 'Reserved', 'Occupied', 'Maintenance']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        )
      }
    }

    // If changing lot_number, check uniqueness
    if (body.lot_number && body.lot_number !== existingLot.lot_number) {
      const { data: duplicate } = await supabaseServer
        .from('lots')
        .select('id')
        .eq('lot_number', body.lot_number)
        .is('deleted_at', null)
        .single()

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Lot number ${body.lot_number} already exists` },
          { status: 400 }
        )
      }
    }

    // Verify section if changing
    if (body.section_id) {
      const { data: section } = await supabaseServer
        .from('cemetery_sections')
        .select('id')
        .eq('id', body.section_id)
        .is('deleted_at', null)
        .single()

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Cemetery section not found' },
          { status: 404 }
        )
      }
    }

    // Verify owner if setting
    if (body.owner_id) {
      const { data: client } = await supabaseServer
        .from('clients')
        .select('id')
        .eq('id', body.owner_id)
        .is('deleted_at', null)
        .single()

      if (!client) {
        return NextResponse.json(
          { success: false, error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Set dates based on status changes
    if (body.status === 'Reserved' && existingLot.status !== 'Reserved') {
      updateData.date_reserved = new Date().toISOString().split('T')[0]
    }
    if (body.status === 'Occupied' && existingLot.status !== 'Occupied') {
      updateData.date_occupied = new Date().toISOString().split('T')[0]
    }

    // Remove updated_by from update data
    const { updated_by, ...dataToUpdate } = updateData

    // Update lot
    const { data: updatedLot, error: updateError } = await supabaseServer
      .from('lots')
      .update(dataToUpdate)
      .eq('id', id)
      .select(`
        *,
        cemetery_sections (
          id,
          name,
          description
        ),
        clients (
          id,
          name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('[Lots API] PUT - Update error:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: updated_by ? 'employee' : 'system',
        actor_id: updated_by || null,
        actor_username: 'system',
        action: 'update_lot',
        details: `Updated lot ${existingLot.lot_number}`,
        category: 'lot_management',
        status: 'success',
        metadata: { changes: body },
      })

    console.log('[Lots API] PUT - Success')

    return NextResponse.json({
      success: true,
      data: updatedLot,
    })
  } catch (error: any) {
    console.error('[Lots API] PUT - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/lots/[id] - Soft delete lot
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const deleted_by = searchParams.get('deleted_by') || undefined

    console.log('[Lots API] DELETE - Soft deleting lot:', id)

    // Check if lot exists
    const { data: existingLot } = await supabaseServer
      .from('lots')
      .select('id, lot_number, status, owner_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existingLot) {
      return NextResponse.json(
        { success: false, error: 'Lot not found' },
        { status: 404 }
      )
    }

    // Check if lot is occupied or reserved
    if (existingLot.status === 'Occupied' || existingLot.status === 'Reserved') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete lot with status: ${existingLot.status}. Please change status to Available first.` 
        },
        { status: 400 }
      )
    }

    // Check if lot has an owner
    if (existingLot.owner_id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete lot that has an owner. Remove owner first.' },
        { status: 400 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabaseServer
      .from('lots')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deleted_by || null,
      })
      .eq('id', id)

    if (deleteError) {
      console.error('[Lots API] DELETE - Error:', deleteError)
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 400 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: deleted_by ? 'employee' : 'system',
        actor_id: deleted_by || null,
        actor_username: 'system',
        action: 'delete_lot',
        details: `Deleted lot ${existingLot.lot_number}`,
        category: 'lot_management',
        status: 'success',
      })

    console.log('[Lots API] DELETE - Success')

    return NextResponse.json({
      success: true,
      message: 'Lot deleted successfully',
    })
  } catch (error: any) {
    console.error('[Lots API] DELETE - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
