'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { sendMessage, deleteMessage } from '@/lib/messaging-store'
import type { Message } from '@/lib/messaging-store'
import { logActivity } from '@/lib/activity-logger'
import { fetchEmployees, type Employee } from '@/lib/admin-api'
import { Loader2, Send, Trash2, Search, Filter, X } from 'lucide-react'

interface MessagingTabProps {
  adminUsers: any[]
  sentMessages: Message[]
  onDataChange: () => void
  onShowMessage: (message: string) => void
}

export default function MessagingTab({ adminUsers, sentMessages, onDataChange, onShowMessage }: MessagingTabProps) {
  // Form state
  const [selectedAdmin, setSelectedAdmin] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [messagePriority, setMessagePriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [messageType, setMessageType] = useState<'report_request' | 'issue' | 'general'>('general')
  
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)
  const messagesPerPage = 5
  
  useEffect(() => {
    loadEmployees()
    loadMessages()
  }, [])
  
  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await fetchEmployees()
      setEmployees(data.employees)
    } catch (err: any) {
      console.error('[Messaging] Error loading employees:', err)
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }
  
  const loadMessages = () => {
    const allMessages = JSON.parse(localStorage.getItem('system_messages') || '[]')
    const sentByAdmin = allMessages.filter((m: Message) => m.from === 'superadmin' || m.from === 'admin')
      .sort((a: Message, b: Message) => b.timestamp - a.timestamp)
    setMessages(sentByAdmin)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmin || !messageSubject || !messageBody) {
      setError('Please fill in all fields')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setSending(true)
      sendMessage('admin', selectedAdmin, messageSubject, messageBody, messagePriority, messageType)
      
      logActivity('admin', 'MESSAGE_SENT', `Sent ${messageType} message to employee ${selectedAdmin}`, 'success', 'system')
      
      onShowMessage(`Message sent successfully to ${selectedAdmin}`)
      setSelectedAdmin('')
      setMessageSubject('')
      setMessageBody('')
      setMessagePriority('normal')
      setMessageType('general')
      loadMessages()
      onDataChange()
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      setTimeout(() => setError(null), 3000)
    } finally {
      setSending(false)
    }
  }
  
  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId)
      loadMessages()
      onDataChange()
      onShowMessage('Message deleted successfully')
    }
  }
  
  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.to.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || msg.type === filterType
    const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority
    
    return matchesSearch && matchesType && matchesPriority
  })
  
  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage)
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  )
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, filterPriority])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Send Messages to Employees</h3>
          <p className="text-sm text-gray-600">Communicate with employees, request reports, and send notifications</p>
        </div>
      </div>
      
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>Send reports requests, clarifications, or issue notifications to employees</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Employee</label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading employees..." : "Choose employee to message"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.username} value={employee.username}>
                      {employee.name || employee.username} (@{employee.username})
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={sending || loading}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            {filteredMessages.length > 0
              ? `Showing ${((currentPage - 1) * messagesPerPage) + 1}-${Math.min(currentPage * messagesPerPage, filteredMessages.length)} of ${filteredMessages.length} messages`
              : `No messages found (${messages.length} total)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="report_request">Report Request</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Messages List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : paginatedMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                ? 'No messages match your filters. Try adjusting your search.'
                : 'No messages sent yet. Send your first message above.'}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedMessages.map((msg) => (
                  <div key={msg.id} className="border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={
                              msg.priority === 'urgent' ? 'destructive' :
                              msg.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {msg.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {msg.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {msg.read && (
                              <Badge variant="default" className="bg-green-600">Read</Badge>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{msg.subject}</p>
                            <p className="text-xs text-gray-600">To: @{msg.to}</p>
                          </div>
                          {expandedMessage === msg.id ? (
                            <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">
                              {msg.body}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 line-clamp-2">{msg.body}</p>
                          )}
                        </div>
                        <div className="text-right ml-4 flex flex-col gap-2">
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                              className="h-8 px-2 text-xs"
                            >
                              {expandedMessage === msg.id ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(p => Math.max(1, p - 1))
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(page)
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(p => Math.min(totalPages, p + 1))
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
