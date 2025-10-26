"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Calendar,
  DollarSign,
  Bell,
  MessageSquare,
  Heart,
  LogOut,
  ArrowLeft,
  AlertCircle,
  Send,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Lot {
  id: string
  section: string
  type: string
  status: "Occupied" | "Reserved" | "Available" | "Maintenance"
  occupant?: string
  burialDate?: string
  purchaseDate: string
  price: number
  balance: number
  size: string
}

interface Payment {
  id: number
  date: string
  amount: number
  type: "Full Payment" | "Down Payment" | "Installment" | "Partial Payment"
  status: "Paid" | "Due" | "Pending" | "Overdue"
  lotId: string
}

interface Notification {
  id: number
  type: "payment" | "maintenance" | "announcement"
  message: string
  date: string
  read: boolean
}

interface ClientData {
  name: string
  email: string
  phone: string
  memberSince: string
  lots: Lot[]
  payments: Payment[]
  notifications: Notification[]
}

const DEFAULT_CLIENT_DATA: ClientData = {
  name: "Maria Santos",
  email: "maria.santos@email.com",
  phone: "09123456789",
  memberSince: "2020-03-15",
  lots: [
    {
      id: "A-002",
      section: "Garden of Peace",
      type: "Standard",
      status: "Occupied",
      occupant: "Juan Santos",
      burialDate: "2023-05-15",
      purchaseDate: "2020-03-15",
      price: 75000,
      balance: 0,
      size: "2m x 1m",
    },
    {
      id: "B-001",
      section: "Garden of Serenity",
      type: "Premium",
      status: "Reserved",
      purchaseDate: "2024-01-10",
      price: 120000,
      balance: 45000,
      size: "3m x 2m",
    },
  ],
  payments: [
    { id: 1, date: "2024-01-15", amount: 25000, type: "Installment", status: "Paid", lotId: "B-001" },
    { id: 2, date: "2024-02-15", amount: 25000, type: "Installment", status: "Paid", lotId: "B-001" },
    { id: 3, date: "2024-03-15", amount: 25000, type: "Installment", status: "Due", lotId: "B-001" },
  ],
  notifications: [
    { id: 1, type: "payment", message: "Payment due for Lot B-001", date: "2024-01-20", read: false },
    {
      id: 2,
      type: "maintenance",
      message: "Scheduled maintenance in Garden of Peace",
      date: "2024-01-18",
      read: true,
    },
    { id: 3, type: "announcement", message: "New payment options now available", date: "2024-01-15", read: true },
  ],
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [clientData, setClientData] = useState<ClientData>(DEFAULT_CLIENT_DATA)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [requestData, setRequestData] = useState({
    requestType: "",
    subject: "",
    message: "",
  })
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadClientData = useCallback(() => {
    try {
      setClientData(DEFAULT_CLIENT_DATA)
      setError(null)
    } catch (err) {
      console.error("Error loading client data:", err)
      setError("Failed to load your data. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClientData()

    intervalRef.current = setInterval(() => {
      loadClientData()
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [loadClientData])

  const handleBackClick = () => {
    router.push("/")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("clientSession")
    router.push("/login")
  }

  const handleViewLotDetails = (lotId: string) => {
    console.log("Viewing lot details:", lotId)
  }

  const handleMakePayment = (lotId: string) => {
    console.log("Making payment for lot:", lotId)
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!requestData.requestType || !requestData.subject || !requestData.message) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmittingRequest(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Request submitted:", requestData)

      setRequestData({
        requestType: "",
        subject: "",
        message: "",
      })

      alert("Your request has been submitted successfully!")
    } catch (err) {
      console.error("Error submitting request:", err)
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const handleMarkNotificationRead = (notificationId: number) => {
    setClientData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    }))
  }

  const handleRequestInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setRequestData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
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
                <p className="text-sm text-gray-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    {clientData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{clientData.name}</p>
                  <p className="text-xs text-gray-500">Lot Owner</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Logout"
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Lots</p>
                      <p className="text-2xl font-bold">{clientData.lots?.length || 0}</p>
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
                        ₱{clientData.lots?.reduce((sum, lot) => sum + (lot.balance || 0), 0).toLocaleString() || "0"}
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
                      <p className="text-2xl font-bold">
                        {clientData.notifications?.filter((n) => !n.read).length || 0}
                      </p>
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
                    {clientData.payments?.slice(0, 3).map((payment) => (
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
                    {!clientData.payments || clientData.payments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No payment history yet</p>
                    ) : null}
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
                    {clientData.notifications?.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleMarkNotificationRead(notification.id)
                          }
                        }}
                      >
                        <div className={`p-1 rounded-full ${notification.read ? "bg-gray-100" : "bg-blue-100"}`}>
                          <Bell className={`h-4 w-4 ${notification.read ? "text-gray-500" : "text-blue-500"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                    {!clientData.notifications || clientData.notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Lots Tab */}
          <TabsContent value="lots" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientData.lots && clientData.lots.length > 0 ? (
                clientData.lots.map((lot) => (
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
                        <Badge
                          variant={
                            lot.status === "Occupied" ? "default" : lot.status === "Reserved" ? "secondary" : "outline"
                          }
                        >
                          {lot.status}
                        </Badge>
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
                          <div>
                            <p className="text-gray-600">Size</p>
                            <p className="font-medium">{lot.size}</p>
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
                              {lot.burialDate && (
                                <div>
                                  <p className="text-gray-600">Burial Date</p>
                                  <p className="font-medium">{lot.burialDate}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleViewLotDetails(lot.id)}
                          >
                            View Details
                          </Button>
                          {lot.balance > 0 && (
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleMakePayment(lot.id)}
                            >
                              Make Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-2">
                  <CardContent className="p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lots found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Complete record of all your payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.payments && clientData.payments.length > 0 ? (
                    clientData.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{payment.type} Payment</p>
                          <p className="text-sm text-gray-600">Lot {payment.lotId}</p>
                          <p className="text-xs text-gray-500">{payment.date}</p>
                        </div>
                        <Badge variant={payment.status === "Paid" ? "default" : "destructive"}>{payment.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No payment history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Submit a Request
                </CardTitle>
                <CardDescription>Send us your service requests or inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label htmlFor="request-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Request Type *
                    </label>
                    <select
                      id="request-type"
                      name="requestType"
                      value={requestData.requestType}
                      onChange={handleRequestInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isSubmittingRequest}
                      required
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
                      Subject *
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={requestData.subject}
                      onChange={handleRequestInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Brief description of your request"
                      disabled={isSubmittingRequest}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={requestData.message}
                      onChange={handleRequestInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Please provide detailed information about your request..."
                      disabled={isSubmittingRequest}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    disabled={isSubmittingRequest}
                  >
                    {isSubmittingRequest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>Stay updated with important announcements and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.notifications && clientData.notifications.length > 0 ? (
                    clientData.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          !notification.read ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleMarkNotificationRead(notification.id)
                          }
                        }}
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
