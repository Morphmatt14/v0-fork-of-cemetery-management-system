'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { getActivityLogs, getPasswordResetRequests, approvePasswordReset, rejectPasswordReset, logActivity } from '@/lib/activity-logger'
import type { AdminActivity, PasswordResetRequest } from '@/lib/activity-logger'
import { sendMessage, getMessagesForUser, markMessageAsRead } from '@/lib/messaging-store'
import type { Message } from '@/lib/messaging-store'
import { AIHelpWidget } from '@/components/ai-help-widget'

const LogOut = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const Plus = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Trash2 = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [activityLogs, setActivityLogs] = useState<AdminActivity[]>([])
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdminData, setNewAdminData] = useState({ username: '', password: '', name: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState('')
  
  const [selectedAdmin, setSelectedAdmin] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [messagePriority, setMessagePriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [messageType, setMessageType] = useState<'report_request' | 'issue' | 'general'>('general')
  const [activityFilter, setActivityFilter] = useState({ adminUsername: '', category: '' })
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  
  const router = useRouter()

  useEffect(() => {
    const superAdminUser = localStorage.getItem('superAdminUser')
    if (!superAdminUser) {
      router.push('/super-admin/login')
      return
    }
    loadData()
  }, [])

  const loadData = () => {
    const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
    setAdminUsers(authStore.adminUsers || [])
    setActivityLogs(getActivityLogs(activityFilter))
    setPasswordResetRequests(getPasswordResetRequests())
    setSentMessages(getMessagesForUser('superadmin'))
  }

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')

      if (authStore.adminUsers.some((u: any) => u.username === newAdminData.username)) {
        alert('Admin username already exists')
        setIsLoading(false)
        return
      }

      authStore.adminUsers.push({
        username: newAdminData.username,
        password: newAdminData.password,
        name: newAdminData.name,
        createdAt: Date.now(),
      })

      localStorage.setItem('auth_store', JSON.stringify(authStore))
      logActivity(localStorage.getItem('superAdminUser') || 'system', 'ADMIN_CREATED', `Created new admin: ${newAdminData.username}`, 'success')

      setSuccessMessage(`Admin '${newAdminData.username}' created successfully`)
      setNewAdminData({ username: '', password: '', name: '' })
      setShowCreateAdmin(false)
      setIsLoading(false)
      loadData()

      setTimeout(() => setSuccessMessage(''), 3000)
    }, 1000)
  }

  const handleDeleteAdmin = (username: string) => {
    if (!confirm(`Are you sure you want to delete admin '${username}'?`)) return

    const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
    authStore.adminUsers = authStore.adminUsers.filter((u: any) => u.username !== username)
    localStorage.setItem('auth_store', JSON.stringify(authStore))

    logActivity(localStorage.getItem('superAdminUser') || 'system', 'ADMIN_DELETED', `Deleted admin: ${username}`, 'success')
    setSuccessMessage(`Admin '${username}' deleted successfully`)
    loadData()

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleApprovePasswordReset = (requestId: string) => {
    if (!resetPassword) {
      alert('Please enter a new password')
      return
    }

    const superAdminUser = localStorage.getItem('superAdminUser') || 'system'
    approvePasswordReset(requestId, resetPassword, superAdminUser)
    setSuccessMessage('Password reset approved and updated')
    setResetPassword('')
    setSelectedRequestId('')
    loadData()

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleRejectPasswordReset = (requestId: string) => {
    const superAdminUser = localStorage.getItem('superAdminUser') || 'system'
    rejectPasswordReset(requestId, superAdminUser)
    setSuccessMessage('Password reset request rejected')
    loadData()

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('superAdminUser')
    localStorage.removeItem('superAdminSession')
    router.push('/super-admin/login')
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmin || !messageSubject || !messageBody) {
      alert('Please fill in all fields')
      return
    }

    sendMessage('superadmin', selectedAdmin, messageSubject, messageBody, messagePriority, messageType)
    
    logActivity('superadmin', 'MESSAGE_SENT', `Sent ${messageType} message to admin ${selectedAdmin}`, 'success', 'system')
    
    setSuccessMessage(`Message sent to ${selectedAdmin}`)
    setSelectedAdmin('')
    setMessageSubject('')
    setMessageBody('')
    setMessagePriority('normal')
    setMessageType('general')
    loadData()

    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleFilterChange = () => {
    setActivityLogs(getActivityLogs(activityFilter))
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
            <TabsTrigger value="monitoring">Activity Monitoring</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="password-resets">Password Resets</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{adminUsers.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Password Resets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {passwordResetRequests.filter(r => r.status === 'pending').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activityLogs.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Admin Accounts</h3>
              <Button onClick={() => setShowCreateAdmin(!showCreateAdmin)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Admin
              </Button>
            </div>

            {showCreateAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Admin Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <Input
                      placeholder="Admin Name"
                      value={newAdminData.name}
                      onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Admin Username"
                      value={newAdminData.username}
                      onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Admin Password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? 'Creating...' : 'Create'}
                      </Button>
                      <Button type="button" onClick={() => setShowCreateAdmin(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {adminUsers.map((admin) => (
                <Card key={admin.username}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{admin.name || admin.username}</p>
                      <p className="text-sm text-gray-600">Username: {admin.username}</p>
                      {admin.createdAt && (
                        <p className="text-xs text-gray-500">
                          Created: {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteAdmin(admin.username)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Real-Time Admin Activity Monitoring</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filter Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={activityFilter.adminUsername}
                    onValueChange={(value) => {
                      setActivityFilter({ ...activityFilter, adminUsername: value })
                      handleFilterChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Admin" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminUsers.map((admin) => (
                        <SelectItem key={admin.username} value={admin.username}>
                          {admin.name || admin.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={activityFilter.category}
                    onValueChange={(value) => {
                      setActivityFilter({ ...activityFilter, category: value })
                      handleFilterChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payments</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="lot">Lots</SelectItem>
                      <SelectItem value="map">Map Editor</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleFilterChange} variant="outline">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {adminUsers.map((admin) => {
                const adminLogs = getActivityLogs({ adminUsername: admin.username })
                const paymentLogs = adminLogs.filter(l => l.category === 'payment')
                const clientLogs = adminLogs.filter(l => l.category === 'client')
                const lotLogs = adminLogs.filter(l => l.category === 'lot')
                const mapLogs = adminLogs.filter(l => l.category === 'map')

                return (
                  <Card key={admin.username}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{admin.name || admin.username}</CardTitle>
                      <CardDescription className="text-xs">@{admin.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Total Activities:</span>
                        <Badge>{adminLogs.length}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Payments:</span>
                        <Badge variant="secondary">{paymentLogs.length}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Clients:</span>
                        <Badge variant="secondary">{clientLogs.length}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Lots/Maps:</span>
                        <Badge variant="secondary">{lotLogs.length + mapLogs.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="border-b pb-2">
                      <div className="flex justify-between items-start text-sm">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.category === 'payment' ? 'default' : 'secondary'}>
                              {log.category}
                            </Badge>
                            <p className="font-semibold">{log.action}</p>
                          </div>
                          <p className="text-gray-600 text-xs">{log.details}</p>
                          <p className="text-xs text-gray-500">By: {log.adminUsername}</p>
                          {log.affectedRecords && log.affectedRecords.length > 0 && (
                            <p className="text-xs text-blue-600">
                              Affected: {log.affectedRecords.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send Messages to Admins</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>Send reports requests, clarifications, or issue notifications to admins</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Admin</label>
                    <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose admin to message" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminUsers.map((admin) => (
                          <SelectItem key={admin.username} value={admin.username}>
                            {admin.name || admin.username} (@{admin.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Message Type</label>
                      <Select value={messageType} onValueChange={(v: any) => setMessageType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="report_request">Report Request</SelectItem>
                          <SelectItem value="issue">Issue/Error Notification</SelectItem>
                          <SelectItem value="general">General Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={messagePriority} onValueChange={(v: any) => setMessagePriority(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Enter message subject"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sentMessages.length === 0 ? (
                    <p className="text-sm text-gray-500">No messages yet</p>
                  ) : (
                    sentMessages.map((msg) => (
                      <div key={msg.id} className="border p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                msg.priority === 'urgent' ? 'destructive' :
                                msg.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {msg.priority}
                              </Badge>
                              <Badge variant="outline">{msg.type}</Badge>
                            </div>
                            <p className="font-semibold text-sm">{msg.subject}</p>
                            <p className="text-xs text-gray-600">To: {msg.to}</p>
                            <p className="text-xs text-gray-500 mt-1">{msg.body}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleString()}
                            </p>
                            {msg.read && (
                              <Badge variant="default" className="mt-1">Read</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password-resets" className="space-y-4">
            <h3 className="text-lg font-semibold">Password Reset Requests</h3>
            <div className="space-y-4">
              {passwordResetRequests.length === 0 ? (
                <Alert>
                  <AlertDescription>No password reset requests at this time</AlertDescription>
                </Alert>
              ) : (
                passwordResetRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Admin: {request.adminUsername}</p>
                            <p className="text-sm text-gray-600">
                              Requested: {new Date(request.requestedAt).toLocaleString()}
                            </p>
                            <p className={`text-sm font-medium ${
                              request.status === 'pending' ? 'text-yellow-600' :
                              request.status === 'approved' ? 'text-green-600' :
                              'text-red-600'
                            }`}>
                              Status: {request.status.toUpperCase()}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {request.resolvedBy && `Resolved by: ${request.resolvedBy}`}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="space-y-2 border-t pt-2">
                            <Input
                              type="password"
                              placeholder="Set new password for admin"
                              value={selectedRequestId === request.id ? resetPassword : ''}
                              onChange={(e) => {
                                setSelectedRequestId(request.id)
                                setResetPassword(e.target.value)
                              }}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprovePasswordReset(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectPasswordReset(request.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <Alert>
                  <AlertDescription>No activities logged yet</AlertDescription>
                </Alert>
              ) : (
                activityLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start text-sm">
                        <div className="space-y-1">
                          <p className="font-semibold">{log.action}</p>
                          <p className="text-gray-600">{log.details}</p>
                          <p className="text-xs text-gray-500">Admin: {log.adminUsername}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <AIHelpWidget portalType="super-admin" />
    </div>
  )
}
