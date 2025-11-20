"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RequestsTabProps {
  inquiries: any[]
  lots: any[]
  onSubmitRequest: (request: any) => void
}

const MessageSquare = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

export function RequestsTab({ inquiries, lots, onSubmitRequest }: RequestsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    type: "",
    message: "",
    lotId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.type || !formData.message) {
      return
    }
    onSubmitRequest(formData)
    setFormData({ subject: "", type: "", message: "", lotId: "" })
    setShowForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in progress":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Requests & Inquiries</h2>
          <p className="text-gray-600">Submit requests and communicate with cemetery staff</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
            <CardDescription>
              Send a message or request to cemetery administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your request"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Request Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lot Maintenance">Lot Maintenance</SelectItem>
                    <SelectItem value="Document Request">Document Request</SelectItem>
                    <SelectItem value="Payment Inquiry">Payment Inquiry</SelectItem>
                    <SelectItem value="Lot Information">Lot Information</SelectItem>
                    <SelectItem value="Appointment Request">Appointment Request</SelectItem>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lotId">Related Lot (Optional)</Label>
                <Select
                  value={formData.lotId}
                  onValueChange={(value) => setFormData({ ...formData, lotId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a lot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {lots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        Lot {lot.id} - {lot.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide details about your request..."
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No Requests Yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  You haven&apos;t submitted any requests or inquiries
                </p>
                <Button onClick={() => setShowForm(true)}>Submit Your First Request</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{inquiry.subject}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Submitted on {new Date(inquiry.createdAt).toLocaleDateString()} •{" "}
                      {inquiry.type || "General Inquiry"}
                      {inquiry.lotId && ` • Lot ${inquiry.lotId}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Message:</p>
                  <p className="text-sm text-gray-600">{inquiry.message}</p>
                </div>

                {/* Responses */}
                {inquiry.responses && inquiry.responses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Staff Responses:</p>
                    {inquiry.responses.map((response: any, index: number) => (
                      <div
                        key={index}
                        className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium text-blue-900">
                            {response.respondent || "Cemetery Staff"}
                          </p>
                          <p className="text-xs text-blue-600">
                            {new Date(response.date).toLocaleDateString()} {response.time}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Info */}
                {inquiry.status === "In Progress" && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Staff is reviewing your request</span>
                  </div>
                )}

                {inquiry.status === "Resolved" && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>This request has been resolved</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Request Information</h4>
              <p className="text-sm text-blue-800 mb-2">
                Submit requests for lot maintenance, document requests, payment inquiries, and general
                questions. Cemetery staff will respond to your requests and you&apos;ll be notified of any
                updates.
              </p>
              <p className="text-xs text-blue-700">
                <strong>Response Time:</strong> Most requests are answered within 24-48 hours during
                business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
