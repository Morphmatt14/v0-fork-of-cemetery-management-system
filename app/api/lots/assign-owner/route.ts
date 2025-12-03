import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

async function getClientBalance(clientId: string) {
  const { data: ownedLots, error } = await supabaseServer
    .from('lots')
    .select('balance')
    .eq('owner_id', clientId)
    .is('deleted_at', null)

  if (error) {
    console.error('[Assign Lot] Failed to fetch owned lots for balance recompute:', error)
    return 0
  }

  return (ownedLots || []).reduce((sum, lot) => sum + (Number(lot.balance) || 0), 0)
}

export async function POST(request: NextRequest) {
  try {
    const { lotId, clientId, assignedBy } = await request.json()

    if (!lotId || !clientId) {
      return NextResponse.json({ success: false, error: 'lotId and clientId are required' }, { status: 400 })
    }

    const { data: lot, error: lotError } = await supabaseServer
      .from('lots')
      .select('*')
      .eq('id', lotId)
      .is('deleted_at', null)
      .maybeSingle()

    if (lotError) {
      console.error('[Assign Lot] Failed to fetch lot:', lotError)
      return NextResponse.json({ success: false, error: 'Failed to load lot details' }, { status: 500 })
    }

    if (!lot) {
      return NextResponse.json({ success: false, error: 'Lot not found' }, { status: 404 })
    }

    if (lot.owner_id && lot.owner_id !== clientId) {
      return NextResponse.json({ success: false, error: 'Lot already assigned to another client' }, { status: 409 })
    }

    const { data: client, error: clientError } = await supabaseServer
      .from('clients')
      .select('id, name, balance')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle()

    if (clientError) {
      console.error('[Assign Lot] Failed to fetch client:', clientError)
      return NextResponse.json({ success: false, error: 'Failed to load client record' }, { status: 500 })
    }

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    const reservationDate = new Date().toISOString().split('T')[0]
    const lotBalance = typeof lot.balance === 'number' && lot.balance > 0 ? lot.balance : (Number(lot.price) || 0)

    const { data: updatedLot, error: updateLotError } = await supabaseServer
      .from('lots')
      .update({
        status: 'Reserved',
        owner_id: clientId,
        occupant_name: client.name,
        date_reserved: reservationDate,
        balance: lotBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', lotId)
      .select('*')
      .single()

    if (updateLotError || !updatedLot) {
      console.error('[Assign Lot] Failed to update lot:', updateLotError)
      return NextResponse.json({ success: false, error: 'Unable to update lot' }, { status: 500 })
    }

    const { data: link, error: linkError } = await supabaseServer
      .from('client_lots')
      .upsert(
        {
          client_id: clientId,
          lot_id: lotId,
          purchase_date: reservationDate,
          purchase_price: updatedLot.price || null,
          is_primary: true,
          notes: `Assigned via dashboard on ${reservationDate}`
        },
        { onConflict: 'client_id,lot_id' }
      )
      .select('*')
      .single()

    if (linkError) {
      console.error('[Assign Lot] Failed to link client and lot:', linkError)
      return NextResponse.json({ success: false, error: 'Unable to link client to lot' }, { status: 500 })
    }

    const recomputedBalance = await getClientBalance(clientId)

    const { error: clientUpdateError } = await supabaseServer
      .from('clients')
      .update({
        lot_id: updatedLot.id,
        balance: recomputedBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)

    if (clientUpdateError) {
      console.error('[Assign Lot] Failed to update client balance:', clientUpdateError)
    }

    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: assignedBy ? 'employee' : 'system',
        actor_id: assignedBy || null,
        actor_username: 'system',
        action: 'assign_lot_owner',
        details: `Assigned lot ${updatedLot.lot_number} to client ${client.name}`,
        category: 'lot_management',
        status: 'success',
        metadata: { lot_id: lotId, client_id: clientId }
      })

    return NextResponse.json({ success: true, data: { lot: updatedLot, client: { ...client, balance: recomputedBalance }, link } })
  } catch (error: any) {
    console.error('[Assign Lot] Unexpected error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
