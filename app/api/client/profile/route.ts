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
 * GET /api/client/profile
 * Get the logged-in client's profile information
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

    console.log('[Client Profile API] Fetching profile for client:', clientId)

    // Fetch client data from database
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) {
      console.error('[Client Profile API] Error fetching client:', error)
      return NextResponse.json(
        { error: 'Failed to fetch client profile', details: error.message },
        { status: 500 }
      )
    }

    if (!client) {
      console.log('[Client Profile API] Client not found with ID:', clientId)
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data (handle both password and password_hash)
    const { password, password_hash, ...clientProfile } = client

    console.log('[Client Profile API] Profile fetched successfully for:', client.email)

    return NextResponse.json({
      success: true,
      data: {
        ...clientProfile,
        name: client.name || client.full_name,
        full_name: client.full_name || client.name
      }
    })

  } catch (error: any) {
    console.error('[Client Profile API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
