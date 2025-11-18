'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { approvalStore, PendingTransaction } from '@/lib/approval-store'
import { activityStore } from '@/lib/activity-store'

export function PendingTransactionsPanel() {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([])
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
    const interval = setInterval(loadTransactions, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadTransactions = () => {
    const pending = approvalStore.getPendingTransactions()
    setTransactions(pending)
  }

  const handleApprove = async (transactionId: string) => {
    setLoading(true)
    const adminId = localStorage.getItem('adminUser') || 'admin'
    approvalStore.approveTransaction(transactionId, adminId)
    activityStore.log(adminId, 'TRANSACTION_APPROVED', `Approved transaction ${transactionId}`, 'approval')
    loadTransactions()
    setLoading(false)
  }

  const handleReject = async (transactionId: string) => {
    setLoading(true)
    const adminId = localStorage.getItem('adminUser') || 'admin'
    approvalStore.rejectTransaction(transactionId, adminId, rejectionReason)
    activityStore.log(adminId, 'TRANSACTION_REJECTED', `Rejected transaction: ${rejectionReason}`, 'approval')
    setRejectionReason('')
    loadTransactions()
    setLoading(false)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'client_create': 'New Client',
      'client_edit': 'Edit Client',
      'client_delete': 'Delete Client',
      'lot_assign': 'Assign Lot',
      'burial_add': 'Add Burial',
      'burial_edit': 'Edit Burial',
      'burial_delete': 'Delete Burial',
      'payment_update': 'Update Payment'
    }
    return labels[type] || type
  }

  const pendingCount = transactions.filter(t => t.status === 'pending').length

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Employee actions awaiting admin approval</CardDescription>
          </div>
          <Badge className="bg-amber-600">{pendingCount}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingCount === 0 ? (
          <Alert>
            <AlertDescription>No pending transactions</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.filter(t => t.status === 'pending').map((txn) => (
              <Card key={txn.id} className="border-l-4 border-l-amber-600">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge>{getTypeLabel(txn.type)}</Badge>
                      <p className="text-sm text-gray-600">By: {txn.employeeName}</p>
                      <p className="text-xs text-gray-500">{new Date(txn.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedTxn === txn.id && (
                    <div className="border-t pt-3 space-y-2">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(txn.payload, null, 2)}
                      </pre>
                      <Textarea
                        placeholder="Rejection reason (if rejecting)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(txn.id)}
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(txn.id)}
                          disabled={loading}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedTxn !== txn.id && (
                    <Button
                      onClick={() => setSelectedTxn(txn.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Review & Action
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
