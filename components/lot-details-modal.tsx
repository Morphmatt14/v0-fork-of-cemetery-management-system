"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, Users, Zap, Shield, Clock } from "lucide-react"
import { PaymentModal } from "./payment-modal"

interface LotDetailsModalProps {
  isOpen?: boolean
  lot?: {
    id: string
    section: string
    type: string
    status: string
    price: number
    balance: number
    size: string
    occupant?: string
    burialDate?: string
    purchaseDate: string
    description?: string
  } | null
  onClose: () => void
  onPaymentClick?: () => void
}

export function LotDetailsModal({ isOpen = false, lot, onClose, onPaymentClick }: LotDetailsModalProps) {
  const [showPayment, setShowPayment] = useState(false)

  if (!isOpen || !lot) {
    return null
  }

  const price = lot.price || 0
  const lotName = `Lot ${lot.id}`
  const lotType = lot.type.toLowerCase()

  const features = {
    lawn: [
      "1 meter × 2.44 meters plot",
      "Flat marker installation",
      "Well-maintained lawn area",
      "Easy visitor access",
      "Personal decoration space",
      "Perpetual care included",
    ],
    garden: [
      "4 meters × 2.44 meters plot",
      "Multiple interment capability",
      "Upright monument option",
      "Landscaped garden setting",
      "Family space included",
      "Professional maintenance",
    ],
    family: [
      "30 square meter estate",
      "Private mausoleum construction",
      "Multiple family members",
      "Architectural freedom",
      "Generational legacy",
      "Premium location",
    ],
  }

  const services = [
    {
      icon: Shield,
      title: "24/7 Security",
      description: "Round-the-clock security and surveillance",
    },
    {
      icon: Zap,
      title: "Professional Care",
      description: "Expert maintenance and preservation",
    },
    {
      icon: Clock,
      title: "Perpetual Maintenance",
      description: "Lifelong care and upkeep included",
    },
    {
      icon: Users,
      title: "Family Support",
      description: "Compassionate staff assistance",
    },
  ]

  const lotFeatures = features[lotType as keyof typeof features] || []

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b flex justify-between items-center p-6 z-10">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lotName}</h1>
                <p className="text-gray-600 mt-1">Premium memorial lot offering</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{/* Placeholder for map and lot images */}</div>

              {/* Description */}
              {lot.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About This Lot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{lot.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lotFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-teal-600">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service, idx) => {
                    const Icon = service.icon
                    return (
                      <Card key={idx}>
                        <CardContent className="p-4 flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-100">
                              <Icon className="h-6 w-6 text-teal-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Pricing & CTA */}
              <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Starting Price</p>
                      <p className="text-4xl font-bold text-teal-600">₱{price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-2">* Flexible payment plans available</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <Button
                        onClick={() => {
                          setShowPayment(true)
                          if (onPaymentClick) {
                            onPaymentClick()
                          }
                        }}
                        className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white py-3 h-auto"
                        size="lg"
                      >
                        <DollarSign className="h-5 w-5 mr-2" />
                        Purchase Now
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 md:flex-none border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-3 h-auto bg-transparent"
                        size="lg"
                      >
                        Schedule Appointment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Options</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>Full payment with 10% discount</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>12-month installment plan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>36-month flexible payment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>Bank financing available</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Included</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>Perpetual care and maintenance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>Legal documentation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>Certificate of ownership</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>24/7 security and access</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal lotName={lotName} lotPrice={price} lotType={lotType} onClose={() => setShowPayment(false)} />
      )}
    </>
  )
}
