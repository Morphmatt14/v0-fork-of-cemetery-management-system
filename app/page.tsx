"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Heart, ArrowRight, Phone, Mail, Clock, CheckCircle, Leaf } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Surigao Memorial Park</h1>
                <p className="text-xs text-gray-600">A Place of Peace and Remembrance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="bg-transparent">
                  Client Login
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Admin Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">A Peaceful Haven for Your Loved Ones</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Surigao Memorial Park offers dignified burial services and peaceful memorial gardens. Explore our services
            and find the perfect resting place for your family.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/guest/info">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Explore Our Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Memorial Lots</CardTitle>
                <CardDescription>Beautiful burial spaces in peaceful gardens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Choose from standard, premium, and family lots in our carefully maintained memorial grounds.
                </p>
                <Link href="/guest/info">
                  <Button variant="outline" className="w-full bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Burial Services</CardTitle>
                <CardDescription>Dignified and respectful ceremonies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Professional and compassionate burial services to honor your loved ones with dignity.
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full bg-transparent">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                  <Leaf className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Perpetual care and landscaping</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We ensure your loved one's resting place is beautifully maintained for generations.
                </p>
                <Link href="/guest/info">
                  <Button variant="outline" className="w-full bg-transparent">
                    Explore
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Surigao Memorial Park</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Beautiful Grounds</h4>
                <p className="text-gray-600">Peaceful gardens and well-maintained memorial spaces</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Professional Staff</h4>
                <p className="text-gray-600">Compassionate and experienced team at your service</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Flexible Payment Plans</h4>
                <p className="text-gray-600">Multiple payment options to suit your needs</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Security</h4>
                <p className="text-gray-600">Round-the-clock surveillance and protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl font-bold mb-6">Ready to Plan Ahead?</h3>
          <p className="text-lg mb-8 opacity-90">
            Contact us today or schedule an appointment to visit our beautiful memorial grounds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/appointment">
              <Button size="lg" variant="secondary">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <Users className="mr-2 h-4 w-4" />
                Register Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg w-fit mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
              <p className="text-gray-600">(086) 123-4567</p>
              <p className="text-gray-600">Available 24/7</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg w-fit mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
              <p className="text-gray-600">info@surigaomemorialpark.com</p>
              <p className="text-gray-600">We reply within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg w-fit mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Hours</h4>
              <p className="text-gray-600">Mon-Sun: 7:00 AM - 6:00 PM</p>
              <p className="text-gray-600">Holidays: 8:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={24} height={24} className="object-contain" />
                <span className="font-bold">SMPI</span>
              </div>
              <p className="text-gray-400">A place of peace and remembrance for your loved ones.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/guest/info" className="hover:text-white">
                    Memorial Lots
                  </Link>
                </li>
                <li>
                  <Link href="/guest/info" className="hover:text-white">
                    Burial Services
                  </Link>
                </li>
                <li>
                  <Link href="/guest/info" className="hover:text-white">
                    Maintenance Plans
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Client Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-white">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: (086) 123-4567</li>
                <li>Email: info@surigaomemorialpark.com</li>
                <li>Address: Surigao City, Philippines</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Surigao Memorial Park Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const Calendar = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
