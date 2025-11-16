"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"

interface AppointmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  lot?: any
}

export function AppointmentBookingModal({ isOpen, onClose, lot }: AppointmentBookingModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    purpose: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save appointment to localStorage or send to backend
    const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    appointments.push({
      id: Date.now().toString(),
      lotId: lot?.id,
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("appointments", JSON.stringify(appointments))

    alert("Appointment request submitted successfully!")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Appointment
          </DialogTitle>
          <DialogDescription>{lot ? `Schedule a visit for Lot ${lot.id}` : "Schedule a site visit"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Preferred Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Preferred Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="purpose">Purpose of Visit</Label>
            <select
              id="purpose"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            >
              <option value="">Select purpose</option>
              <option value="lot_viewing">Lot Viewing</option>
              <option value="burial_arrangement">Burial Arrangement</option>
              <option value="maintenance_inquiry">Maintenance Inquiry</option>
              <option value="documentation">Documentation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific requests or questions..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
