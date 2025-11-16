"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Download, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // In a real app, you'd fetch order details from your backend using the session_id
    // For now, we'll just simulate the data load
    const timer = setTimeout(() => {
      setLoading(false)
      setOrderData({
        orderId: sessionId?.slice(0, 12),
        amount: "₱75,000",
        date: new Date().toLocaleDateString(),
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
              <CheckCircle className="h-16 w-16 text-green-600 relative z-10" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your lot purchase has been confirmed</p>

          {/* Order Details */}
          {!loading && orderData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold text-gray-900">{orderData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-teal-600 text-lg">{orderData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-900">{orderData.date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              A confirmation email has been sent to your email address with your receipt and lot details. You can now
              proceed to schedule an appointment or contact us for further assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-6">
              <Link href="/appointment">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 bg-transparent"
              onClick={() => {
                // In a real app, this would trigger downloading the receipt
                alert("Receipt downloaded")
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button asChild variant="ghost" className="w-full py-6">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">Questions? Contact us:</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-900 font-medium">Surigao Memorial Park Inc.</p>
              <p className="text-gray-600">Phone: (086) 231-0000</p>
              <p className="text-gray-600">Email: info@surigaomemorialpark.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Calendar } from "lucide-react"
