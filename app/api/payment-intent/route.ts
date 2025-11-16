import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, email, description } = body

    if (!amount || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "php",
      payment_method_types: ["card"],
      receipt_email: email,
      description: description || "Surigao Memorial Park - Lot Purchase",
      metadata: {
        email,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      intentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
