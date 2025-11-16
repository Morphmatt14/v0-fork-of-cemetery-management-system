import { stripe } from "@/lib/stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle error
          }
        },
      },
    })

    const body = await req.json()
    const { paymentIntentId, customerId, email, fullName, phone, lotId } = body

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 })
    }

    // Create or update customer
    let { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single()

    if (customerError && customerError.code === "PGRST116") {
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert([
          {
            email,
            full_name: fullName,
            phone,
            stripe_customer_id: paymentIntent.customer as string,
          },
        ])
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
      }
      customer = newCustomer
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        order_id: lotId,
        amount: paymentIntent.amount! / 100,
        currency: "PHP",
        status: "succeeded",
        stripe_charge_id: paymentIntent.id,
      },
    ])

    if (paymentError) {
      console.error("Payment record error:", paymentError)
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentIntent.id,
      customerId: customer?.id,
    })
  } catch (error) {
    console.error("Payment confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
