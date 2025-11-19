'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardOverview } from '@/components/dashboard-overview'
import { MapPin, Users, DollarSign, MessageSquare, Eye } from './icons'
import { formatCurrency, getStatusColor } from './utils'

interface OverviewTabProps {
  dashboardData: any
  inquiries: any[]
  openViewBurial: (burial: any) => void
  openReplyInquiry: (inquiry: any) => void
}

export default function OverviewTab({
  dashboardData,
  inquiries,
  openViewBurial,
  openReplyInquiry
}: OverviewTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Real-time statistics from Supabase */}
      <DashboardOverview role="employee" />
      
      {/* Additional Employee-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lots</p>
                <p className="text-xl sm:text-2xl font-bold">{dashboardData.stats.totalLots}</p>
                <p className="text-xs text-gray-500">
                  {dashboardData.stats.occupiedLots} occupied • {dashboardData.stats.availableLots} available
                </p>
              </div>
              <MapPin />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-xl sm:text-2xl font-bold">{dashboardData.stats.totalClients}</p>
                <p className="text-xs text-gray-500">Active lot owners</p>
              </div>
              <Users />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-xl sm:text-2xl font-bold">
                  ₱{formatCurrency(dashboardData.stats.monthlyRevenue)}
                </p>
                <p className="text-xs text-gray-500">{dashboardData.stats.overduePayments} overdue payments</p>
              </div>
              <DollarSign />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Inquiries</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {inquiries.filter((i) => i.status !== "Resolved").length}
                </p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
              <MessageSquare />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Burials</CardTitle>
            <CardDescription>Latest burial records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentBurials.map((burial: any) => (
                <div key={burial.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{burial.name}</p>
                    <p className="text-sm text-gray-600">
                      Lot {burial.lot} • {burial.family}
                    </p>
                    <p className="text-xs text-gray-500">{burial.date}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openViewBurial(burial)}>
                    <Eye />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Inquiries</CardTitle>
            <CardDescription>Client inquiries requiring response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inquiries
                .filter((i) => i.status !== "Resolved")
                .slice(0, 3)
                .map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{inquiry.name}</p>
                      <p className="text-sm text-gray-600">{inquiry.type}</p>
                      <p className="text-xs text-gray-500">{inquiry.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => openReplyInquiry(inquiry)}>
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
