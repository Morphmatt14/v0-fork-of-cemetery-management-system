import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key to bypass RLS
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
 * GET /api/client/lots
 * Get all lots assigned to the logged-in client
 */
export async function GET(request: NextRequest) {
  try {
    // Get client ID from query params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    console.log('[Client Lots API] Fetching lots for client:', clientId)

    // Fetch lots assigned to this client
    const { data: lots, error } = await supabase
      .from('lots')
      .select('*')
      .eq('owner_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Client Lots API] Error fetching lots:', error)
      // Return empty array instead of error
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    if (!lots || lots.length === 0) {
      console.log('[Client Lots API] Client has no lots')
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // Fetch burials for these lots (if any)
    const lotIds = lots.map(lot => lot.id)
    const { data: burials } = await supabase
      .from('burials')
      .select('*')
      .in('lot_id', lotIds)

    // Transform data to match client portal format
    const transformedLots = lots.map(lot => {
      const lotBurials = burials?.filter(b => b.lot_id === lot.id) || []
      const firstBurial = lotBurials[0]

      const dbId = lot.id
      const lotLabel = lot.lot_number || dbId
      const price = Number(lot.price) || 0
      const balance = typeof lot.balance === 'number' ? lot.balance : price

      return {
        // include all raw lot fields first
        ...lot,
        // stable UUID id used for joins and calculations
        id: dbId,
        // friendly label for UI display
        lotLabel,
        section: lot.section,
        type: lot.lot_type,
        status: lot.status,
        occupant: firstBurial?.deceased_name || null,
        burialDate: firstBurial?.burial_date || null,
        purchaseDate: lot.created_at,
        price,
        balance,
        size: lot.dimensions || 'N/A',
      }
    })

    console.log('[Client Lots API] Found', transformedLots.length, 'lots')

    return NextResponse.json({
      success: true,
      data: transformedLots,
      count: transformedLots.length
    })

  } catch (error: any) {
    console.error('[Client Lots API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
