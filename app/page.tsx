"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AIAssistant } from "@/components/ai-assistant"

const ArrowRight = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function HomePage() {
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
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1 sm:p-2">
              <Image
                src="/images/smpi-logo.png"
                alt="SMPI Logo"
                width={40}
                height={40}
                className="sm:w-[60px] sm:h-[60px] object-contain"
              />
            </div>
            <div className="text-white">
              <h1 className="text-base sm:text-xl font-bold">SMPI</h1>
              <p className="text-xs sm:text-sm opacity-90">Memorial Park</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-block bg-teal-600/95 backdrop-blur-sm rounded-full px-4 sm:px-8 py-2 sm:py-4 shadow-lg mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white italic">Welcome to</h2>
            </div>

            <div className="bg-teal-600/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-4 sm:py-6 shadow-2xl mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                SURIGAO MEMORIAL
                <br />
                PARK INC.
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 sm:mb-12 px-4">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-medium leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              A respectful and modern way to locate graves, explore memorial services, and honor your loved ones.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8">
          <Button
            asChild
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            size="lg"
          >
            <Link href="/guest">
              <div className="flex flex-col items-center">
                <span className="hidden sm:inline">CLICK HERE TO</span>
                <span className="sm:hidden">TAP TO</span>
                <span>CONTINUE</span>
              </div>
              <ArrowRight />
            </Link>
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
      <AIAssistant />
    </div>
  )
}
