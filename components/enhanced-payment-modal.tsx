"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Loader2, CheckCircle2 } from "lucide-react"

interface EnhancedPaymentModalProps {
  isOpen: boolean
  lotName: string
  lotPrice: number
  lotType: string
  onClose: () => void
  onSuccess?: () => void
}

export function EnhancedPaymentModal({
  isOpen,
  lotName,
  lotPrice,
  lotType,
  onClose,
  onSuccess,
}: EnhancedPaymentModalProps) {
  const [step, setStep] = useState<"form" | "method" | "confirm" | "success">("form")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "installment" | "cash">("card")

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.fullName && formData.email && formData.phone) {
      setStep("method")
    }
  }

  const handleMethodSelect = () => {
    setStep("confirm")
  }

  const handleConfirmPayment = async () => {
    setIsLoading(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Save payment record to localStorage
    const payments = JSON.parse(localStorage.getItem("payments") || "[]")
    payments.push({
      id: Date.now(),
      date: new Date().toISOString(),
      customer: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      lotType,
      amount: lotPrice,
      method: paymentMethod,
      status: "completed",
    })
    localStorage.setItem("payments", JSON.stringify(payments))

    setIsLoading(false)
    setStep("success")

    if (onSuccess) {
      setTimeout(onSuccess, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase {lotName}</CardTitle>
          {step !== "success" && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          )}
        </CardHeader>

        <CardContent>
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="bg-teal-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-teal-600">₱{lotPrice.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Next
                </Button>
              </div>
            </form>
          )}

          {step === "method" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select Payment Method</p>
              {[
                { value: "card", label: "💳 Credit/Debit Card", desc: "Pay immediately" },
                { value: "bank", label: "🏦 Bank Transfer", desc: "Direct deposit" },
                { value: "installment", label: "📅 Installment Plan", desc: "12 months" },
                { value: "cash", label: "💵 Cash Payment", desc: "At office" },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`w-full p-3 border-2 rounded-lg text-left transition ${
                    paymentMethod === method.value
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-300 hover:border-teal-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{method.label}</div>
                  <div className="text-xs text-gray-600">{method.desc}</div>
                </button>
              ))}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("form")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleMethodSelect} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Type:</span>
                  <span className="font-medium">{lotName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₱{lotPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-teal-600">₱{lotPrice.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                ✓ By clicking Pay Now, you agree to our Terms & Conditions and Privacy Policy
              </p>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("method")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-600 mt-2">Your purchase of {lotName} has been confirmed.</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-left text-sm">
                <p>
                  <strong>Reference:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
                <p>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
              <Button onClick={onClose} className="w-full bg-teal-600 hover:bg-teal-700">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
