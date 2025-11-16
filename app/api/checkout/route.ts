import { stripe } from "@/lib/stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
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
          // Handle error setting cookies
        }
      },
    },
  })

  try {
    const body = await req.json()
    const { lotId, lotType, email, fullName, phone } = body

    // Get lot details
    const { data: lot, error: lotError } = await supabase.from("lots").select("*").eq("id", lotId).single()

    if (lotError || !lot) {
      return NextResponse.json({ error: "Lot not found" }, { status: 404 })
    }

    // Create or get customer
    let { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single()

    if (customerError && customerError.code === "PGRST116") {
      // Customer doesn't exist, create new one
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert([{ email, full_name: fullName, phone }])
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
      }
      customer = newCustomer
    } else if (customerError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Create lot order
    const { data: order, error: orderError } = await supabase
      .from("lot_orders")
      .insert([
        {
          customer_id: customer.id,
          lot_id: lot.id,
          total_price: lot.price,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "php",
            product_data: {
              name: lot.name,
              description: lot.description,
            },
            unit_amount: Math.round(lot.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: {
        order_id: order.id,
        customer_id: customer.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancelled`,
    })

    // Update order with payment intent
    await supabase.from("lot_orders").update({ stripe_payment_intent_id: session.id }).eq("id", order.id)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
