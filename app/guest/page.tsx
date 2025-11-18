"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { AIAssistant } from "@/components/ai-assistant"

const Shield = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const User = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const TreePine = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    />
  </svg>
)

const MapPin = () => (
  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function GuestModePage() {
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
            </div>

            {/* Right Section - Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Browse as Guest Card */}
              <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group">
                <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-blue-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin />
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
                    <TreePine />
                  </div>
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Services</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Learn about burial arrangements, lot reservations, maintenance packages, and memorial services we
                    offer.
                  </p>
                  <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full">
                    <Link href="/services">VIEW SERVICES →</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plot Owner Login Card */}
              <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User />
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
              <Shield />
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
              asChild
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <Link href="/">← Back to Welcome</Link>
            </Button>
          </div>
        </div>
      </div>
      <AIAssistant />
    </div>
  )
}
