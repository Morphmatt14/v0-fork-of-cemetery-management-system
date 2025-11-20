'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'
import { getActivityLogs, getPasswordResetRequests } from '@/lib/activity-logger'
import type { AdminActivity, PasswordResetRequest } from '@/lib/activity-logger'
import { getMessagesForUser } from '@/lib/messaging-store'
import type { Message } from '@/lib/messaging-store'
import { AIHelpWidget } from '@/components/ai-help-widget'
import { logout } from '@/lib/dashboard-api'
import OverviewTab from './components/overview-tab'
import AdminManagementTab from './components/admin-management-tab'
import ActivityMonitoringTab from './components/activity-monitoring-tab'
import MessagingTab from './components/messaging-tab'
import PasswordResetsTab from './components/password-resets-tab'
import ActivityLogsTab from './components/activity-logs-tab'
import { ApprovalsManagement } from './components/approvals-management'

const LogOut = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function SuperAdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  
  const [activityLogs, setActivityLogs] = useState<AdminActivity[]>([])
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [sentMessages, setSentMessages] = useState<Message[]>([])

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    const adminUser = localStorage.getItem('adminUser')
    const currentUser = localStorage.getItem('currentUser')
    
    console.log("[v0] Checking admin authentication...")
    console.log("[v0] adminSession:", adminSession)
    console.log("[v0] adminUser:", adminUser)
    console.log("[v0] currentUser:", currentUser)
    
    if (!adminSession && !adminUser && !currentUser) {
      console.log("[v0] No admin session found, redirecting to login")
      router.push('/admin/login')
      return
    }
    
    // Verify it's actually an admin role
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user.role !== 'admin') {
          console.log("[v0] User is not admin role, redirecting")
          router.push('/admin/login')
          return
        }
      } catch (e) {
        console.error("[v0] Error parsing currentUser:", e)
      }
    }
    
    console.log("[v0] Admin authenticated, loading dashboard data")
    loadData()
  }, [])

  const loadData = () => {
    const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
    setAdminUsers(authStore.adminUsers || [])
    setActivityLogs(getActivityLogs())
    setPasswordResetRequests(getPasswordResetRequests())
    setSentMessages(getMessagesForUser('superadmin'))
  }

  const handleLogout = () => {
    logout(router)
  }

  const handleTabChange = (value: string) => {
    router.push(`/admin/dashboard?tab=${value}`, { scroll: false })
  }

  const showMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-600">System Administration & Control Center</p>
          </div>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="admins">Employee Management</TabsTrigger>
            <TabsTrigger value="monitoring">Activity Monitoring</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="password-resets">Password Resets</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          {activeTab === 'overview' && <OverviewTab />}

          {activeTab === 'approvals' && (
            <ApprovalsManagement adminId={JSON.parse(localStorage.getItem('currentUser') || '{}').id || 'admin-mock'} />
          )}

          {activeTab === 'admins' && (
            <AdminManagementTab 
              onShowMessage={showMessage}
            />
          )}

          {activeTab === 'monitoring' && <ActivityMonitoringTab />}

          {activeTab === 'messaging' && (
            <MessagingTab 
              adminUsers={adminUsers}
              sentMessages={sentMessages}
              onDataChange={loadData}
              onShowMessage={showMessage}
            />
          )}

          {activeTab === 'password-resets' && (
            <PasswordResetsTab 
              passwordResetRequests={passwordResetRequests}
              onDataChange={loadData}
              onShowMessage={showMessage}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityLogsTab 
              activityLogs={activityLogs}
            />
          )}
        </Tabs>
      </main>
      
      <AIHelpWidget portalType="super-admin" />
    </div>
  )
}
