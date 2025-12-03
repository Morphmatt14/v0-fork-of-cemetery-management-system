import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 })
    }

    const { data: plans, error: plansError } = await supabaseServer
      .from('payment_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (plansError) {
      console.error('[Client Payment Plans] Failed to fetch plans:', plansError)
      return NextResponse.json({ success: false, error: 'Failed to fetch payment plans' }, { status: 500 })
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const planIds = plans.map((plan) => plan.id)

    const { data: installments, error: installmentsError } = await supabaseServer
      .from('payment_installments')
      .select('*, invoices:invoices(*)')
      .in('plan_id', planIds)
      .order('due_date', { ascending: true })

    if (installmentsError) {
      console.error('[Client Payment Plans] Failed to fetch installments:', installmentsError)
      return NextResponse.json({ success: false, error: 'Failed to fetch installments' }, { status: 500 })
    }

    const installmentsByPlan = installments?.reduce<Record<string, any[]>>((acc, installment) => {
      const bucket = acc[installment.plan_id] || []
      bucket.push(installment)
      acc[installment.plan_id] = bucket
      return acc
    }, {}) ?? {}

    const plansWithInstallments = plans.map((plan) => ({
      ...plan,
      installments: (installmentsByPlan[plan.id] || []).map((inst) => ({
        id: inst.id,
        due_date: inst.due_date,
        amount: inst.amount,
        status: inst.status,
        reminder_sent_at: inst.reminder_sent_at,
        paid_at: inst.paid_at,
        invoice: inst.invoices ? {
          id: inst.invoices.id,
          invoice_number: inst.invoices.invoice_number,
          pdf_url: inst.invoices.pdf_url,
          status: inst.invoices.status,
          generated_at: inst.invoices.generated_at
        } : null
      }))
    }))

    return NextResponse.json({ success: true, data: plansWithInstallments })
  } catch (error) {
    console.error('[Client Payment Plans] Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
