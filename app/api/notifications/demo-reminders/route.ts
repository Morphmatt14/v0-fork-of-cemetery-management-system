import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/services/email'

const HUMAN_STATUSES = ['Pending', 'Due', 'Under Payment', 'Overdue']

const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)

const formatDate = (value?: string | null) => {
  if (!value) return 'soon'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const diffDescription = (dueDate?: string | null) => {
  if (!dueDate) return 'soon'
  const now = new Date()
  const target = new Date(dueDate)
  if (Number.isNaN(target.getTime())) return 'soon'
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return 'less than a day'
  const diffMinutes = Math.ceil(diffMs / 60000)
  const diffDays = Math.floor(diffMinutes / (60 * 24))
  const diffHours = Math.floor((diffMinutes - diffDays * 24 * 60) / 60)
  if (diffDays > 0) {
    return diffHours > 0 ? `${diffDays} day${diffDays === 1 ? '' : 's'} and ${diffHours} hour${diffHours === 1 ? '' : 's'}` : `${diffDays} day${diffDays === 1 ? '' : 's'}`
  }
  return `${Math.max(diffHours, 1)} hour${diffHours === 1 ? '' : 's'}`
}

type ReminderRow = {
  id: string
  client_id: string
  amount: number | null
  payment_date: string | null
  payment_status: string | null
  lot_id: string | null
  clients?: { name?: string | null; email?: string | null } | { name?: string | null; email?: string | null }[] | null
  lots?: { lot_number?: string | null } | { lot_number?: string | null }[] | null
}

const resolveSingle = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const body = await request.json().catch(() => ({}))

    const intervalMinutesRaw = body.intervalMinutes ?? searchParams.get('intervalMinutes') ?? 5
    const intervalMinutes = Math.min(60, Math.max(1, Number(intervalMinutesRaw) || 5))

    const clientId = body.clientId ?? searchParams.get('clientId') ?? null
    const limitParam = body.limit ?? searchParams.get('limit')
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : null
    const lookaheadDaysParam = body.lookaheadDays ?? searchParams.get('lookaheadDays')
    const lookaheadDays = Math.max(1, Math.min(30, Number(lookaheadDaysParam) || 5))

    const now = new Date()
    const lookaheadDate = new Date(now.getTime() + lookaheadDays * 24 * 60 * 60 * 1000)

    let query = supabaseServer
      .from('payments')
      .select(
        `id, client_id, amount, payment_date, payment_status, lot_id,
         clients:client_id(name, email),
         lots:lot_id(lot_number)`
      )
      .in('payment_status', HUMAN_STATUSES)
      .is('deleted_at', null)
      .lte('payment_date', lookaheadDate.toISOString())
      .order('payment_date', { ascending: true })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (limit) {
      query = query.limit(limit)
    }

    const { data: payments, error } = await query

    if (error) {
      console.error('[Demo Reminders] Failed to fetch payments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments for reminders' },
        { status: 500 }
      )
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ success: true, remindersSent: 0, details: [] })
    }

    const reminders: Array<{ paymentId: string; sent: boolean; reason?: string }> = []

    for (const rawPayment of payments as ReminderRow[]) {
      const payment = rawPayment
      const client = resolveSingle(payment.clients)
      const lot = resolveSingle(payment.lots)

      const clientEmail = client?.email
      if (!clientEmail) {
        reminders.push({ paymentId: payment.id, sent: false, reason: 'Missing client email' })
        continue
      }

      const lotLabel = lot?.lot_number || payment.lot_id || 'your lot'
      const countdown = diffDescription(payment.payment_date)
      const dueDateLabel = formatDate(payment.payment_date)
      const amountLabel = formatCurrency(payment.amount)
      const dueFragment = payment.payment_date ? ` (due on ${dueDateLabel})` : ''
      const subject = `Payment Reminder – Lot ${lotLabel}`

      const html = `
        <p>Hi ${client?.name || 'Client'},</p>
        <p>This is a friendly reminder that your payment for <strong>Lot ${lotLabel}</strong> is due in ${countdown}${dueFragment}. Please settle <strong>${amountLabel}</strong> before the deadline to keep your account in good standing.</p>
        <p>You can:</p>
        <ol>
          <li>Visit the client portal to download your latest invoice or view your ownership certificate.</li>
          <li>Pay in person at the Surigao Memorial Park office.</li>
          <li>Send a bank transfer and upload the receipt in the portal.</li>
        </ol>
        <p>We’ll continue sending a reminder every ${intervalMinutes}-minute${intervalMinutes === 1 ? '' : 's'} for demo purposes until the payment is marked as received. If you’ve already paid, please ignore this message.</p>
        <p>Thank you,<br/>Surigao Memorial Park Team</p>
      `

      try {
        const emailResult = await sendEmail({ to: clientEmail, subject, html })
        if (!emailResult || (emailResult as any).success === false) {
          throw new Error((emailResult as any)?.error?.message || 'Email send failed')
        }
        reminders.push({ paymentId: payment.id, sent: true })
      } catch (sendError: any) {
        console.error('[Demo Reminders] Failed to send email:', sendError)
        reminders.push({ paymentId: payment.id, sent: false, reason: sendError?.message || 'Send error' })
      }
    }

    const remindersSent = reminders.filter((r) => r.sent).length

    return NextResponse.json({ success: true, remindersSent, details: reminders })
  } catch (error: any) {
    console.error('[Demo Reminders] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
