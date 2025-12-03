 import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const deletedBy = searchParams.get('deletedBy')

    const timestamp = new Date().toISOString()

    const { error: deleteError } = await supabaseServer
      .from('clients')
      .update({
        status: 'inactive',
        deleted_at: timestamp,
        deleted_by: deletedBy || null,
        updated_at: timestamp,
      })
      .eq('id', clientId)

    if (deleteError) {
      console.error('[Clients API] Failed to soft-delete client:', deleteError)
      return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Clients API] DELETE unexpected error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 })
  }
 }
