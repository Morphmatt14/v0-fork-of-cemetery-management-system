"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Loader2 } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  lot: { id: string; type: string; price: number; section: string } | null
  onClose: () => void
  onPaymentSuccess?: () => void
}

export function PaymentModal({ isOpen, lot, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lotId: lot?.id, // Using lot id as ID for demo
          lotType: lot?.type,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (data.sessionId) {
        // Redirect to Stripe checkout
        const stripe = await import("@stripe/stripe-js").then((m) => m.loadStripe)
        const stripeInstance = await stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
        await stripeInstance?.redirectToCheckout({ sessionId: data.sessionId })
        onPaymentSuccess?.()
      } else {
        alert("Error creating checkout session")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment processing failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !lot) return null

  const price = lot?.price ?? 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Complete Your Purchase</CardTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Lot Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Lot {lot.id}</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="text-xl font-bold text-teal-600">₱{price.toLocaleString()}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center">Your payment information is secure and encrypted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
