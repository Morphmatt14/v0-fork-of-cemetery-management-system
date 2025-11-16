import { stripe } from "@/lib/stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  const body = await req.text()

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
  }

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

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const orderId = session.metadata?.order_id

      if (orderId) {
        // Update order status
        await supabase.from("lot_orders").update({ status: "completed" }).eq("id", orderId)

        // Create payment record
        await supabase.from("payments").insert([
          {
            order_id: orderId,
            amount: session.amount_total! / 100,
            currency: session.currency?.toUpperCase(),
            status: "succeeded",
            stripe_charge_id: session.payment_intent as string,
          },
        ])
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
