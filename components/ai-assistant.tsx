"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getNews } from "@/lib/news-store"

const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const MoveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
)

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      type: "assistant",
      content:
        "Hello! I'm the Surigao Memorial Park Assistant. I can help you find information about our lots, pricing, services, and how to purchase. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".chat-header-drag-area")) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart])

  const generateAssistantResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    const news = getNews()

    // Greeting responses
    if (lowerMessage.match(/hello|hi|hey|greetings/)) {
      return "Hello! Welcome to Surigao Memorial Park. I'm here to help you learn about our services and answer any questions. What would you like to know?"
    }

    // News and Updates
    if (lowerMessage.match(/news|update|what's new|latest/)) {
      if (news.length === 0) {
        return "There are no current news updates available."
      }
      const newsText = news
        .slice(0, 3)
        .map((n) => `• ${n.title}: ${n.content}`)
        .join("\n\n")
      return `Here are our latest updates:\n\n${newsText}\n\nWould you like to know more about any specific topic?`
    }

    // Pricing inquiries
    if (lowerMessage.match(/price|cost|how much|pricing|afford/)) {
      return `Our pricing:\n• Lawn Lot: Starting at ₱75,000\n• Garden Lot: Starting at ₱120,000\n• Family State: Starting at ₱500,000\n\nWe offer flexible payment plans and financing options. Would you like to know about payment options?`
    }

    // Services inquiries
    if (lowerMessage.match(/service|offer|include|what do|help|maintenance/)) {
      return `We offer comprehensive services including:\n• Professional perpetual care and maintenance\n• 24/7 security surveillance\n• Beautiful landscaped grounds\n• Legal documentation assistance\n• Flexible payment arrangements\n• Appointment scheduling\n\nCan I help you with anything specific?`
    }

    // Lot type inquiries
    if (lowerMessage.match(/lawn|garden|family|lot type|difference/)) {
      return `We have three lot options:\n\n🟩 Lawn Lot (₱75,000): Standard burial plot, 1m x 2.44m, well-maintained lawn areas\n\n🟩 Garden Lot (₱120,000): Premium 4m x 2.44m space with upright monuments\n\n🟩 Family State (₱500,000): 30 sq.m. estate with private mausoleum for multiple interments\n\nWhich interests you most?`
    }

    // Payment options
    if (lowerMessage.match(/payment|pay|installment|plan|finance/)) {
      return `We offer flexible payment options:\n• Full payment with discount\n• 12-month installment plan\n• 24-month installment plan\n• Bank financing available\n• Online payment processing\n\nWould you like to know more about any payment method?`
    }

    // Purchase process
    if (lowerMessage.match(/buy|purchase|how to buy|apply|register/)) {
      return `Here's how to purchase a lot:\n1. Select your preferred lot type\n2. Click "Purchase Now" to fill in details\n3. Choose your payment method\n4. Complete payment\n5. Receive certificate of ownership\n\nWould you like to start the purchase process now?`
    }

    // Help and guidance
    if (lowerMessage.match(/help|guide|how|where|finding|locate|search/)) {
      return `I can help you with:\n• Finding the right lot for your needs\n• Understanding our services and pricing\n• Information about payment options\n• Booking appointments\n• Answering general questions\n\nWhat would you like assistance with?`
    }

    // Contact information
    if (lowerMessage.match(/contact|phone|address|location|office|reach/)) {
      return `You can reach us at:\n• Customer Service: Available in the main menu\n• Services Tab: View all our offerings\n• Or proceed to make an appointment\n\nIs there anything else I can help you with?`
    }

    // Default response
    return `I understand you're asking about: "${userMessage}"\n\nTo help you better, you can ask me about:\n• Lot prices and types\n• Our services\n• Payment options\n• How to purchase\n• Latest news and updates\n\nWhat would you like to know?`
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const assistantResponse: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: generateAssistantResponse(input),
      }
      setMessages((prev) => [...prev, assistantResponse])
      setIsLoading(false)
    }, 500)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MessageCircleIcon className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card
          ref={cardRef}
          className="fixed w-96 max-w-[calc(100vw-24px)] shadow-2xl z-40 flex flex-col h-[500px]"
          style={{
            bottom: position.y === 0 ? "6rem" : "auto",
            right: position.x === 0 ? "1.5rem" : "auto",
            left: position.x !== 0 ? `${position.x}px` : "auto",
            top: position.y !== 0 ? `${position.y}px` : "auto",
            cursor: isDragging ? "grabbing" : "default",
          }}
          onMouseDown={handleMouseDown}
        >
          <CardHeader className="bg-teal-600 text-white rounded-t-lg chat-header-drag-area cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <MoveIcon className="h-4 w-4 opacity-70" />
                <div>
                  <h3 className="font-semibold">SMPI Assistant</h3>
                  <p className="text-sm opacity-90">Drag to move • Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-teal-700 p-1 rounded transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <span className="inline-flex space-x-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading}
                size="icon"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <AlertCircleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>AI Assistant is here to help guide your visit and answer general questions.</span>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
