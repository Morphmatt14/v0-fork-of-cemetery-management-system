'use client'

import { approvalStore, PendingTransaction } from './approval-store'
import { activityStore } from './activity-store'

// TODO: BACKEND_INTEGRATION - Replace these with real API calls
// TODO: SEND_PENDING_TO_BACKEND(endpoint:/api/transactions/create)
export const mockApi = {
  transactions: {
    createPending: (type: any, payload: any, employeeId: string, employeeName: string): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const id = approvalStore.createTransaction(type, payload, employeeId, employeeName)
          activityStore.log(employeeId, 'TRANSACTION_CREATED', `Created ${type} transaction`, 'transaction', id)
          resolve(id)
        }, 300)
      })
    },
    getPending: (): Promise<PendingTransaction[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(approvalStore.getPendingTransactions())
        }, 200)
      })
    },
    approve: (transactionId: string, adminId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = approvalStore.approveTransaction(transactionId, adminId)
          if (result) {
            activityStore.log(adminId, 'TRANSACTION_APPROVED', `Approved transaction ${transactionId}`, 'transaction', transactionId)
          }
          resolve(result)
        }, 300)
      })
    },
    reject: (transactionId: string, adminId: string, reason?: string): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = approvalStore.rejectTransaction(transactionId, adminId, reason)
          if (result) {
            activityStore.log(adminId, 'TRANSACTION_REJECTED', `Rejected transaction: ${reason || 'No reason provided'}`, 'transaction', transactionId)
          }
          resolve(result)
        }, 300)
      })
    },
  },
}
