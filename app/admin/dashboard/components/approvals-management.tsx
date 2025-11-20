"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import {
  listAllPendingActions,
  reviewPendingAction,
  getApprovalStats,
  formatActionType,
  formatApprovalStatus,
  getTimeElapsed,
  getTimeUntilExpiration
} from "@/lib/api/approvals-api"

interface ApprovalsManagementProps {
  adminId: string
}

export function ApprovalsManagement({ adminId }: ApprovalsManagementProps) {
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load pending actions
  const loadPendingActions = async () => {
    setIsLoading(true)
    try {
      const response = await listAllPendingActions(adminId, {
        status: 'pending',
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: 50
      })

      if (response.success) {
        setPendingActions(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load pending actions",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading pending actions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await getApprovalStats(adminId)
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Initial load
  useEffect(() => {
    if (adminId) {
      loadPendingActions()
      loadStats()
    }
  }, [adminId])

  // Open review dialog
  const openReviewDialog = (action: any) => {
    setSelectedAction(action)
    setReviewNotes("")
    setRejectionReason("")
    setIsReviewDialogOpen(true)
  }

  // Handle approve
  const handleApprove = async () => {
    if (!selectedAction) return

    setIsSubmitting(true)
    try {
      const response = await reviewPendingAction(
        selectedAction.id,
        adminId,
        {
          action: 'approve',
          admin_notes: reviewNotes
        }
      )

      if (response.success) {
        toast({
          title: response.executed ? "Approved & Executed ✅" : "Approved ⚠️",
          description: response.message || "Action has been approved"
        })

        // Refresh list
        loadPendingActions()
        loadStats()
        setIsReviewDialogOpen(false)
      } else {
        toast({
          title: "Approval Failed",
          description: response.error || "Failed to approve action",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!selectedAction || !rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await reviewPendingAction(
        selectedAction.id,
        adminId,
        {
          action: 'reject',
          rejection_reason: rejectionReason,
          admin_notes: reviewNotes
        }
      )

      if (response.success) {
        toast({
          title: "Action Rejected ❌",
          description: "The employee will be notified of the rejection"
        })

        // Refresh list
        loadPendingActions()
        loadStats()
        setIsReviewDialogOpen(false)
      } else {
        toast({
          title: "Rejection Failed",
          description: response.error || "Failed to reject action",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pending_count}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved_today}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.approval_rate.toFixed(1)}% approval rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected_today}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.rejection_rate.toFixed(1)}% rejection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Review Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.avg_approval_time_hours.toFixed(1)}h</div>
              <p className="text-xs text-gray-500 mt-1">Average response time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Actions List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve employee-submitted actions</CardDescription>
            </div>
            <Button onClick={loadPendingActions} disabled={isLoading} variant="outline">
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading pending actions...</div>
          ) : pendingActions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No pending approvals</div>
              <div className="text-sm text-gray-400">All caught up! 🎉</div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {formatActionType(action.action_type)}
                        </Badge>
                        <Badge variant="outline">{action.target_entity}</Badge>
                        {action.priority === 'high' || action.priority === 'urgent' ? (
                          <Badge variant="destructive">{action.priority}</Badge>
                        ) : null}
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Requested by:</span> {action.requested_by.name} (@{action.requested_by.username})
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Submitted:</span> {getTimeElapsed(action.created_at)}
                        </div>
                        {action.expires_at && (
                          <div className="text-sm text-orange-600">
                            <span className="font-medium">Expires:</span> {getTimeUntilExpiration(action.expires_at)}
                          </div>
                        )}
                      </div>

                      {action.notes && (
                        <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200 mb-2">
                          <span className="font-medium">Notes:</span> {action.notes}
                        </div>
                      )}

                      {/* Show change data preview */}
                      <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="font-medium">Changes:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(action.change_data).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-semibold text-gray-900">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button onClick={() => openReviewDialog(action)} size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
            <DialogDescription>
              Carefully review the request details before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedAction && (
            <div className="space-y-4">
              {/* Action Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    {formatActionType(selectedAction.action_type)}
                  </Badge>
                  <Badge variant="outline">{selectedAction.target_entity}</Badge>
                </div>

                <div className="text-sm">
                  <strong>Requested by:</strong> {selectedAction.requested_by.name} (@{selectedAction.requested_by.username})
                </div>
                <div className="text-sm">
                  <strong>Submitted:</strong> {getTimeElapsed(selectedAction.created_at)}
                </div>
                {selectedAction.notes && (
                  <div className="text-sm">
                    <strong>Employee Notes:</strong>
                    <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                      {selectedAction.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Change Data */}
              <div>
                <Label className="text-sm font-medium">Proposed Changes:</Label>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  {Object.entries(selectedAction.change_data).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-700 capitalize min-w-[100px]">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Data (if update) */}
              {selectedAction.previous_data && (
                <div>
                  <Label className="text-sm font-medium">Previous Data:</Label>
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    {Object.entries(selectedAction.previous_data).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-600 capitalize min-w-[100px]">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-gray-700">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison View for Updates */}
              {selectedAction.previous_data && selectedAction.action_type.includes('update') && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Label className="text-sm font-medium text-yellow-900">Changes Summary:</Label>
                  <div className="mt-2 space-y-1">
                    {Object.keys(selectedAction.change_data).map((key) => {
                      const oldValue = selectedAction.previous_data?.[key]
                      const newValue = selectedAction.change_data[key]
                      if (oldValue !== newValue) {
                        return (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>:{' '}
                            <span className="line-through text-red-600">{String(oldValue)}</span>
                            {' → '}
                            <span className="text-green-600 font-semibold">{String(newValue)}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="reviewNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this review..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Rejection Reason */}
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason (Required if rejecting)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  {isSubmitting ? "Processing..." : "Reject"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Processing..." : "Approve & Execute"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
