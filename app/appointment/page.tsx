"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Clock, User, Mail, MapPin, CheckCircle, Send, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"

export default function AppointmentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const lotType = searchParams.get("type") || "lawn"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    alternateDate: "",
    alternateTime: "",
    visitPurpose: "consultation",
    additionalNotes: "",
    contactMethod: "phone",
  })

  const lotDetails = {
    lawn: {
      title: "Lawn Lot",
      price: "₱75,000",
      size: "1m × 2.44m",
      description: "Standard single burial plot with flat marker",
      image: "/images/lawn-lot.jpg",
      color: "bg-green-100 text-green-800",
    },
    garden: {
      title: "Garden Lot",
      price: "₱120,000",
      size: "4m × 2.44m",
      description: "Premium burial space for family use",
      image: "/images/garden-lot.jpg",
      color: "bg-blue-100 text-blue-800",
    },
    family: {
      title: "Family Estate",
      price: "₱500,000",
      size: "30 sq meters",
      description: "Prestigious lot for private mausoleum",
      image: "/images/family-state.avif",
      color: "bg-purple-100 text-purple-800",
    },
  }

  const selectedLot = lotDetails[lotType as keyof typeof lotDetails] || lotDetails.lawn

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)

      // In a real app, this would send to your backend API
      console.log("Appointment Request:", {
        lotType: selectedLot.title,
        ...formData,
        submittedAt: new Date().toISOString(),
      })
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        {/* Back Button - Floating */}
        <Button
          onClick={() => router.back()}
          className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card className="w-full max-w-2xl shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Appointment Request Submitted!</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Your Request Details:</h3>
              <div className="text-left space-y-2">
                <p>
                  <span className="font-medium">Selected Lot:</span> {selectedLot.title}
                </p>
                <p>
                  <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formData.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {formData.phone}
                </p>
                <p>
                  <span className="font-medium">Preferred Date:</span> {formData.preferredDate}
                </p>
                <p>
                  <span className="font-medium">Preferred Time:</span> {formData.preferredTime}
                </p>
              </div>
            </div>

            <Alert className="mb-6">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Confirmation emails sent to:</strong>
                <br />• Your email: {formData.email}
                <br />• Admin team: admin@surigaomemorialpark.com
                <br />
                <br />
                Our team will contact you within 24 hours to confirm your appointment details.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 bg-teal-600 hover:bg-teal-700">
                <Link href="/guest/info">Browse More Services</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Back Button - Floating */}
      <Button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 ml-16">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Surigao Memorial Park</h1>
                <p className="text-sm text-gray-600">Schedule an Appointment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selected Lot Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Selected Lot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <Image
                      src={selectedLot.image || "/placeholder.svg"}
                      alt={selectedLot.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <Badge className={selectedLot.color}>{selectedLot.title}</Badge>
                    <h3 className="font-semibold text-lg mt-2">{selectedLot.title}</h3>
                    <p className="text-gray-600 text-sm">{selectedLot.description}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{selectedLot.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-medium text-teal-600">{selectedLot.price}</span>
                    </div>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">What&apos;s Included:</h4>
                    <ul className="text-sm text-teal-800 space-y-1">
                      <li>• Perpetual care & maintenance</li>
                      <li>• Legal documentation</li>
                      <li>• Certificate of ownership</li>
                      <li>• 24/7 security</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Your Appointment
                </CardTitle>
                <CardDescription>
                  Fill out the form below and our team will contact you to confirm your appointment within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Appointment Preferences
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Date *
                        </label>
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time *
                        </label>
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM">9:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="1:00 PM">1:00 PM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="3:00 PM">3:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="alternateDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Alternate Date (Optional)
                        </label>
                        <Input
                          id="alternateDate"
                          name="alternateDate"
                          type="date"
                          value={formData.alternateDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label htmlFor="alternateTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Alternate Time (Optional)
                        </label>
                        <select
                          id="alternateTime"
                          name="alternateTime"
                          value={formData.alternateTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM">9:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="1:00 PM">1:00 PM</option>
                          <option value="2:00 PM">2:00 PM</option>
                          <option value="3:00 PM">3:00 PM</option>
                          <option value="4:00 PM">4:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Visit Purpose */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Visit Details
                    </h3>

                    <div>
                      <label htmlFor="visitPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose of Visit *
                      </label>
                      <select
                        id="visitPurpose"
                        name="visitPurpose"
                        value={formData.visitPurpose}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="consultation">General Consultation</option>
                        <option value="site-visit">Site Visit & Tour</option>
                        <option value="purchase">Purchase Discussion</option>
                        <option value="payment-plan">Payment Plan Discussion</option>
                        <option value="documentation">Documentation & Paperwork</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Contact Method *
                      </label>
                      <select
                        id="contactMethod"
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      >
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS/Text</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes or Questions (Optional)
                      </label>
                      <Textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        placeholder="Please share any specific questions, requirements, or additional information..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Appointment Request
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-600 text-center mt-3">
                      By submitting this form, you agree to be contacted by our team regarding your appointment request.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
