import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import type { CreateLotInput, LotFilters } from '@/lib/types/lots'

// ============================================================================
// GET /api/lots - List all lots with filters and pagination
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const filters: LotFilters = {
      status: searchParams.get('status') as any,
      section_id: searchParams.get('section_id') || undefined,
      lot_type: searchParams.get('lot_type') as any,
      owner_id: searchParams.get('owner_id') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sort_by: (searchParams.get('sort_by') || 'created_at') as any,
      sort_order: (searchParams.get('sort_order') || 'desc') as any,
    }

    const offset = ((filters.page || 1) - 1) * (filters.limit || 20)

    console.log('[Lots API] GET - Filters:', filters)

    // Build query with relations
    let query = supabaseServer
      .from('lots')
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
      `, { count: 'exact' })
      .is('deleted_at', null)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.section_id) {
      query = query.eq('section_id', filters.section_id)
    }
    if (filters.lot_type) {
      query = query.eq('lot_type', filters.lot_type)
    }
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    if (filters.search) {
      query = query.or(`lot_number.ilike.%${filters.search}%,occupant_name.ilike.%${filters.search}%`)
    }

    // Apply sorting
    query = query.order(filters.sort_by || 'created_at', { 
      ascending: filters.sort_order === 'asc' 
    })

    // Apply pagination
    query = query.range(offset, offset + (filters.limit || 20) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[Lots API] GET - Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lots' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / (filters.limit || 20))

    console.log(`[Lots API] GET - Success: ${data?.length} lots fetched`)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error('[Lots API] GET - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/lots - Create new lot
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body: CreateLotInput = await request.json()

    console.log('[Lots API] POST - Creating lot:', body)

    // Validate required fields
    if (!body.lot_number || !body.section_id || !body.lot_type || !body.price) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: lot_number, section_id, lot_type, price' 
        },
        { status: 400 }
      )
    }

    // Validate lot_type
    const validLotTypes = ['Standard', 'Premium', 'Family']
    if (!validLotTypes.includes(body.lot_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid lot_type. Must be: Standard, Premium, or Family' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['Available', 'Reserved', 'Occupied', 'Maintenance']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be: Available, Reserved, Occupied, or Maintenance' },
          { status: 400 }
        )
      }
    }

    // Check if lot_number already exists
    const { data: existingLot } = await supabaseServer
      .from('lots')
      .select('id')
      .eq('lot_number', body.lot_number)
      .is('deleted_at', null)
      .single()

    if (existingLot) {
      return NextResponse.json(
        { success: false, error: `Lot number ${body.lot_number} already exists` },
        { status: 400 }
      )
    }

    // Verify section exists
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

    // Insert lot
    const { data: newLot, error: insertError } = await supabaseServer
      .from('lots')
      .insert({
        lot_number: body.lot_number,
        section_id: body.section_id,
        lot_type: body.lot_type,
        status: body.status || 'Available',
        price: body.price,
        dimensions: body.dimensions,
        features: body.features,
        description: body.description,
        created_by: body.created_by,
        date_added: new Date().toISOString().split('T')[0],
      })
      .select(`
        *,
        cemetery_sections (
          id,
          name,
          description
        )
      `)
      .single()

    if (insertError) {
      console.error('[Lots API] POST - Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 400 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: body.created_by ? 'employee' : 'system',
        actor_id: body.created_by || null,
        actor_username: 'system',
        action: 'create_lot',
        details: `Created lot ${body.lot_number} in section ${section.id}`,
        category: 'lot_management',
        status: 'success',
      })

    console.log('[Lots API] POST - Success: Lot created:', newLot.id)

    return NextResponse.json(
      { success: true, data: newLot },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Lots API] POST - Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
