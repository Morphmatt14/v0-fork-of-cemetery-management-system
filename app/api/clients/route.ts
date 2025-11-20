import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/supabase-client'

// ============================================================================
// POST /api/clients - Create new client
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[Clients API] Creating client:', body.email)

    // Validate required fields
    if (!body.email || !body.password_hash || !body.name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, name'
      }, { status: 400 })
    }

    // Hash the password if it's not already hashed
    let passwordHash = body.password_hash
    if (!passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$')) {
      passwordHash = await hashPassword(body.password_hash)
    }

    // Prepare client data
    const now = new Date().toISOString()
    const clientData = {
      email: body.email,
      password_hash: passwordHash,
      name: body.name,
      phone: body.phone || null,
      address: body.address || null,
      status: (body.status || 'active').toLowerCase(), // Ensure lowercase for DB constraint
      balance: body.balance || 0,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      notes: body.notes || null,
      join_date: now.split('T')[0], // Add join_date as YYYY-MM-DD
      created_at: now,
      updated_at: now
    }

    // Insert into database
    const { data, error } = await supabaseServer
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    if (error) {
      console.error('[Clients API] Database error:', error)

      // Check for duplicate email
      if (error.code === '23505' && error.message.includes('clients_email_key')) {
        return NextResponse.json({
          success: false,
          error: 'A client with this email address already exists.'
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to create client'
      }, { status: 500 })
    }

    console.log('[Clients API] Client created successfully:', data.id)

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })

  } catch (error) {
    console.error('[Clients API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// GET /api/clients - Get clients or check email existence
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const column = searchParams.get('column')
    const value = searchParams.get('value')

    // Check if specific query (e.g., email existence check)
    if (column && value) {
      console.log(`[Clients API] Checking ${column}:`, value)

      const { data, error } = await supabaseServer
        .from('clients')
        .select('id, email, name')
        .eq(column, value)
        .maybeSingle()

      if (error) {
        console.error('[Clients API] Query error:', error)
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        exists: !!data,
        data
      })
    }

    // Otherwise return all clients (with pagination in future)
    const { data, error } = await supabaseServer
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[Clients API] Query error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Clients API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
