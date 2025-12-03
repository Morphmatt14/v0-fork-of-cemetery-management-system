import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// GET /api/maps - List all cemetery maps
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const section_id = searchParams.get('section_id') || undefined

    console.log('[Maps API] GET - Fetching maps')

    // Build query
    let query = supabaseServer
      .from('cemetery_maps')
      .select(`
        *,
        cemetery_sections (
          id,
          name,
          description
        ),
        map_lot_positions (
          id,
          lot_id,
          x_position,
          y_position,
          width,
          height,
          rotation,
          color,
          label,
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
        )
      `)
      .is('deleted_at', null)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (section_id) {
      query = query.eq('section_id', section_id)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('[Maps API] GET - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch maps' },
        { status: 500 }
      )
    }

    console.log(`[Maps API] GET - Success: ${data?.length} maps fetched`)

    return NextResponse.json({
      success: true,
      data: data || [],
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
// POST /api/maps - Create a new cemetery map
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[Maps API] POST - Creating map:', body.name)

    const { data, error } = await supabaseServer
      .from('cemetery_maps')
      .insert({
        name: body.name,
        description: body.description,
        section_id: body.section_id || null,
        image_url: body.image_url,
        image_public_id: body.image_public_id || null,
        google_maps_url: body.google_maps_url || null,
        width: body.width || 1200,
        height: body.height || 800,
        status: body.status || 'active',
        is_published: body.is_published !== undefined ? body.is_published : false,
        notes: body.notes || null,
        created_by: body.created_by || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Maps API] POST - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create map' },
        { status: 500 }
      )
    }

    console.log('[Maps API] POST - Success: Map created:', data.id)

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
