"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Cancel Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
              <XCircle className="h-16 w-16 text-red-600 relative z-10" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">Your transaction was not completed</p>

          {/* Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-900">
              Your payment has been cancelled. You can try again at any time. If you have any questions, please contact
              our customer service team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full py-6 bg-transparent">
              <Link href="/guest/info">
                <Home className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-2">Need assistance?</p>
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
