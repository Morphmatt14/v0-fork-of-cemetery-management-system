"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { PaymentModal } from "@/components/payment-modal"
import { AIAssistant } from "@/components/ai-assistant"
import { notFound } from "next/navigation"

const ArrowLeft = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const lotDetails = {
  lawn: {
    id: "lawn",
    title: "LAWN LOT",
    mapImage: "/images/lawn-lot-map.jpg",
    lotImage: "/images/lawn-lot.jpg",
    description:
      "The Lawn Lot is a standard single burial plot measuring 1 meter by 2.44 meters, offering a peaceful and well-maintained resting space. Positioned within the serene landscaped areas of the memorial park, this lot is ideal for families seeking a dignified and simple ground burial option. The area allows for a flat marker installation and provides ease of access for visitors, ensuring a meaningful experience when honoring their loved ones.",
    price: 75000,
  },
  garden: {
    id: "garden",
    title: "GARDEN LOT",
    mapImage: "/images/garden-lot-map.jpg",
    lotImage: "/images/garden-lot.jpg",
    description:
      "The Garden Lot is a premium burial space measuring 4 meters by 2.44 meters, offering ample room for multiple interments or family use. Located in a beautifully landscaped section of the memorial park, this lot allows for upright monuments or customized memorial structures. It provides families with a spacious, elegant, and serene environment to honor and preserve the memory of their loved ones with dignity and grace.",
    price: 120000,
  },
  family: {
    id: "family",
    title: "FAMILY STATE",
    mapImage: "/images/family-state-map.jpg",
    lotImage: "/images/family-state.avif",
    description:
      "The Family Estate is a prestigious 30-square-meter lot designed for legacy and lasting remembrance. This spacious area allows families to construct a private structure or mausoleum, accommodating multiple interments in a single, elegant space. Ideal for those who wish to create a permanent family sanctuary, the Family Estate offers privacy, architectural freedom, and a meaningful place for future generations to gather and honor their loved ones.",
    price: 500000,
  },
}

export default function LotDetailsPage({ params }: { params: { type: string } }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedLot, setSelectedLot] = useState<{
    id: string
    name: string
    price: number
    type: string
  } | null>(null)

  const currentLot = lotDetails[params.type as keyof typeof lotDetails]

  if (!currentLot) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="p-6">
        <Button
          asChild
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-12 h-12 p-0"
        >
          <Link href="/services">
            <ArrowLeft />
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[70vh]">
          {/* Left Side - Map */}
          <div className="relative">
            {/* SMPI MAP Title */}
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-2xl md:text-3xl font-light text-white drop-shadow-2xl">
                SMPI <span className="text-teal-400 font-medium">MAP</span>
              </h2>
              <div className="absolute inset-0 text-2xl md:text-3xl font-light text-black/30 -z-10 translate-x-0.5 translate-y-0.5">
                SMPI <span className="text-teal-600/30 font-medium">MAP</span>
              </div>
            </div>

            <div className="aspect-video relative overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={currentLot.mapImage || "/placeholder.svg"}
                alt={`${currentLot.title} location map`}
                fill
                className="object-cover"
              />
              {/* Dark overlay for better text visibility */}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Lot Image */}
            <div className="aspect-video relative overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={currentLot.lotImage || "/placeholder.svg"}
                alt={`${currentLot.title} example`}
                fill
                className="object-cover"
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-gray-800 text-lg leading-relaxed">{currentLot.description}</p>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-teal-600">
                  Starting at ₱{currentLot.price.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <Button
                  onClick={() => {
                    setSelectedLot({
                      id: currentLot.id,
                      name: currentLot.title,
                      price: currentLot.price,
                      type: params.type,
                    })
                    setShowPaymentModal(true)
                  }}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-lg py-6 rounded-full"
                >
                  PURCHASE NOW →
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 text-lg py-6 rounded-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                >
                  <Link href={`/appointment?type=${params.type}`}>MAKE APPOINTMENT</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Payment Options</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Full payment with discount</li>
                  <li>• Flexible installment plans</li>
                  <li>• Online payment options</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Included Services</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Perpetual care and maintenance</li>
                  <li>• Legal documentation</li>
                  <li>• Certificate of ownership</li>
                  <li>• 24/7 security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedLot && (
        <PaymentModal
          lotName={selectedLot.name}
          lotPrice={selectedLot.price}
          lotType={selectedLot.type}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedLot(null)
          }}
        />
      )}
      <AIAssistant />
    </div>
  )
}
