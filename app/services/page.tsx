"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { PaymentModal } from "@/components/payment-modal"
import { AIAssistant } from "@/components/ai-assistant"

const ArrowLeft = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const Headphones = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="p-6">
        <Button
          asChild
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-12 h-12 p-0"
        >
          <Link href="/guest">
            <ArrowLeft />
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">
            What We <span className="text-teal-600 font-medium">Can Offer You</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our three distinct memorial options, each designed to honor your loved ones with dignity and
            respect in beautiful, well-maintained settings.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lawn Lot */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src="/images/lawn-lot.jpg"
                alt="Lawn Lot - Individual grave with flowers and memorial marker"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-lg">LAWN LOT</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Traditional burial plots with individual markers on well-maintained lawn areas. Perfect for those
                seeking a peaceful, natural setting with space for personal decorations and flowers.
              </p>
              <div className="text-teal-600 font-semibold text-lg mb-2">Starting at ₱75,000</div>
              <Button
                asChild
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Link href="/lots/lawn">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Garden Lot */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src="/images/garden-lot.jpg"
                alt="Garden Lot - Flat memorial markers in landscaped garden setting"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-lg">GARDEN LOT</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Beautiful garden-style lots with flat markers seamlessly integrated into landscaped areas. Offers a
                serene, park-like environment with easy maintenance and accessibility.
              </p>
              <div className="text-teal-600 font-semibold text-lg mb-2">Starting at ₱120,000</div>
              <Button
                asChild
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Link href="/lots/garden">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Family State */}
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src="/images/family-state.avif"
                alt="Family State - Premium family mausoleum with elegant architecture"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-lg">FAMILY STATE</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Premium family estates with private mausoleums and dedicated spaces for multiple family members.
                Features elegant architecture and exclusive areas for generations to come.
              </p>
              <div className="text-teal-600 font-semibold text-lg mb-2">Starting at ₱500,000</div>
              <Button
                asChild
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Link href="/lots/family">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help Choosing?</h2>
            <p className="text-gray-600 mb-6">
              Our experienced staff can help you select the perfect memorial option for your family's needs and
              budget. We offer flexible payment plans and personalized consultation services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/guest/info">
                  <Headphones />
                  <span className="text-sm">Customer Service</span>
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/guest">Back to Guest Mode</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AIAssistant />
    </div>
  )
}
