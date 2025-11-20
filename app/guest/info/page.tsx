import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Users, TreePine, Heart, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function GuestInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Back Button - Floating */}
      <Button
        asChild
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
      >
        <Link href="/guest">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 ml-16">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Surigao Memorial Park</h1>
                <p className="text-sm text-gray-600">Peaceful Rest Memorial Gardens</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Heart className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">A Place of Peace and Remembrance</h2>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Welcome to Surigao Memorial Park, Inc. - where memories are preserved with dignity and love. Located at
              Jose Sering Rd, Surigao City, Surigao Del Norte.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Open Daily 8:00 AM - 5:00 PM
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                Jose Sering Rd, Surigao City
              </Badge>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-blue-100 p-3 rounded-lg w-fit">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Burial Plot Services</CardTitle>
              <CardDescription>Premium burial plots in various sections with flexible payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Standard, Garden Lot, and Family plots
                  available</li>
                <li>• Flexible installment payment plans</li>
                <li>• Professional lot planning services</li>
                <li>• Legal documentation and certificates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-lg w-fit">
                <TreePine className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Maintenance Services</CardTitle>
              <CardDescription>Professional grave maintenance and beautification services</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Regular landscaping and upkeep</li>
                <li>• Tomb cleaning and maintenance</li>
                <li>• Pathway and facility maintenance</li>

              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-purple-100 p-3 rounded-lg w-fit">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Client Support</CardTitle>
              <CardDescription>Dedicated support for all your memorial park needs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Walk-in consultations available</li>
                <li>• On-site cemetery tours</li>
                <li>• Online inquiry system</li>
                <li>• Transparent pricing and contracts</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Submit an Inquiry
              </CardTitle>
              <CardDescription>
                Have questions about our services? Send us a message and we&apos;ll get back to you promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input id="firstName" placeholder="Enter your first name" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input id="lastName" placeholder="Enter your last name" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input id="email" type="email" placeholder="Enter your email" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select inquiry type</option>
                    <option value="lot-availability">Lot Availability</option>
                    <option value="pricing">Pricing Information</option>
                    <option value="payment-plans">Payment Plans</option>
                    <option value="maintenance">Maintenance Services</option>
                    <option value="general">General Information</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <Textarea id="message" placeholder="Please describe your inquiry in detail..." rows={4} required />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-gray-600">Jose Sering Rd, Surigao City, Surigao Del Norte</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">(086) 826-1234</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">info@surigaomemorialpark.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Operating Hours</p>
                    <p className="text-sm text-gray-600">Daily: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle>Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Professional and compassionate service
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Flexible payment options available
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Well-maintained and peaceful environment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Transparent pricing and legal documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Convenient location in Surigao City
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Announcements Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Latest Announcements</CardTitle>
            <CardDescription>Stay updated with our latest news and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">New Payment Options Available</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We now accept online bank transfers and offer more flexible installment plans for lot purchases.
                </p>
                <p className="text-xs text-gray-500 mt-2">Posted: January 15, 2025</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">Maintenance Schedule Update</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Regular landscaping and beautification work will be conducted every Monday and Thursday.
                </p>
                <p className="text-xs text-gray-500 mt-2">Posted: January 10, 2025</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h4 className="font-semibold text-gray-900">Digital Services Launch</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Our new online management system is now live! Lot owners can now access their records online.
                </p>
                <p className="text-xs text-gray-500 mt-2">Posted: January 5, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Image
                    src="/images/smpi-logo.png"
                    alt="SMPI Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Surigao Memorial Park</h3>
                  <p className="text-sm text-gray-400">Peaceful Rest Memorial Gardens</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Providing dignified memorial services to the Surigao community with compassion and professionalism.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Jose Sering Rd, Surigao City</p>
                <p>Surigao Del Norte, Philippines</p>
                <p>Phone: (086) 826-1234</p>
                <p>Email: smpi87@yahoo.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Surigao Memorial Park, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
