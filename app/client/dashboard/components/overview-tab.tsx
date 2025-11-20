"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

  useEffect(() => {
    if (clientData && clientData.lots) {
      // Calculate statistics from client data
      const totalLots = clientData.lots.length
      const occupiedLots = clientData.lots.filter((lot: any) => lot.status === "Occupied").length
      const vacantLots = clientData.lots.filter((lot: any) => lot.status === "Reserved").length
      const totalBalance = clientData.lots.reduce((sum: number, lot: any) => sum + (lot.balance || 0), 0)
      const upcomingPayments = clientData.payments?.filter((p: any) => p.status === "Due").length || 0
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
  }, [clientData])

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
              <div className="mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Member since {new Date(clientData.memberSince).getFullYear()}
                </Badge>
              </div>
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
    </div>
  )
}
