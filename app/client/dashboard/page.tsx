"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { AppointmentBookingModal } from "@/components/appointment-booking-modal"
import LotViewerMap from "@/components/lot-viewer-map"
import { AIHelpWidget } from '@/components/ai-help-widget'
import { addClientInquiry, getClientInquiries, onPortalSyncUpdate } from '@/lib/portal-sync'

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

// Inline SVG components
const MapPin = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Calendar = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const DollarSign = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Vertical stem of the P */}
    <line x1="9" y1="4" x2="9" y2="20" strokeWidth={2} strokeLinecap="round" />
    {/* Top bowl of the P */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5h4a3.5 3.5 0 013.5 3.5v0A3.5 3.5 0 0113 12H9"
    />
    {/* First horizontal line crossing the stem */}
    <line x1="5" y1="8" x2="16" y2="8" strokeWidth={2} strokeLinecap="round" />
    {/* Second horizontal line crossing the stem */}
    <line x1="5" y1="11" x2="16.5" y2="11" strokeWidth={2} strokeLinecap="round" />
  </svg>
)

const Bell = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const Heart = () => (
  <svg className="h-5 w-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    />
  </svg>
)

const LogOut = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const CreditCard = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H5a3 3 0 00-3 3v11a3 3 0 003 3z"
    />
  </svg>
)

const ArrowLeft = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const Eye = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLotForDetails, setSelectedLotForDetails] = useState<any>(null)
  const [selectedLotForAppointment, setSelectedLotForAppointment] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [newInquiry, setNewInquiry] = useState({ subject: '', message: '', lotId: '' })
  const router = useRouter()

  // Load client data from localStorage or use default
  const [clientData] = useState({
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
      const currentClient = savedData.clients.find((client: any) => client.name === "Maria Santos")
      if (currentClient) {
        console.log("Client data updated from localStorage")
      }
    }
  }, [])

  useEffect(() => {
    const loadInquiries = () => {
      const clientInquiries = getClientInquiries('client-001')
      setInquiries(clientInquiries)
    }
    
    loadInquiries()
    
    // Listen for portal sync updates
    const unsubscribe = onPortalSyncUpdate((detail) => {
      if (detail.dataType === 'inquiries') {
        loadInquiries()
      }
    })
    
    return unsubscribe
  }, [])

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInquiry.subject || !newInquiry.message) {
      alert('Please fill in all fields')
      return
    }

    addClientInquiry('client-001', clientData.name, newInquiry.subject, newInquiry.message, newInquiry.lotId || undefined)
    
    setNewInquiry({ subject: '', message: '', lotId: '' })
    setInquiries(getClientInquiries('client-001'))
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

      {/* Header - Made responsive */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 ml-12 sm:ml-16">
              <div className="bg-white p-1 sm:p-2 rounded-lg shadow-sm">
                <Image
                  src="/images/smpi-logo.png"
                  alt="SMPI Logo"
                  width={24}
                  height={24}
                  className="sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 mb-2">Surigao Memorial Park</h1>
                <p className="text-xs sm:text-sm text-gray-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome back, {clientData.name}</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your lots and stay updated with your memorial park services.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 w-full text-xs sm:text-sm overflow-x-auto">
            <TabsTrigger value="overview" className="px-2 sm:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="lots" className="px-2 sm:px-4">
              My Lots
            </TabsTrigger>
            <TabsTrigger value="map" className="px-2 sm:px-4">
              Map Viewer
            </TabsTrigger>
            <TabsTrigger value="payments" className="px-2 sm:px-4">
              Payments
            </TabsTrigger>
            <TabsTrigger value="requests" className="px-2 sm:px-4">
              Requests
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-2 sm:px-4">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="px-2 sm:px-4">
              Inquiries
            </TabsTrigger>
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
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900">
                  ℹ️ <strong>Viewing Only:</strong> Below are your purchased lots. Use the "Book Appointment" button to
                  schedule a visit. Your balance and payment history are displayed in the Payments tab.
                </p>
              </CardContent>
            </Card>

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
                          <p className={`font-medium ${lot.balance > 0 ? "text-orange-600" : "text-green-600"}`}>
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
                          onClick={() => setSelectedLotForDetails(lot)}
                          title="View detailed information about this lot"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => setSelectedLotForAppointment(lot)}
                          title="Schedule an appointment to visit this lot"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {clientData.lots.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    You don't have any lots yet. Contact us to purchase your memorial lot.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <LotViewerMap
              userLots={clientData.lots.map((lot) => lot.id)}
              onAppointmentRequest={(lot) => setSelectedLotForAppointment(lot)}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your payment records and current balance (Viewing Only)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Outstanding Balance</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₱{clientData.lots.reduce((sum, lot) => sum + lot.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  {clientData.payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No payment records yet.</p>
                    </div>
                  ) : (
                    clientData.payments.map((payment) => (
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
                          <Badge variant={payment.status === "Paid" ? "default" : "secondary"}>{payment.status}</Badge>
                          <p className="text-sm text-gray-500 mt-1">{payment.date}</p>
                        </div>
                      </div>
                    ))
                  )}
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
                    <label htmlFor="request-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Request Type
                    </label>
                    <select
                      id="request-type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select request type</option>
                      <option value="maintenance">Lot Maintenance</option>
                      <option value="appointment">Schedule Appointment</option>
                      <option value="payment">Payment Inquiry</option>
                      <option value="documentation">Documentation Request</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief description of your request"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please provide detailed information about your request..."
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Bell className="h-4 w-4 mr-2" />
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
                          <Bell className={`h-4 w-4 ${!notification.read ? "text-blue-500" : "text-gray-500"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">{notification.date}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="mt-2">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Inquiry</CardTitle>
                <CardDescription>Send your questions or requests to the cemetery management</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related to Lot (Optional)
                    </label>
                    <select
                      value={newInquiry.lotId}
                      onChange={(e) => setNewInquiry({ ...newInquiry, lotId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Select a lot (optional) --</option>
                      {clientData.lots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          Lot {lot.id} - {lot.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newInquiry.subject}
                      onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="What is your inquiry about?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={newInquiry.message}
                      onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please provide details about your inquiry..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Send Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Inquiries</CardTitle>
                <CardDescription>Track your submitted inquiries and admin responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No inquiries yet</p>
                  ) : (
                    inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{inquiry.subject}</h4>
                            <p className="text-sm text-gray-600">{inquiry.message}</p>
                            {inquiry.lotId && (
                              <p className="text-xs text-gray-500 mt-1">Related to Lot: {inquiry.lotId}</p>
                            )}
                          </div>
                          <Badge variant={inquiry.status === 'new' ? 'secondary' : 'default'}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        {inquiry.adminReplies && inquiry.adminReplies.length > 0 && (
                          <div className="border-t mt-3 pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Admin Response:</p>
                            {inquiry.adminReplies.map((reply: any) => (
                              <div key={reply.id} className="bg-blue-50 rounded p-2 mb-2">
                                <p className="text-xs text-blue-900">{reply.message}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                  From {reply.from} - {new Date(reply.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(inquiry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AIHelpWidget portalType="client" />
    </div>
  )
}
