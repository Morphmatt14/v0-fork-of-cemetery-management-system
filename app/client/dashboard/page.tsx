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
import { useRouter, useSearchParams } from 'next/navigation'
import { AppointmentBookingModal } from "@/components/appointment-booking-modal"
import LotViewerMap from "@/components/lot-viewer-map"
import { AIHelpWidget } from '@/components/ai-help-widget'
import { addClientInquiry, getClientInquiries, onPortalSyncUpdate } from '@/lib/portal-sync'
import { OverviewTab } from "./components/overview-tab"
import { MyLotsTab } from "./components/my-lots-tab"
import { PaymentsTab } from "./components/payments-tab"
import { NotificationsTab } from "./components/notifications-tab"
import { RequestsTab } from "./components/requests-tab"
import { fetchClientDashboardData, submitClientRequest } from '@/lib/api/client-api'

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

const LogOut = ({ className }: { className?: string }) => (
  <svg className={className || "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className || "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

import { Suspense } from 'react'

function ClientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'  // ✅ URL-based tabs!

  const [selectedLotForDetails, setSelectedLotForDetails] = useState<any>(null)
  const [selectedLotForAppointment, setSelectedLotForAppointment] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [newInquiry, setNewInquiry] = useState({ subject: '', message: '', lotId: '' })
  const [currentClientId, setCurrentClientId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Client data state - will be populated from API
  const [clientData, setClientData] = useState<any>({
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
    paymentPlans: [],
  })

  // Authentication check - Protect dashboard access
  useEffect(() => {
    const clientSession = localStorage.getItem('clientSession')
    const clientUser = localStorage.getItem('clientUser')

    console.log("[Client Portal] Checking authentication...")
    console.log("[Client Portal] clientSession:", clientSession)
    console.log("[Client Portal] clientUser:", clientUser)

    if (!clientSession && !clientUser) {
      console.log("[Client Portal] No session found, redirecting to login")
      router.push('/login')
      return
    }

    // Get client ID from session
    if (clientSession) {
      try {
        const session = JSON.parse(clientSession)
        setCurrentClientId(session.userId)
        setIsAuthenticated(true)
        console.log("[Client Portal] Authenticated - Client ID:", session.userId)
      } catch (e) {
        console.error("[Client Portal] Error parsing session:", e)
        router.push('/login')
      }
    } else if (clientUser) {
      try {
        const user = JSON.parse(clientUser)
        setCurrentClientId(user.id)
        setIsAuthenticated(true)
        console.log("[Client Portal] Authenticated - Client ID:", user.id)
      } catch (e) {
        console.error("[Client Portal] Error parsing user:", e)
        router.push('/login')
      }
    }
  }, [router])

  // Refresh function for reloading client data
  const refreshClientData = async () => {
    if (!currentClientId || !isAuthenticated) {
      return
    }

    try {
      console.log('[Client Dashboard] Refreshing data for client:', currentClientId)
      const data = await fetchClientDashboardData(currentClientId)

      setClientData({
        name: data.profile.name || data.profile.full_name || 'Client',
        email: data.profile.email,
        phone: data.profile.phone,
        memberSince: data.profile.created_at,
        lots: data.lots || [],
        payments: data.payments || [],
        notifications: data.notifications || []
      })

      setInquiries(data.requests || [])
    } catch (err: any) {
      console.error('[Client Dashboard] Error refreshing data:', err)
    }
  }

  // Load client data from API
  useEffect(() => {
    async function loadClientData() {
      if (!currentClientId || !isAuthenticated) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('[Client Dashboard] Loading data for client:', currentClientId)

        const data = await fetchClientDashboardData(currentClientId)

        console.log('[Client Dashboard] Data loaded successfully:', data)

        // Update client data with API response
        setClientData({
          name: data.profile.name || data.profile.full_name || 'Client',
          email: data.profile.email,
          phone: data.profile.phone,
          memberSince: data.profile.created_at,
          lots: data.lots || [],
          payments: data.payments || [],
          notifications: data.notifications || [],
          paymentPlans: data.paymentPlans || []
        })

        // Update inquiries
        setInquiries(data.requests || [])

        setIsLoading(false)
      } catch (err: any) {
        console.error('[Client Dashboard] Error loading data:', err)
        setError(err.message || 'Failed to load client data')
        setIsLoading(false)

        // Show error to user
        alert('Failed to load data: ' + (err.message || 'Unknown error'))
      }
    }

    loadClientData()
  }, [currentClientId, isAuthenticated])

  // Load updated data from localStorage on component mount (fallback)
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

  const handleTabChange = (value: string) => {
    router.push(`/client/dashboard?tab=${value}`, { scroll: false })
  }

  const handleLogout = () => {
    // Clear client session and user data
    localStorage.removeItem('clientSession')
    localStorage.removeItem('clientUser')

    console.log("[Client Portal] Logging out...")

    // Redirect to login page
    router.push('/login')
  }

  const handleSubmitInquiry = async (requestData: any) => {
    if (!requestData.subject || !requestData.message) {
      alert('Please fill in all fields')
      return
    }

    if (!currentClientId) {
      alert('Client ID not found. Please log in again.')
      return
    }

    try {
      console.log('[Client Dashboard] Submitting request:', requestData)

      // Submit request via API
      await submitClientRequest(currentClientId, requestData)

      console.log('[Client Dashboard] Request submitted successfully')
      alert('Request submitted successfully! Cemetery staff will respond soon.')

      // Reload requests to show the new one
      const data = await fetchClientDashboardData(currentClientId)
      setInquiries(data.requests || [])

    } catch (error: any) {
      console.error('[Client Dashboard] Error submitting request:', error)
      alert('Failed to submit request: ' + (error.message || 'Unknown error'))
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Logout"
                className="hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error loading data</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Main Content - Only show when not loading */}
        {!isLoading && (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {clientData.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your lots and stay updated with your memorial park services.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
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

              {activeTab === 'overview' && <OverviewTab clientData={clientData} />}

              {activeTab === 'lots' && (
                <MyLotsTab
                  lots={clientData.lots}
                  onViewDetails={(lot) => setSelectedLotForDetails(lot)}
                />
              )}

              {activeTab === 'map' && (
                <div className="space-y-6">
                  <LotViewerMap
                    userLots={clientData.lots.map((lot: any) => lot.id)}
                    onAppointmentRequest={(lot: any) => setSelectedLotForAppointment(lot)}
                  />
                </div>
              )}

              {activeTab === 'payments' && (
                <PaymentsTab
                  payments={clientData.payments}
                  lots={clientData.lots}
                  clientId={currentClientId || ''}
                  paymentPlans={clientData.paymentPlans}
                  onRefresh={refreshClientData}
                />
              )}

              {activeTab === 'requests' && (
                <RequestsTab
                  inquiries={inquiries}
                  lots={clientData.lots}
                  onSubmitRequest={handleSubmitInquiry}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  notifications={clientData.notifications}
                />
              )}

              {activeTab === 'inquiries' && (
                <RequestsTab
                  inquiries={inquiries}
                  lots={clientData.lots}
                  onSubmitRequest={handleSubmitInquiry}
                />
              )}
            </Tabs>
          </>
        )}
      </main>

      <AIHelpWidget portalType="client" />
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <ClientDashboardContent />
    </Suspense>
  )
}
