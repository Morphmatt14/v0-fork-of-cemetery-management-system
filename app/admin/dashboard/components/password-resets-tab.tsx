'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { approvePasswordReset, rejectPasswordReset } from '@/lib/activity-logger'
import type { PasswordResetRequest } from '@/lib/activity-logger'
import { Loader2, Search, Filter, CheckCircle2, XCircle, Clock, Eye, EyeOff, AlertTriangle } from 'lucide-react'

interface PasswordResetsTabProps {
  passwordResetRequests: PasswordResetRequest[]
  onDataChange: () => void
  onShowMessage: (message: string) => void
}

export default function PasswordResetsTab({ passwordResetRequests, onDataChange, onShowMessage }: PasswordResetsTabProps) {
  const [resetPassword, setResetPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestsPerPage = 5

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleApprovePasswordReset = async (requestId: string) => {
    setError(null)
    
    if (!resetPassword) {
      setError('Please enter a new password')
      setTimeout(() => setError(null), 3000)
      return
    }

    const validationError = validatePassword(resetPassword)
    if (validationError) {
      setError(validationError)
      setTimeout(() => setError(null), 4000)
      return
    }

    if (resetPassword !== confirmPassword) {
      setError('Passwords do not match')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setProcessing(true)
      const superAdminUser = localStorage.getItem('currentUser')
      const username = superAdminUser ? JSON.parse(superAdminUser).username : 'admin'
      
      const success = approvePasswordReset(requestId, resetPassword, username)
      
      if (success) {
        onShowMessage('Password reset approved and updated successfully')
        setResetPassword('')
        setConfirmPassword('')
        setSelectedRequestId('')
        setShowPassword(false)
        onDataChange()
      } else {
        setError('Failed to approve password reset')
        setTimeout(() => setError(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setTimeout(() => setError(null), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectPasswordReset = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this password reset request?')) {
      return
    }

    try {
      setProcessing(true)
      const superAdminUser = localStorage.getItem('currentUser')
      const username = superAdminUser ? JSON.parse(superAdminUser).username : 'admin'
      
      const success = rejectPasswordReset(requestId, username)
      
      if (success) {
        onShowMessage('Password reset request rejected')
        setResetPassword('')
        setConfirmPassword('')
        setSelectedRequestId('')
        onDataChange()
      } else {
        setError('Failed to reject password reset')
        setTimeout(() => setError(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setTimeout(() => setError(null), 3000)
    } finally {
      setProcessing(false)
    }
  }

  // Filter requests
  const filteredRequests = passwordResetRequests.filter((request) => {
    const matchesSearch = request.adminUsername.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: passwordResetRequests.length,
    pending: passwordResetRequests.filter(r => r.status === 'pending').length,
    approved: passwordResetRequests.filter(r => r.status === 'approved').length,
    rejected: passwordResetRequests.filter(r => r.status === 'rejected').length,
  }

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' }
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-600' }
    if (password.length < 10 && /[a-z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'Medium', color: 'text-yellow-600' }
    }
    if (password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'Strong', color: 'text-green-600' }
    }
    return { strength: 'Medium', color: 'text-yellow-600' }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Password Reset Requests</h3>
          <p className="text-sm text-gray-600">Manage employee password reset requests</p>
        </div>
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Pending
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length > 0
              ? `Showing ${((currentPage - 1) * requestsPerPage) + 1}-${Math.min(currentPage * requestsPerPage, filteredRequests.length)} of ${filteredRequests.length} requests`
              : `No requests found (${passwordResetRequests.length} total)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests */}
          {paginatedRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || filterStatus !== 'all'
                ? 'No requests match your filters.'
                : 'No password reset requests at this time'}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedRequests.map((request) => (
                  <Card key={request.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">@{request.adminUsername}</p>
                              <Badge variant={
                                request.status === 'pending' ? 'default' :
                                request.status === 'approved' ? 'default' :
                                'destructive'
                              } className={
                                request.status === 'pending' ? 'bg-yellow-600' :
                                request.status === 'approved' ? 'bg-green-600' :
                                'bg-red-600'
                              }>
                                {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {request.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                {request.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Requested: {new Date(request.requestedAt).toLocaleString()}
                            </p>
                            {request.resolvedBy && (
                              <p className="text-xs text-gray-500">
                                Resolved by: {request.resolvedBy}
                              </p>
                            )}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="space-y-3 border-t pt-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">New Password</label>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter new password (min. 6 characters)"
                                  value={selectedRequestId === request.id ? resetPassword : ''}
                                  onChange={(e) => {
                                    setSelectedRequestId(request.id)
                                    setResetPassword(e.target.value)
                                  }}
                                  disabled={processing}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              {selectedRequestId === request.id && resetPassword && (
                                <p className={`text-xs font-medium ${getPasswordStrength(resetPassword).color}`}>
                                  Strength: {getPasswordStrength(resetPassword).strength}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Confirm Password</label>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={selectedRequestId === request.id ? confirmPassword : ''}
                                onChange={(e) => {
                                  setSelectedRequestId(request.id)
                                  setConfirmPassword(e.target.value)
                                }}
                                disabled={processing}
                              />
                              {selectedRequestId === request.id && confirmPassword && (
                                <p className={`text-xs ${resetPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                  {resetPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprovePasswordReset(request.id)}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                disabled={processing || selectedRequestId !== request.id || !resetPassword || !confirmPassword}
                              >
                                {processing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve & Reset
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleRejectPasswordReset(request.id)}
                                className="bg-red-600 hover:bg-red-700 flex-1"
                                disabled={processing}
                              >
                                {processing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
