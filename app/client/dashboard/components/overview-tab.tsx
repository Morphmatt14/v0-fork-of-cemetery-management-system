"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OverviewTabProps {
  clientData: any
}

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

export function OverviewTab({ clientData }: OverviewTabProps) {
  const [stats, setStats] = useState({
    totalLots: 0,
    occupiedLots: 0,
    vacantLots: 0,
    totalBalance: 0,
    upcomingPayments: 0,
    unreadNotifications: 0,
  })
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)

  const lots = clientData?.lots || []
  const payments = clientData?.payments || []

  const lotSummaries = useMemo(() => {
    const summaries: Record<string, { price: number; totalPaid: number; outstanding: number }> = {}

    lots.forEach((lot: any) => {
      const key = String(lot.id)
      const price = Number(lot.price) || 0
      summaries[key] = {
        price,
        totalPaid: 0,
        outstanding: price,
      }
    })

    payments.forEach((payment: any) => {
      const lotKey = String(payment.lotId ?? "")
      if (!lotKey) return

      const matchingLot = lots.find((lot: any) => String(lot.id) === lotKey)
      if (!matchingLot) return

      const isCompleted =
        payment.status && (payment.status === "Paid" || payment.status === "Completed")

      if (!isCompleted) return

      const price = Number(matchingLot.price) || 0
      const previous = summaries[lotKey] || {
        price,
        totalPaid: 0,
        outstanding: price,
      }

      const amount = Number(payment.amount) || 0
      const newTotalPaid = previous.totalPaid + amount

      summaries[lotKey] = {
        price,
        totalPaid: newTotalPaid,
        outstanding: Math.max(0, price - newTotalPaid),
      }
    })

    return summaries
  }, [lots, payments])

  const totalOutstanding = useMemo(
    () =>
      lots.reduce((sum: number, lot: any) => {
        const key = String(lot.id)
        const summary = lotSummaries[key]

        if (summary) {
          return sum + summary.outstanding
        }

        const price = Number(lot.price) || 0
        const balance = typeof lot.balance === "number" ? lot.balance : price

        return sum + balance
      }, 0),
    [lots, lotSummaries]
  )

  useEffect(() => {
    if (clientData && lots) {
      // Calculate statistics from client data
      const totalLots = lots.length
      const occupiedLots = lots.filter((lot: any) => lot.status === "Occupied").length
      const vacantLots = lots.filter((lot: any) => lot.status === "Reserved").length
      const totalBalance = totalOutstanding
      const upcomingPayments = payments?.filter(
        (p: any) =>
          p.status &&
          (p.status === "Due" || p.status === "Pending" || p.status === "Under Payment"),
      ).length || 0
      const unreadNotifications = clientData.notifications?.filter((n: any) => !n.read).length || 0

      setStats({
        totalLots,
        occupiedLots,
        vacantLots,
        totalBalance,
        upcomingPayments,
        unreadNotifications,
      })
    }
  }, [clientData, lots, payments, totalOutstanding])

  const allPayments = clientData?.payments || []

  const latestInvoiceUrl = useMemo(() => {
    if (!allPayments.length) return null
    const sorted = [...allPayments].sort(
      (a: any, b: any) => new Date(b.date || b.payment_date || '').getTime() - new Date(a.date || a.payment_date || '').getTime()
    )
    const firstWithInvoice = sorted.find((payment) => Boolean(payment.invoice_pdf_url))
    return firstWithInvoice?.invoice_pdf_url || null
  }, [allPayments])

  const contractUrl = useMemo(() => {
    if (!allPayments.length) return null
    const firstWithContract = allPayments.find((payment: any) => Boolean(payment.contract_pdf_url))
    return firstWithContract?.contract_pdf_url || null
  }, [allPayments])

  const hasDocuments = Boolean(contractUrl || latestInvoiceUrl)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Client Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                {getInitials(clientData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900">{clientData.name}</h3>
              <p className="text-sm text-gray-600">{clientData.email}</p>
              <p className="text-sm text-gray-600">{clientData.phone}</p>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Member since {new Date(clientData.memberSince).getFullYear()}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDocumentViewerOpen(true)}
                  disabled={!hasDocuments}
                >
                  View Documents
                </Button>
              </div>
              {!hasDocuments && (
                <p className="mt-2 text-xs text-gray-500">
                  Your invoice and certificate will be available once your first payment is processed.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Lots</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalLots}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.occupiedLots} occupied, {stats.vacantLots} vacant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Outstanding Balance</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(stats.totalBalance).replace("PHP", "₱")}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Payments</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.upcomingPayments}</div>
            <p className="text-xs text-gray-500 mt-1">Payments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Notifications</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.unreadNotifications}</div>
            <p className="text-xs text-gray-500 mt-1">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of your memorial park services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lots Summary */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg mt-1">
                <Heart />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Your Lots</h4>
                <p className="text-sm text-gray-600">
                  You have {stats.totalLots} lot{stats.totalLots !== 1 ? "s" : ""} registered in the memorial park.
                  {stats.occupiedLots > 0 && ` ${stats.occupiedLots} are currently occupied.`}
                  {stats.vacantLots > 0 && ` ${stats.vacantLots} are reserved for future use.`}
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            {stats.totalBalance > 0 && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg mt-1">
                  <CreditCard />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Outstanding Balance</h4>
                  <p className="text-sm text-gray-600">
                    You have an outstanding balance of{" "}
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(stats.totalBalance)}
                    </span>
                    . {stats.upcomingPayments > 0 && `${stats.upcomingPayments} payment(s) are due.`}
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Summary */}
            {stats.unreadNotifications > 0 && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg mt-1">
                  <Bell />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">New Notifications</h4>
                  <p className="text-sm text-gray-600">
                    You have {stats.unreadNotifications} unread notification
                    {stats.unreadNotifications !== 1 ? "s" : ""}. Check the Notifications tab for updates.
                  </p>
                </div>
              </div>
            )}

            {/* All Good Message */}
            {stats.totalBalance === 0 && stats.unreadNotifications === 0 && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg mt-1">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">All Up to Date!</h4>
                  <p className="text-sm text-gray-600">
                    Your account is in good standing. No outstanding balances or pending notifications.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDocumentViewerOpen} onOpenChange={setIsDocumentViewerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Documents</DialogTitle>
            <DialogDescription>Access the latest certificate of ownership and invoices available for your account.</DialogDescription>
          </DialogHeader>
          {hasDocuments ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Certificate of Ownership</p>
                  <p className="text-sm text-gray-500">PDF generated from your latest contract details.</p>
                </div>
                <Button asChild variant="outline" disabled={!contractUrl}>
                  {contractUrl ? (
                    <a href={contractUrl} target="_blank" rel="noopener noreferrer">
                      View Certificate
                    </a>
                  ) : (
                    <span>No certificate yet</span>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Latest Invoice</p>
                  <p className="text-sm text-gray-500">The most recent payment invoice saved on file.</p>
                </div>
                <Button asChild variant="outline" disabled={!latestInvoiceUrl}>
                  {latestInvoiceUrl ? (
                    <a href={latestInvoiceUrl} target="_blank" rel="noopener noreferrer">
                      Download Invoice
                    </a>
                  ) : (
                    <span>No invoice yet</span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Documents will appear here once your first payment and contract are processed.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
