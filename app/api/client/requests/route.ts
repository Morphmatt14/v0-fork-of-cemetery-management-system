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
 * GET /api/client/requests
 * Get all requests/inquiries for the logged-in client
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

    console.log('[Client Requests API] Fetching requests for client:', clientId)

    // Fetch inquiries for this client
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Client Requests API] Error fetching requests:', error)
      // Return empty array instead of error
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // Transform data to match client portal format
    const transformedRequests = (inquiries || []).map(inquiry => ({
      id: inquiry.id,
      subject: inquiry.subject,
      message: inquiry.message,
      type: inquiry.inquiry_type || 'General Inquiry',
      status: inquiry.status,
      lotId: inquiry.lot_id,
      createdAt: inquiry.created_at,
      responses: inquiry.admin_response ? [{
        id: 1,
        date: inquiry.updated_at,
        respondent: 'Cemetery Staff',
        message: inquiry.admin_response
      }] : [],
      ...inquiry
    }))

    console.log('[Client Requests API] Found', transformedRequests.length, 'requests')

    return NextResponse.json({
      success: true,
      data: transformedRequests,
      count: transformedRequests.length
    })

  } catch (error: any) {
    console.error('[Client Requests API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client/requests
 * Submit a new request/inquiry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, subject, message, type, lotId } = body

    if (!clientId || !subject || !message) {
      return NextResponse.json(
        { error: 'Client ID, subject, and message are required' },
        { status: 400 }
      )
    }

    console.log('[Client Requests API] Creating new request for client:', clientId)

    // Get client name
    const { data: client } = await supabase
      .from('clients')
      .select('full_name')
      .eq('id', clientId)
      .single()

    // Insert new inquiry
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        client_id: clientId,
        name: client?.full_name || 'Client',
        subject: subject,
        message: message,
        inquiry_type: type || 'General Inquiry',
        lot_id: lotId || null,
        status: 'new',
        priority: 'normal'
      })
      .select()
      .single()

    if (error) {
      console.error('[Client Requests API] Error creating request:', error)
      return NextResponse.json(
        { error: 'Failed to create request', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Client Requests API] Request created successfully')

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: 'Request submitted successfully'
    })

  } catch (error: any) {
    console.error('[Client Requests API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
