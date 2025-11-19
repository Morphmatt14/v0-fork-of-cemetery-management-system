'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardOverview } from '@/components/dashboard-overview'
import { fetchAdminOverviewStats } from '@/lib/admin-api'
import { Loader2 } from 'lucide-react'

export default function OverviewTab() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    employeesCount: 0,
    pendingPasswordResets: 0,
    recentActivitiesCount: 0
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOverviewStats()
  }, [])

  const loadOverviewStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAdminOverviewStats()
      setStats({
        employeesCount: data.employeesCount,
        pendingPasswordResets: data.pendingPasswordResets,
        recentActivitiesCount: data.recentActivitiesCount
      })
    } catch (err: any) {
      console.error('[Overview Tab] Error loading stats:', err)
      setError(err.message || 'Failed to load overview statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Real-time statistics from Supabase */}
      <DashboardOverview role="admin" />
      
      {/* Additional Admin-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error loading</div>
            ) : (
              <div className="text-3xl font-bold">{stats.employeesCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Password Resets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error loading</div>
            ) : (
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pendingPasswordResets}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">Error loading</div>
            ) : (
              <div className="text-3xl font-bold">{stats.recentActivitiesCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
