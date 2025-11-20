"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface SchedulePaymentFormProps {
  isOpen: boolean
  onClose: () => void
  lot: any
  clientId: string
  onSuccess: () => void
}

export function SchedulePaymentForm({ isOpen, onClose, lot, clientId, onSuccess }: SchedulePaymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: lot?.balance || 0,
    paymentType: "Installment",
    paymentDate: "",
    paymentMethod: "",
    notes: "",
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value)
  }

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData({ ...formData, amount: numValue })
  }

  const handlePaymentTypeChange = (value: string) => {
    setFormData({
      ...formData,
      paymentType: value,
      amount: value === "Full Payment" ? lot.balance : formData.amount,
    })
  }

  const validateForm = () => {
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      })
      return false
    }

    if (formData.amount > lot.balance) {
      toast({
        title: "Amount Exceeds Balance",
        description: `Payment amount cannot exceed your balance of ${formatCurrency(lot.balance)}.`,
        variant: "destructive",
      })
      return false
    }

    if (!formData.paymentDate) {
      toast({
        title: "Payment Date Required",
        description: "Please select when you plan to make this payment.",
        variant: "destructive",
      })
      return false
    }

    const selectedDate = new Date(formData.paymentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast({
        title: "Invalid Date",
        description: "Payment date cannot be in the past.",
        variant: "destructive",
      })
      return false
    }

    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)
    if (selectedDate > maxDate) {
      toast({
        title: "Date Too Far",
        description: "Payment date cannot be more than 6 months in the future.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select how you will make this payment.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch("/api/client-payments/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          lotId: lot.id,
          amount: formData.amount,
          paymentType: formData.paymentType,
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Payment Scheduled Successfully",
          description: `Your payment of ${formatCurrency(formData.amount)} has been scheduled for ${new Date(formData.paymentDate).toLocaleDateString()}.`,
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        toast({
          title: "Failed to Schedule Payment",
          description: data.error || "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling payment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: lot?.balance || 0,
      paymentType: "Installment",
      paymentDate: "",
      paymentMethod: "",
      notes: "",
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  // Get maximum date (6 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 6)
  const maxDateString = maxDate.toISOString().split("T")[0]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Payment</DialogTitle>
          <DialogDescription>
            Schedule when you plan to make your payment. The payment status will be updated by cemetery staff
            once they receive your payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lot Information */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Lot:</span>
              <span className="text-sm font-medium">{lot?.id || lot?.lot_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Current Balance:</span>
              <span className="text-sm font-bold text-orange-600">{formatCurrency(lot?.balance || 0)}</span>
            </div>
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Type *</Label>
            <Select value={formData.paymentType} onValueChange={handlePaymentTypeChange} required>
              <SelectTrigger id="payment-type">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full Payment">Full Payment ({formatCurrency(lot?.balance || 0)})</SelectItem>
                <SelectItem value="Installment">Installment Payment</SelectItem>
                <SelectItem value="Partial Payment">Partial Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Pay *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={lot?.balance || 0}
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={formData.paymentType === "Full Payment"}
              required
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-500">
              {formData.paymentType === "Full Payment"
                ? "Full payment amount"
                : `Maximum: ${formatCurrency(lot?.balance || 0)}`}
            </p>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="payment-date">Payment Date *</Label>
            <Input
              id="payment-date"
              type="date"
              min={today}
              max={maxDateString}
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">When do you plan to make this payment?</p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })} required>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash (Pay at Office)</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="Online Payment">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Information Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This schedules your payment intention. Please ensure you make the actual
              payment on or before the scheduled date. Cemetery staff will update the payment status once they
              receive your payment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Scheduling..." : "Schedule Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
