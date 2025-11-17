'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ALLOWED_PAYMENT_STATUSES = ['Overdue', 'On Payment', 'Paid'] as const
type PaymentStatus = typeof ALLOWED_PAYMENT_STATUSES[number]

interface Payment {
  id: string
  clientName: string
  lotId: string
  totalPrice: number
  amountPaid: number
  status: PaymentStatus
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  'Overdue': 'destructive',
  'On Payment': 'secondary',
  'Paid': 'default',
}

export function PaymentStatusControl() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      clientName: 'Juan Dela Cruz',
      lotId: 'A-123',
      totalPrice: 75000,
      amountPaid: 25000,
      status: 'On Payment',
    },
  ])

  const handleStatusChange = (paymentId: string, newStatus: PaymentStatus) => {
    setPayments(payments.map(p =>
      p.id === paymentId ? { ...p, status: newStatus } : p
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status Management</CardTitle>
        <CardDescription>Update payment statuses across Admin and Client Portals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-medium">{payment.clientName}</p>
                <p className="text-sm text-gray-600">Lot {payment.lotId} • ₱{payment.amountPaid.toLocaleString()} / ₱{payment.totalPrice.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={payment.status} onValueChange={(val) => handleStatusChange(payment.id, val as PaymentStatus)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_PAYMENT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={STATUS_COLORS[payment.status]}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
