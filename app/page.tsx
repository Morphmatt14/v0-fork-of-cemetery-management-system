"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, User, TreePine, MapPin, Headphones, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const [showLotDetails, setShowLotDetails] = useState<string | null>(null)

  if (showLotDetails) {
    const lotDetails = {
      lawn: {
        title: "LAWN LOT",
        mapImage: "/images/lawn-lot-map.jpg",
        lotImage: "/images/lawn-lot.jpg",
        description:
          "The Lawn Lot is a standard single burial plot measuring 1 meter by 2.44 meters, offering a peaceful and well-maintained resting space. Positioned within the serene landscaped areas of the memorial park, this lot is ideal for families seeking a dignified and simple ground burial option. The area allows for a flat marker installation and provides ease of access for visitors, ensuring a meaningful experience when honoring their loved ones.",
        price: "₱75,000",
      },
      garden: {
        title: "GARDEN LOT",
        mapImage: "/images/garden-lot-map.jpg",
        lotImage: "/images/garden-lot.jpg",
        description:
          "The Garden Lot is a premium burial space measuring 4 meters by 2.44 meters, offering ample room for multiple interments or family use. Located in a beautifully landscaped section of the memorial park, this lot allows for upright monuments or customized memorial structures. It provides families with a spacious, elegant, and serene environment to honor and preserve the memory of their loved ones with dignity and grace.",
        price: "₱120,000",
      },
      family: {
        title: "FAMILY STATE",
        mapImage: "/images/family-state-map.jpg",
        lotImage: "/images/family-state.avif",
        description:
          "The Family Estate is a prestigious 30-square-meter lot designed for legacy and lasting remembrance. This spacious area allows families to construct a private structure or mausoleum, accommodating multiple interments in a single, elegant space. Ideal for those who wish to create a permanent family sanctuary, the Family Estate offers privacy, architectural freedom, and a meaningful place for future generations to gather and honor their loved ones.",
        price: "₱500,000",
      },
    }

    const currentLot = lotDetails[showLotDetails as keyof typeof lotDetails]

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="p-6">
          <Button
            onClick={() => setShowLotDetails(null)}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-12 h-12 p-0"
          >
            <ArrowLeft className="h-6 w-6" />
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
                  <div className="text-2xl font-semibold text-teal-600">Starting at {currentLot.price}</div>
                </div>

                {/* Make Appointment Button */}
                <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white text-lg py-6 rounded-full">
                  <Link href={`/appointment?type=${showLotDetails}`}>MAKE APPOINTMENT →</Link>
                </Button>
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
                    <li>• Bank financing available</li>
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
      </div>
    )
  }

  if (showServices) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="p-6">
          <Button
            onClick={() => setShowServices(false)}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-12 h-12 p-0"
          >
            <ArrowLeft className="h-6 w-6" />
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
                  onClick={() => setShowLotDetails("lawn")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Learn More
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
                  onClick={() => setShowLotDetails("garden")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Learn More
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
                  onClick={() => setShowLotDetails("family")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Learn More
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
                  <Link href="/guest/info">Contact Us</Link>
                </Button>
                <Button variant="outline" onClick={() => setShowServices(false)}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showLoginOptions) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(to right, #0dbdad, #007073)",
        }}
      >
        <div className="container mx-auto px-4 py-8 min-h-screen flex items-center">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              {/* Left Section - Welcome */}
              <div className="lg:col-span-1 text-white">
                <div className="mb-8">
                  <Image
                    src="/images/smpi-logo.png"
                    alt="SMPI Logo"
                    width={120}
                    height={120}
                    className="object-contain mb-6"
                  />
                </div>

                <h1 className="text-4xl lg:text-5xl font-light italic mb-6 leading-tight">
                  Welcome to
                  <br />
                  Guest mode
                </h1>

                <p className="text-lg opacity-90 mb-8 leading-relaxed">
                  "Choose how you'd like to access the Surigao Memorial Park system — explore our services or login to
                  your account."
                </p>

                <Button
                  asChild
                  variant="ghost"
                  className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-3 transition-all duration-200"
                >
                  <Link href="/guest/info">
                    <Headphones className="h-5 w-5" />
                    <span className="text-sm">Customer Service</span>
                  </Link>
                </Button>
              </div>

              {/* Right Section - Cards */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Browse as Guest Card */}
                <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-blue-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-teal-600 opacity-60" />
                    </div>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Information</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      Access general information about our services, view memorial park details, and explore available
                      options without login.
                    </p>
                    <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full">
                      <Link href="/guest/info">BROWSE →</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Services Card */}
                <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-teal-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TreePine className="h-16 w-16 text-green-600 opacity-60" />
                    </div>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Services</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      Learn about burial arrangements, lot reservations, maintenance packages, and memorial services we
                      offer.
                    </p>
                    <Button
                      onClick={() => setShowServices(true)}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                    >
                      VIEW SERVICES →
                    </Button>
                  </CardContent>
                </Card>

                {/* Plot Owner Login Card */}
                <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="h-16 w-16 text-blue-600 opacity-60" />
                    </div>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Plot Owner</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      Access your lot information, payment history, submit service requests, and manage your account.
                    </p>
                    <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full">
                      <Link href="/login">LOG IN →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Section - Admin Access */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <Shield className="h-5 w-5 text-white/80" />
                <span className="text-white/80 text-sm">Administrator Access:</span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/20 rounded-full"
                >
                  <Link href="/admin/login">Admin Login</Link>
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                onClick={() => setShowLoginOptions(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                ← Back to Welcome
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Animation */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat animate-pulse"
          style={{
            backgroundImage: `url('/images/surigao-memorial-bg.jpg')`,
            minHeight: "100vh",
            minWidth: "100vw",
            animation: "slowZoom 20s ease-in-out infinite",
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="flex items-center space-x-3">
            <div className="p-2">
              <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={60} height={60} className="object-contain" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">SMPI</h1>
              <p className="text-sm opacity-90">Memorial Park</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8">
            <div className="inline-block bg-teal-600/95 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white italic">Welcome to</h2>
            </div>

            <div className="bg-teal-600/95 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                SURIGAO MEMORIAL
                <br />
                PARK INC.
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <p className="text-xl sm:text-2xl lg:text-3xl text-white font-medium leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              A respectful and modern way to locate graves, explore memorial services, and honor your loved ones.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="absolute bottom-8 right-8">
          <Button
            onClick={() => setShowLoginOptions(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            CLICK HERE TO
            <br />
            CONTINUE
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes slowZoom {
          0% { 
            transform: scale(1); 
          }
          50% { 
            transform: scale(1.05); 
          }
          100% { 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  )
}
