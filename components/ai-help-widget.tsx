'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const HelpCircle = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Close = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const Send = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

interface Message {
  id: string
  text: string
  type: 'user' | 'ai'
  timestamp: Date
}

interface HelpWidgetProps {
  portalType: 'admin' | 'client' | 'super-admin'
}

const helpGuides = {
  admin: {
    tips: [
      'Click on "Lots" to add, edit, or manage cemetery plots',
      'Use the "Maps" section to create and edit cemetery maps',
      'View payment information under the "Payments" tab',
      'Check "Clients" to manage lot owners and their information',
      'Generate reports in the "Reports" section for analysis',
    ],
    aiResponses: {
      lots: 'In the Lots section, you can add new plots, edit existing ones, assign owners, and track their status. Click "Add New Lot" to get started.',
      maps: 'The Maps section allows you to create cemetery maps, define lot boundaries, and visualize the layout. Use the editor tools to draw and manage lots.',
      payments: 'Track client payments here. View balances, mark payments as received, and monitor outstanding amounts. Clicking a client shows their payment details.',
      clients: 'Manage all client information including contact details, assigned lots, and payment history. Add new clients or update existing records.',
      reports: 'Generate comprehensive reports for revenue, occupancy, payments, and more. Choose your report type and date range.',
    },
  },
  client: {
    tips: [
      'View your purchased lots in the "My Lots" tab',
      'Check your payment status and history under "Payments"',
      'Use the "Map Viewer" to see your lot on the cemetery map',
      'Book appointments for your lots using the "Book Appointment" button',
      'Submit requests or inquiries through the "Requests" tab',
    ],
    aiResponses: {
      lots: 'Your purchased lots are displayed here with details like size, status, and price. Click "View Details" for more information or "Book Appointment" to schedule a visit.',
      payments: 'This tab shows your payment history and current balance. All information is for viewing only. Contact us for payment arrangements.',
      map: 'The Map Viewer shows all cemetery lots with your owned lots highlighted. Click on any available lot to request an appointment.',
      requests: 'Use this section to submit maintenance requests, book appointments, or make inquiries. Your requests will be reviewed by our team.',
      notifications: 'Important updates about your account, payments, and cemetery announcements appear here.',
    },
  },
  'super-admin': {
    tips: [
      'Create and manage admin accounts under "Admin Management"',
      'Review password reset requests and approve or deny them',
      'Monitor all system activities in the "Activity Logs" tab',
      'Check the "Overview" for quick statistics',
      'All admin actions are tracked for security',
    ],
    aiResponses: {
      admins: 'Create new admin accounts by clicking "Create Admin". Enter the name, username, and password. You can also delete admin accounts here.',
      resets: 'Review pending password reset requests from admins. Approve by setting a new password, or reject the request. All actions are logged.',
      logs: 'All system activities are recorded here including admin creation, deletion, and password changes. Use this for audit purposes.',
      overview: 'Quick view of system stats: total admins, pending resets, and recent activities. This helps you monitor system health.',
    },
  },
}

export function AIHelpWidget({ portalType }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your AI assistant. I can help you navigate the ${portalType === 'admin' ? 'Admin' : portalType === 'client' ? 'Client' : 'Super Admin'} Portal. What would you like help with?`,
      type: 'ai',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      type: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = ''
      const lowerInput = inputValue.toLowerCase()

      const guides = helpGuides[portalType]
      const responses = guides.aiResponses as any

      if (lowerInput.includes('lot') || lowerInput.includes('plot')) {
        aiResponse = responses.lots
      } else if (lowerInput.includes('payment') || lowerInput.includes('bill')) {
        aiResponse = responses.payments
      } else if (lowerInput.includes('map') || lowerInput.includes('viewer')) {
        aiResponse = responses.map || responses.maps
      } else if (lowerInput.includes('client') || lowerInput.includes('admin')) {
        aiResponse = responses.clients || responses.admins
      } else if (lowerInput.includes('report') || lowerInput.includes('reset')) {
        aiResponse = responses.reports || responses.resets
      } else if (lowerInput.includes('request') || lowerInput.includes('appointment')) {
        aiResponse = responses.requests
      } else if (lowerInput.includes('help') || lowerInput.includes('hello')) {
        aiResponse = `I can help you with ${guides.tips.join(', ')}. Just ask me anything!`
      } else {
        aiResponse = 'I can help with various features in this portal. Try asking about lots, payments, maps, or clients!'
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        type: 'ai',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    }, 500)

    setInputValue('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 group"
        title="AI Help Assistant"
        type="button"
      >
        <HelpCircle />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Need Help?
        </span>
      </button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl z-40 flex flex-col bg-white rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <HelpCircle />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-blue-700 rounded transition"
          title="Close"
          type="button"
        >
          <Close />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-3 space-y-2">
        <div className="flex gap-1 flex-wrap">
          {helpGuides[portalType].tips.slice(0, 2).map((tip, i) => (
            <button
              key={i}
              onClick={() => {
                setInputValue(tip)
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
              type="button"
            >
              {tip.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="text-sm"
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            <Send />
          </Button>
        </div>
      </div>
    </Card>
  )
}
