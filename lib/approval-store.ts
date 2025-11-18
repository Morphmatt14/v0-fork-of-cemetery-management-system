'use client'

export type TransactionType = 'client_create' | 'client_edit' | 'client_delete' | 'lot_assign' | 'burial_add' | 'payment_update' | 'burial_edit' | 'burial_delete'
export type TransactionStatus = 'pending' | 'approved' | 'rejected'

export interface PendingTransaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  payload: any
  employeeId: string
  employeeName: string
  timestamp: number
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: number
}

class ApprovalStore {
  private storageKey = 'pending_transactions'

  createTransaction(type: TransactionType, payload: any, employeeId: string, employeeName: string): string {
    const transactions = this.getAllTransactions()
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newTransaction: PendingTransaction = {
      id: transactionId,
      type,
      status: 'pending',
      payload,
      employeeId,
      employeeName,
      timestamp: Date.now(),
    }
    
    transactions.push(newTransaction)
    localStorage.setItem(this.storageKey, JSON.stringify(transactions))
    return transactionId
  }

  getAllTransactions(): PendingTransaction[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : []
  }

  getPendingTransactions(): PendingTransaction[] {
    return this.getAllTransactions().filter(t => t.status === 'pending')
  }

  approveTransaction(transactionId: string, adminId: string): boolean {
    const transactions = this.getAllTransactions()
    const transaction = transactions.find(t => t.id === transactionId)
    
    if (!transaction) return false
    
    transaction.status = 'approved'
    transaction.approvedBy = adminId
    transaction.approvedAt = Date.now()
    
    localStorage.setItem(this.storageKey, JSON.stringify(transactions))
    return true
  }

  rejectTransaction(transactionId: string, adminId: string, reason?: string): boolean {
    const transactions = this.getAllTransactions()
    const transaction = transactions.find(t => t.id === transactionId)
    
    if (!transaction) return false
    
    transaction.status = 'rejected'
    transaction.rejectionReason = reason
    transaction.approvedBy = adminId
    transaction.approvedAt = Date.now()
    
    localStorage.setItem(this.storageKey, JSON.stringify(transactions))
    return true
  }
}

export const approvalStore = new ApprovalStore()
