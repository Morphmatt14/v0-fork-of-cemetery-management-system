import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// POST /api/maps/[id]/positions - Save lot position on map
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: mapId } = params
    const body = await request.json()

    console.log('[Maps API] POST - Saving lot position on map:', mapId, 'lot:', body.lot_id)

    // Check if position already exists
    const { data: existing } = await supabaseServer
      .from('map_lot_positions')
      .select('id')
      .eq('map_id', mapId)
      .eq('lot_id', body.lot_id)
      .single()

    let data, error

    if (existing) {
      // Update existing position
      const result = await supabaseServer
        .from('map_lot_positions')
        .update({
          x_position: body.x_position,
          y_position: body.y_position,
          width: body.width || 50,
          height: body.height || 50,
          rotation: body.rotation || 0,
          color: body.color || null,
          label: body.label || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Create new position
      const result = await supabaseServer
        .from('map_lot_positions')
        .insert({
          map_id: mapId,
          lot_id: body.lot_id,
          x_position: body.x_position,
          y_position: body.y_position,
          width: body.width || 50,
          height: body.height || 50,
          rotation: body.rotation || 0,
          color: body.color || null,
          label: body.label || null,
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error('[Maps API] POST - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save lot position' },
        { status: 500 }
      )
    }

    // Also update the lot's map_id if not set
    if (body.lot_id) {
      await supabaseServer
        .from('lots')
        .update({ map_id: mapId })
        .eq('id', body.lot_id)
    }

    console.log('[Maps API] POST - Success: Position saved')

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('[Maps API] POST - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/maps/[id]/positions/[lotId] - Remove lot position from map
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: mapId } = params
    const { searchParams } = new URL(request.url)
    const lotId = searchParams.get('lot_id')

    if (!lotId) {
      return NextResponse.json(
        { success: false, error: 'lot_id is required' },
        { status: 400 }
      )
    }

    console.log('[Maps API] DELETE - Removing lot position:', lotId, 'from map:', mapId)

    const { error } = await supabaseServer
      .from('map_lot_positions')
      .delete()
      .eq('map_id', mapId)
      .eq('lot_id', lotId)

    if (error) {
      console.error('[Maps API] DELETE - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to remove lot position' },
        { status: 500 }
      )
    }

    console.log('[Maps API] DELETE - Success: Position removed')

    return NextResponse.json({
      success: true,
      message: 'Lot position removed successfully',
    })
  } catch (error: any) {
    console.error('[Maps API] DELETE - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
