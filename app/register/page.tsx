"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, Phone, MapPin, CheckCircle, Send, MessageSquare, Calendar } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedService, setSelectedService] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    requestType: "account-registration",
    serviceInterest: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    contactMethod: "phone",
  })

  const services = [
    {
      id: "lawn-lot",
      title: "Lawn Lot",
      price: "₱75,000",
      description: "Standard single burial plot with flat marker",
      image: "/images/lawn-lot.jpg",
    },
    {
      id: "garden-lot",
      title: "Garden Lot",
      price: "₱120,000",
      description: "Premium burial space for family use",
      image: "/images/garden-lot.jpg",
    },
    {
      id: "family-estate",
      title: "Family Estate",
      price: "₱500,000",
      description: "Prestigious lot for private mausoleum",
      image: "/images/family-state.avif",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store registration data
      const registrationData = {
        ...formData,
        selectedService,
        submittedAt: new Date().toISOString(),
      }

      localStorage.setItem("registrationRequest", JSON.stringify(registrationData))
      setIsSubmitted(true)

      // Log for demo purposes
      console.log("Registration Request:", registrationData)
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Failed to submit registration. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  const handleServiceSelect = (serviceTitle: string) => {
    setSelectedService(serviceTitle)
  }

  const handleClearService = () => {
    setSelectedService("")
  }

  const handleBrowseServices = () => {
    router.push("/guest/info")
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        {/* Back Button - Floating */}
        <Button
          onClick={handleBackClick}
          className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
          aria-label="Go back"
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

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Request Submitted!</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Your Request Details:</h3>
              <div className="space-y-2 text-sm">
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
                  <span className="font-medium">Request Type:</span>{" "}
                  {formData.requestType === "account-registration" ? "Account Registration" : "Service Consultation"}
                </p>
                {selectedService && (
                  <p>
                    <span className="font-medium">Service Interest:</span> {selectedService}
                  </p>
                )}
                {formData.preferredDate && (
                  <p>
                    <span className="font-medium">Preferred Date:</span> {formData.preferredDate}
                  </p>
                )}
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
                Our team will contact you within 24-48 hours to process your request and schedule a consultation if
                needed.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleBrowseServices} className="flex-1 bg-green-600 hover:bg-green-700">
                Browse Services
              </Button>
              <Button onClick={handleBackToHome} variant="outline" className="flex-1 bg-transparent">
                Back to Home
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
        onClick={handleBackClick}
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
        aria-label="Go back"
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
                <p className="text-sm text-gray-600">Registration & Service Request</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started with Surigao Memorial Park</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Request an account registration or schedule a consultation for our memorial services. Our team will contact
            you to assist with your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Our Services
                </CardTitle>
                <CardDescription>Select a service you're interested in (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService === service.title
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleServiceSelect(service.title)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleServiceSelect(service.title)
                        }
                      }}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-lg mb-3">
                        <Image
                          src={service.image || "/placeholder.svg?height=200&width=300"}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <p className="text-green-600 font-semibold">{service.price}</p>
                    </div>
                  ))}
                  {selectedService && (
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleClearService}>
                      Clear Selection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Registration Request Form
                </CardTitle>
                <CardDescription>
                  Fill out your information and we'll help you get started with our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

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
                          className={errors.firstName ? "border-red-500" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
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
                          className={errors.lastName ? "border-red-500" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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
                          className={errors.email ? "border-red-500" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                          className={errors.phone ? "border-red-500" : ""}
                          disabled={isSubmitting}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your complete address"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Request Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Request Type</h3>

                    <div>
                      <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">
                        What would you like to request? *
                      </label>
                      <select
                        id="requestType"
                        name="requestType"
                        value={formData.requestType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSubmitting}
                      >
                        <option value="account-registration">Account Registration (Lot Owner Portal)</option>
                        <option value="service-consultation">Service Consultation</option>
                        <option value="lot-purchase">Lot Purchase Inquiry</option>
                        <option value="payment-plan">Payment Plan Discussion</option>
                        <option value="general-inquiry">General Inquiry</option>
                      </select>
                    </div>

                    {selectedService && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Selected Service</label>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">{selectedService}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearService}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Appointment Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Consultation Preferences (Optional)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Date
                        </label>
                        <Input
                          id="preferredDate"
                          name="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Time
                        </label>
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={isSubmitting}
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

                    <div>
                      <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Contact Method *
                      </label>
                      <select
                        id="contactMethod"
                        name="contactMethod"
                        value={formData.contactMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSubmitting}
                      >
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS/Text</option>
                        <option value="in-person">In-Person Visit</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Additional Information
                    </h3>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message or Special Requests
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please share any specific questions, requirements, or additional information..."
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Registration Request
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-600 text-center mt-3">
                      By submitting this form, you agree to be contacted by our team regarding your registration
                      request.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What Happens Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Confirmation</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive an email confirmation with your request details within a few minutes.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Contact</h4>
                  <p className="text-sm text-gray-600">
                    Our team will contact you within 24-48 hours to discuss your needs and schedule a consultation.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Account Setup</h4>
                  <p className="text-sm text-gray-600">
                    After consultation, we'll help you set up your lot owner account and provide access credentials.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
