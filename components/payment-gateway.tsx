"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface PaymentGatewayProps {
  lotName: string
  amount: number
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export function PaymentGateway({ lotName, amount, onSuccess, onError }: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
  })
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setStatus("processing")

    try {
      // Create payment intent
      const intentRes = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email: formData.email,
          description: `Purchase of ${lotName}`,
        }),
      })

      const intentData = await intentRes.json()

      if (!intentData.clientSecret) {
        throw new Error("Failed to create payment intent")
      }

      // In a real implementation, you would use Stripe.js to confirm the payment
      // For now, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Confirm payment
      const confirmRes = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: intentData.intentId,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          lotId: lotName,
        }),
      })

      const confirmData = await confirmRes.json()

      if (confirmData.success) {
        setStatus("success")
        onSuccess(confirmData.paymentId)
      } else {
        throw new Error(confirmData.error || "Payment confirmation failed")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Payment failed"
      setStatus("error")
      setErrorMessage(errorMsg)
      onError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>Complete your purchase securely</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Your order has been confirmed.
              </AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Personal Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Card Information</h3>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Input
                  id="expiryMonth"
                  name="expiryMonth"
                  placeholder="MM"
                  maxLength={2}
                  value={formData.expiryMonth}
                  onChange={handleChange}
                  required
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Input
                  id="expiryYear"
                  name="expiryYear"
                  placeholder="YY"
                  maxLength={2}
                  value={formData.expiryYear}
                  onChange={handleChange}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                name="cvc"
                placeholder="123"
                maxLength={3}
                value={formData.cvc}
                onChange={handleChange}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Lot:</span>
              <span className="font-medium">{lotName}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-teal-600">₱{amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center">Your payment information is secure and encrypted</p>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 h-auto text-lg"
            disabled={isProcessing || status === "success"}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Payment Complete
              </>
            ) : (
              `Pay ₱${amount.toLocaleString()}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
