"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  DollarSign,
  Bell,
  MessageSquare,
  Heart,
  LogOut,
  CreditCard,
  ArrowLeft,
  Building,
  Smartphone,
  Globe,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Helper function to load data from localStorage
const loadFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cemeteryData")
    if (saved) {
      return JSON.parse(saved)
    }
  }
  return null
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  // Modal states
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [showLotDetails, setShowLotDetails] = useState(false)
  const [showServiceRequest, setShowServiceRequest] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [serviceRequestSubmitted, setServiceRequestSubmitted] = useState(false)
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [isSubmittingService, setIsSubmittingService] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Service request form data
  const [serviceFormData, setServiceFormData] = useState({
    serviceType: "",
    urgency: "normal",
    preferredDate: "",
    preferredTime: "",
    description: "",
    contactMethod: "phone",
  })

  // Payment form data
  const [paymentFormData, setPaymentFormData] = useState({
    paymentType: "full",
    customAmount: "",
    paymentMethod: "gcash",
    installmentPlan: "3-months",
    accountName: "",
    contactNumber: "",
    email: "",
    notes: "",
  })

  // Load client data from localStorage or use default
  const [clientData, setClientData] = useState({
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "09123456789",
    memberSince: "2020-03-15",
    lots: [
      {
        id: "A-123",
        section: "Garden of Peace",
        type: "Standard",
        status: "Occupied",
        occupant: "Juan Santos",
        burialDate: "2023-05-15",
        purchaseDate: "2020-03-15",
        price: 75000,
        balance: 0,
        size: "1m × 2.44m",
        paymentHistory: [
          { date: "2020-03-15", amount: 75000, type: "Full Payment", method: "Bank Transfer", status: "Completed" },
        ],
        location: {
          coordinates: "14.5995° N, 120.9842° E",
          block: "A",
          row: "12",
          position: "3",
          directions:
            "Located in the peaceful Garden of Peace section, near the main chapel. Accessible via the main pathway, third lot from the fountain.",
          landmarks: [
            "Main Chapel (50m north)",
            "Memorial Fountain (20m west)",
            "Parking Area B (100m south)",
            "Administration Office (200m east)",
          ],
          walkingTime: "5 minutes from main entrance",
          drivingDirections: [
            "Enter through Main Gate on Jose Sering Road",
            "Follow the main road for 200 meters",
            "Turn left at the Chapel intersection",
            "Continue straight for 100 meters",
            "Parking available at Area B on your right",
            "Walk 50 meters north to reach the lot",
          ],
        },
        maintenance: {
          lastCleaning: "2024-01-10",
          nextScheduled: "2024-02-10",
          caretaker: "Maria Gonzales",
          contact: "09123456789",
        },
        services: [
          { date: "2023-05-15", type: "Burial Service", cost: 15000 },
          { date: "2023-06-01", type: "Memorial Marker Installation", cost: 8000 },
          { date: "2023-12-25", type: "Christmas Decoration", cost: 2000 },
        ],
        images: ["/images/lawn-lot.jpg", "/images/lawn-lot-details.jpg"],
        mapImage: "/images/lawn-lot-map.jpg",
      },
      {
        id: "B-456",
        section: "Garden of Serenity",
        type: "Premium",
        status: "Reserved",
        purchaseDate: "2024-01-10",
        price: 120000,
        balance: 45000,
        size: "4m × 2.44m",
        paymentHistory: [
          { date: "2024-01-10", amount: 25000, type: "Down Payment", method: "GCash", status: "Completed" },
          { date: "2024-02-10", amount: 25000, type: "Installment", method: "Bank Transfer", status: "Completed" },
          { date: "2024-03-10", amount: 25000, type: "Installment", method: "GCash", status: "Completed" },
        ],
        installmentPlan: {
          totalAmount: 120000,
          paidAmount: 75000,
          remainingAmount: 45000,
          monthlyPayment: 15000,
          nextDueDate: "2024-04-10",
          remainingMonths: 3,
        },
        location: {
          coordinates: "14.5998° N, 120.9845° E",
          block: "B",
          row: "8",
          position: "6",
          directions:
            "Premium location in Garden of Serenity, overlooking the memorial garden. Easy access from the main road, with parking nearby.",
          landmarks: [
            "Memorial Garden View (adjacent)",
            "Premium Parking Area (30m south)",
            "Serenity Chapel (80m north)",
            "Garden Gazebo (40m east)",
          ],
          walkingTime: "3 minutes from premium entrance",
          drivingDirections: [
            "Enter through Premium Gate on Jose Sering Road",
            "Follow the premium access road for 150 meters",
            "Turn right at the Garden of Serenity sign",
            "Continue for 80 meters",
            "Premium parking available on your left",
            "Walk 30 meters north to reach the lot",
          ],
        },
        maintenance: {
          lastCleaning: "2024-01-15",
          nextScheduled: "2024-02-15",
          caretaker: "Roberto Cruz",
          contact: "09987654321",
        },
        services: [
          { date: "2024-01-10", type: "Lot Reservation", cost: 25000 },
          { date: "2024-01-15", type: "Site Preparation", cost: 5000 },
        ],
        images: ["/images/garden-lot.jpg", "/images/garden-lot-details.jpg"],
        mapImage: "/images/garden-lot-map.jpg",
      },
    ],
    payments: [
      { id: 1, date: "2024-01-15", amount: 25000, type: "Installment", status: "Paid", lotId: "B-456" },
      { id: 2, date: "2024-02-15", amount: 25000, type: "Installment", status: "Paid", lotId: "B-456" },
      { id: 3, date: "2024-03-15", amount: 25000, type: "Installment", status: "Due", lotId: "B-456" },
    ],
    notifications: [
      { id: 1, type: "payment", message: "Payment due for Lot B-456", date: "2024-01-20", read: false },
      {
        id: 2,
        type: "maintenance",
        message: "Scheduled maintenance in Garden of Peace",
        date: "2024-01-18",
        read: true,
      },
      { id: 3, type: "announcement", message: "New payment options now available", date: "2024-01-15", read: true },
    ],
  })

  // Load updated data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage()
    if (savedData && savedData.clients) {
      // Find the current client's data (assuming Maria Santos for this example)
      const currentClient = savedData.clients.find((client: any) => client.name === "Maria Santos")
      if (currentClient) {
        // Update client data with any changes from admin
        setClientData(prevData => ({
          ...prevData,
          name: currentClient.name,
          email: currentClient.email,
          phone: currentClient.phone,
          // Keep the existing lots and other data structure
          // In a real app, you'd properly map the client data structure
        }))
      }
    }
  }, [])

  const handleServiceInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePaymentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setPaymentFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingService(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmittingService(false)
      setServiceRequestSubmitted(true)

      // In real app, this would send to backend
      console.log("Service Request:", {
        lotId: selectedLot.id,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        ...serviceFormData,
        submittedAt: new Date().toISOString(),
      })
    }, 2000)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingPayment(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false)
      setPaymentSubmitted(true)

      // In real app, this would process payment through payment gateway
      console.log("Payment Request:", {
        lotId: selectedLot.id,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        ...paymentFormData,
        submittedAt: new Date().toISOString(),
      })
    }, 3000)
  }

  const handleGetDirections = () => {
    setShowDirections(true)
  }

  const handleMakePayment = (lot: any) => {
    setSelectedLot(lot)
    setShowPayment(true)
    // Pre-fill form data
    setPaymentFormData({
      ...paymentFormData,
      accountName: clientData.name,
      contactNumber: clientData.phone,
      email: clientData.email,
    })
  }

  const openInMaps = (type: "google" | "apple" | "waze") => {
    if (!selectedLot?.location?.coordinates) return

    const coords = selectedLot.location.coordinates
    const [lat, lng] = coords.split(", ").map((coord) => Number.parseFloat(coord.replace(/[°NSEW]/g, "")))

    const destination = `${lat},${lng}`
    const label = `Surigao Memorial Park - Lot ${selectedLot.id}`

    let url = ""

    switch (type) {
      case "google":
        url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${encodeURIComponent(label)}`
        break
      case "apple":
        url = `http://maps.apple.com/?daddr=${destination}&q=${encodeURIComponent(label)}`
        break
      case "waze":
        url = `https://waze.com/ul?ll=${destination}&navigate=yes&q=${encodeURIComponent(label)}`
        break
    }

    window.open(url, "_blank")
  }

  const calculatePaymentAmount = () => {
    if (!selectedLot) return 0

    if (paymentFormData.paymentType === "full") {
      return selectedLot.balance
    } else if (paymentFormData.paymentType === "installment") {
      return selectedLot.installmentPlan?.monthlyPayment || 0
    } else if (paymentFormData.paymentType === "custom") {
      return Number.parseFloat(paymentFormData.customAmount) || 0
    }
    return 0
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "gcash":
        return <Smartphone className="h-5 w-5" />
      case "paymaya":
        return <Smartphone className="h-5 w-5" />
      case "bank":
        return <Building className="h-5 w-5" />
      case "online":
        return <Globe className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-sm text-gray-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{clientData.name}</p>
                  <p className="text-xs text-gray-500">Lot Owner</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {clientData.name}</h2>
          <p className="text-gray-600">Manage your lots and stay updated with your memorial park services.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lots">My Lots</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Lots</p>
                      <p className="text-2xl font-bold">{clientData.lots.length}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Outstanding Balance</p>
                      <p className="text-2xl font-bold">
                        ₱{clientData.lots.reduce((sum, lot) => sum + lot.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="text-2xl font-bold">{new Date(clientData.memberSince).getFullYear()}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Unread Notifications</p>
                      <p className="text-2xl font-bold">{clientData.notifications.filter((n) => !n.read).length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientData.payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {payment.type} - Lot {payment.lotId}
                          </p>
                          <p className="text-xs text-gray-500">{payment.date}</p>
                        </div>
                        <Badge variant={payment.status === "Paid" ? "default" : "destructive"}>{payment.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Latest updates and announcements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientData.notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`p-1 rounded-full ${notification.read ? "bg-gray-100" : "bg-blue-100"}`}>
                          <Bell className={`h-4 w-4 ${notification.read ? "text-gray-500" : "text-blue-500"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lots" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientData.lots.map((lot) => (
                <Card key={lot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Lot {lot.id}
                        </CardTitle>
                        <CardDescription>{lot.section}</CardDescription>
                      </div>
                      <Badge variant={lot.status === "Occupied" ? "default" : "secondary"}>{lot.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium">{lot.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Purchase Date</p>
                          <p className="font-medium">{lot.purchaseDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Price</p>
                          <p className="font-medium">₱{lot.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Balance</p>
                          <p className={`font-medium ${lot.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                            ₱{lot.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {lot.occupant && (
                        <div className="border-t pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <p className="font-medium text-gray-900">Burial Information</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Occupant</p>
                              <p className="font-medium">{lot.occupant}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Burial Date</p>
                              <p className="font-medium">{lot.burialDate}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setSelectedLot(lot)
                            setShowLotDetails(true)
                          }}
                        >
                          View Details
                        </Button>
                        {lot.balance > 0 && (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleMakePayment(lot)}
                          >
                            Make Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Complete record of all your payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payment.type} Payment</p>
                          <p className="text-sm text-gray-600">Lot {payment.lotId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === "Paid" ? "default" : "destructive"}>{payment.status}</Badge>
                        <p className="text-sm text-gray-500 mt-1">{payment.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Request</CardTitle>
                <CardDescription>Send us your service requests or inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select request type</option>
                      <option value="maintenance">Lot Maintenance</option>
                      <option value="appointment">Schedule Appointment</option>
                      <option value="payment">Payment Inquiry</option>
                      <option value="documentation">Documentation Request</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief description of your request"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please provide detailed information about your request..."
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>Stay updated with important announcements and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${!notification.read ? "bg-blue-50 border-blue-200" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${!notification.read ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Bell className={`h-4
