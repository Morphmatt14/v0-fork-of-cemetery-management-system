import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// GET /api/maps/[id] - Get single map with lot positions
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('[Maps API] GET - Fetching map:', id)

    // Fetch map details
    const { data: map, error: mapError } = await supabaseServer
      .from('cemetery_maps')
      .select(`
        *,
        cemetery_sections (
          id,
          name,
          description
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (mapError || !map) {
      console.error('[Maps API] GET - Map not found:', mapError)
      return NextResponse.json(
        { success: false, error: 'Map not found' },
        { status: 404 }
      )
    }

    // Fetch lot positions for this map
    const { data: positions, error: positionsError } = await supabaseServer
      .from('map_lot_positions')
      .select(`
        *,
        lots (
          id,
          lot_number,
          lot_type,
          status,
          price,
          dimensions,
          occupant_name,
          owner_id
        )
      `)
      .eq('map_id', id)

    if (positionsError) {
      console.error('[Maps API] GET - Positions error:', positionsError)
    }

    // Also fetch lots directly linked to this map (via lots.map_id)
    const { data: directLots, error: lotsError } = await supabaseServer
      .from('lots')
      .select('*')
      .eq('map_id', id)
      .is('deleted_at', null)

    if (lotsError) {
      console.error('[Maps API] GET - Lots error:', lotsError)
    }

    console.log('[Maps API] GET - Success: Map fetched with', positions?.length || 0, 'positions')

    return NextResponse.json({
      success: true,
      data: {
        ...map,
        lot_positions: positions || [],
        lots: directLots || [],
      },
    })
  } catch (error: any) {
    console.error('[Maps API] GET - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT /api/maps/[id] - Update map
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    console.log('[Maps API] PUT - Updating map:', id)

    const { data, error } = await supabaseServer
      .from('cemetery_maps')
      .update({
        name: body.name,
        description: body.description,
        section_id: body.section_id,
        image_url: body.image_url,
        image_public_id: body.image_public_id,
        google_maps_url: body.google_maps_url,
        width: body.width,
        height: body.height,
        status: body.status,
        is_published: body.is_published,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      console.error('[Maps API] PUT - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update map' },
        { status: 500 }
      )
    }

    console.log('[Maps API] PUT - Success: Map updated')

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('[Maps API] PUT - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/maps/[id] - Soft delete map
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('[Maps API] DELETE - Deleting map:', id)

    const { error } = await supabaseServer
      .from('cemetery_maps')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('[Maps API] DELETE - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete map' },
        { status: 500 }
      )
    }

    try {
      const now = new Date().toISOString()

      const { error: lotsError } = await supabaseServer
        .from('lots')
        .update({ deleted_at: now })
        .eq('map_id', id)

      if (lotsError) {
        console.error('[Maps API] DELETE - Failed to soft-delete lots for map:', lotsError)
      }

      const { error: positionsError } = await supabaseServer
        .from('map_lot_positions')
        .delete()
        .eq('map_id', id)

      if (positionsError) {
        console.error('[Maps API] DELETE - Failed to delete map_lot_positions for map:', positionsError)
      }
    } catch (cleanupError) {
      console.error('[Maps API] DELETE - Cleanup error while deleting map lots/positions:', cleanupError)
    }

    console.log('[Maps API] DELETE - Success: Map deleted and related lots/positions cleaned up')

    return NextResponse.json({
      success: true,
      message: 'Map and related lots deleted successfully',
    })
  } catch (error: any) {
    console.error('[Maps API] DELETE - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
