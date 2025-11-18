"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { mapStore } from "@/lib/map-store"
const MapPin = () => (
  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Users = () => (
  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20h-2.117A6.985 6.985 0 0123 17v-2a6 6 0 00-9-5.592M5 20H3v-2a6 6 0 019-5.592"
    />
  </svg>
)

const DollarSign = () => (
  <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const MessageSquare = () => (
  <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const Eye = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const LogOut = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const ArrowLeft = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const Search = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const Plus = () => (
  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Edit = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a11.062 11.062 0 01-3.594.707l-1.582-.934a1 1 0 00-1.17.274l-1.17.174a1 1 0 00-.707.707l-.427 1.582a1 1 0 00.274 1.17l1.17.174a1 1 0 00.707.707l1.582.934a11.062 11.062 0 013.594-.707L19.036 7.036a2.5 2.5 0 00-3.536-3.536m-10 5.036a2.5 2.5 0 00-3.536 3.536L13.964 21.036a11.062 11.062 0 013.594.707l1.582.934a1 1 0 001.17-.274l1.17-.174a1 1 0 00.707-.707l.934-1.582a1 1 0 00-.274-1.17l-.174-1.17a1 1 0 00-.707-.707l-1.582-.934A11.062 11.062 0 0113.964 12z"
    />
  </svg>
)

const Trash2 = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12H5.067L4 7m2 0h12m-3 0a3 3 0 00-6 0m0 0H7m12 0a3 3 0 013 3v3a3 3 0 01-3 3H3a3 3 0 01-3-3v-3a3 3 0 013-3h12z"
    />
  </svg>
)

const Calendar = () => (
  <svg className="h-10 w-10 mb-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M4 21h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const FileText = () => (
  <svg className="h-10 w-10 mb-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m3-7v3a2 2 0 002 2h3m-3 3H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2H9z"
    />
  </svg>
)

const BarChart3 = () => (
  <svg className="h-10 w-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h18M3 17h18M3 21h18M4 7h18M7 14V3" />
  </svg>
)

const Send = () => (
  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-6l-9-6l-9 6 9 6z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.4 6.824L12 11.395l6.6-4.571C17.654 6.749 15.98 6 14 6h-4c-1.98 0-3.654.749-4.6 1.824z"
    />
  </svg>
)

const CheckCircle = () => (
  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Clock = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AlertCircle = () => (
  <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Filter = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h16M4 8h16m-4 4h12m-8 4h8m-12 4h16" />
  </svg>
)

const ChevronDown = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const Download = () => (
  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.886-5.987l1.258-1.257a2 2 0 00.642-1.303L8 7a4 4 0 018.028-.642l1.258 1.257a4 4 0 011.172 4.657"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01.886 5.987l-1.258 1.257a2 2 0 00-.642 1.303L8 17a4 4 0 01-8.028.642l-1.258-1.257a4 4 0 01-1.257-2.83z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.303V17M12 7v3.303m0-7v12.762" />
  </svg>
)

const Loader2 = () => (
  <svg className="h-4 w-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 2v1m0 18v1M4.93 4.93l.707.707m12.728 12.728.707.707M21 12h-1M3 12h-1M12 4.93v.707M17.07 17.07l-.707.707M12 21v-1M4.93 19.07l.707-.707" />
    <path d="M12 18c2.968 0 5.705-1.234 7.727-3.348-.168.022-.34.032-.517.04C14.284 14.855 12.171 15 10.005 15c-2.176 0-4.289-.049-6.404-.154-.177-.008-.35-.018-.517-.04C6.295 16.765 9.032 18 12 18z" />
  </svg>
)

import { AIHelpWidget } from '@/components/ai-help-widget'

// Import Mail and Phone components
import { Mail, Phone } from 'lucide-react'
import MapManager from "@/components/map-manager"
import LotOwnerSelector from "@/components/lot-owner-selector"

// Original lucide-react imports (commented out)
// import {
//   Users,
//   MapPin,
//   DollarSign,
//   MessageSquare,
//   Search,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   LogOut,
//   Calendar,
//   FileText,
//   BarChart3,
//   ArrowLeft,
//   Send,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Phone,
//   Mail,
//   User,
//   Loader2,
//   Filter,
//   ChevronDown,
//   Download,
// } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import * as XLSX from "xlsx"
import { NewsManager } from "@/components/news-manager"
// import MapManager from "@/components/map-manager" // Already imported above

// Import for messaging and activity logging
import { AdminNotificationBadge } from '@/components/admin-notification-badge'
import { getMessagesForUser, markMessageAsRead, sendMessage } from '@/lib/messaging-store'
import type { Message } from '@/lib/messaging-store'
import { logActivity } from '@/lib/activity-logger'

// Global state management (in a real app, this would be Redux, Zustand, or Context API)
// Moved to useEffect to ensure client-side execution
// let globalData = { ... }

// Helper function to save data to localStorage
const saveToLocalStorage = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("globalData", JSON.stringify(data))
  }
}

// Helper function to load data from localStorage (used in useEffect)
const loadFromLocalStorage = (): any => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("globalData")
    if (saved) {
      try {
        return JSON.JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse stored data:", e)
        return null
      }
    }
  }
  return null
}

const formatCurrency = (value: number | null | undefined): string => {
  return value != null ? value.toLocaleString() : '0'
}

// Default data for initial state
const defaultDashboardData = {
  stats: {
    totalLots: 2500,
    occupiedLots: 1847,
    availableLots: 653,
    totalClients: 1200,
    monthlyRevenue: 450000,
    pendingInquiries: 12,
    overduePayments: 8,
  },
  recentBurials: [
    {
      id: 1,
      name: "Juan Santos",
      date: "2024-01-15",
      lot: "A-123",
      family: "Santos Family",
      age: 78,
      cause: "Natural causes",
      funeral: "St. Mary's Church",
      burial: "10:00 AM",
      attendees: 45,
      notes: "Peaceful ceremony with family and friends",
    },
    {
      id: 2,
      name: "Maria Cruz",
      date: "2024-01-18",
      lot: "B-456",
      family: "Cruz Family",
      age: 65,
      cause: "Heart failure",
      funeral: "Sacred Heart Chapel",
      burial: "2:00 PM",
      attendees: 32,
      notes: "Memorial service held prior to burial",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      date: "2024-01-20",
      lot: "C-789",
      family: "Reyes Family",
      age: 82,
      cause: "Old age",
      funeral: "Family residence",
      burial: "9:00 AM",
      attendees: 28,
      notes: "Traditional Filipino burial customs observed",
    },
  ],
  pendingInquiries: [
    {
      id: 1,
      name: "Ana Garcia",
      email: "ana@email.com",
      phone: "09123456789",
      type: "Lot Availability",
      date: "2024-01-20",
      time: "10:30 AM",
      status: "New",
      message:
        "I'm interested in purchasing a family lot in the Garden of Peace section. Could you please provide information about available lots and pricing? I would also like to know about payment plans and maintenance fees. My family is looking for a peaceful location with good accessibility for elderly visitors.",
      priority: "high",
      source: "Website Contact Form",
      preferredContact: "Email",
      budget: "₱150,000 - ₱200,000",
      timeline: "Within 2 months",
      responses: [],
      assignedTo: "Admin",
      tags: ["lot-inquiry", "family-lot", "garden-of-peace"],
      followUpDate: "2024-01-22",
    },
    {
      id: 2,
      name: "Carlos Lopez",
      email: "carlos@email.com",
      phone: "09987654321",
      type: "Payment Plans",
      date: "2024-01-19",
      time: "2:15 PM",
      status: "In Progress",
      message:
        "I would like to know about installment payment options for lot B-234. What are the available payment terms? Can I pay monthly or quarterly? Also, are there any additional fees for installment plans? I'm currently employed and can provide proof of income if needed.",
      priority: "normal",
      source: "Phone Call",
      preferredContact: "Phone",
      budget: "₱5,000 - ₱10,000 monthly",
      timeline: "Immediate",
      responses: [
        {
          id: 1,
          date: "2024-01-19",
          time: "4:30 PM",
          respondent: "Admin",
          message:
            "Thank you for your inquiry. We offer flexible payment plans including monthly and quarterly options. I'll send you detailed information via email.",
          method: "Email",
        },
      ],
      assignedTo: "Admin",
      tags: ["payment-plan", "installment", "lot-b234"],
      followUpDate: "2024-01-21",
    },
    {
      id: 3,
      name: "Rosa Martinez",
      email: "rosa@email.com",
      phone: "09555666777",
      type: "Maintenance",
      date: "2024-01-18",
      time: "9:45 AM",
      status: "New",
      message:
        "The landscaping around lot D-567 needs attention. Some plants are overgrown and the pathway needs cleaning. There are also some weeds growing around the headstone. Could someone please schedule maintenance for this area? This is for my late husband's grave and I visit regularly.",
      priority: "low",
      source: "In-Person Visit",
      preferredContact: "Phone",
      budget: "N/A",
      timeline: "Within 1 week",
      responses: [],
      assignedTo: "Maintenance Team",
      tags: ["maintenance", "landscaping", "lot-d567"],
      followUpDate: "2024-01-20",
    },
    {
      id: 4,
      name: "Miguel Santos",
      email: "miguel@email.com",
      phone: "09444555666",
      type: "Documentation",
      date: "2024-01-17",
      time: "11:20 AM",
      status: "Resolved",
      message:
        "I need a copy of the burial certificate for my mother, Maria Santos, who was buried in lot A-002 last month. This is for insurance purposes. Can you please provide this document?",
      priority: "normal",
      source: "Email",
      preferredContact: "Email",
      budget: "N/A",
      timeline: "ASAP",
      responses: [
        {
          id: 1,
          date: "2024-01-17",
          time: "2:00 PM",
          respondent: "Admin",
          message: "I've located your mother's burial certificate. I'll email you a certified copy within 24 hours.",
          method: "Email",
        },
        {
          id: 2,
          date: "2024-01-18",
          time: "9:00 AM",
          respondent: "Admin",
          message: "Burial certificate has been sent to your email address. Please confirm receipt.",
          method: "Email",
        },
      ],
      assignedTo: "Admin",
      tags: ["documentation", "burial-certificate", "insurance"],
      followUpDate: null,
      resolvedDate: "2024-01-18",
      resolvedBy: "Admin",
    },
    {
      id: 5,
      name: "Elena Rodriguez",
      email: "elena@email.com",
      phone: "09777888999",
      type: "General Information",
      date: "2024-01-16",
      time: "3:30 PM",
      status: "New",
      message:
        "What are your visiting hours? Are there any restrictions on bringing flowers or decorations? Also, do you have any upcoming memorial events or services that families can participate in?",
      priority: "low",
      source: "Website Chat",
      preferredContact: "Email",
      budget: "N/A",
      timeline: "No rush",
      responses: [],
      assignedTo: "Customer Service",
      tags: ["general-info", "visiting-hours", "memorial-events"],
      followUpDate: "2024-01-19",
    },
  ],
  lots: [
    {
      id: "A-001",
      section: "Garden of Peace",
      type: "Standard",
      status: "Available",
      price: 75000,
      dimensions: "2m x 1m",
      features: "Concrete headstone, garden border",
      description: "Beautiful standard lot with garden view",
      dateAdded: "2023-06-15",
    },
    {
      id: "A-002",
      section: "Garden of Peace",
      type: "Standard",
      status: "Occupied",
      price: 75000,
      occupant: "Juan Santos",
      owner: "Maria Santos",
      dimensions: "2m x 1m",
      features: "Concrete headstone, garden border, memorial plaque",
      description: "Standard lot with peaceful garden setting",
      dateAdded: "2023-06-15",
      dateOccupied: "2024-01-15",
    },
    {
      id: "B-001",
      section: "Garden of Serenity",
      type: "Premium",
      status: "Reserved",
      price: 120000,
      owner: "Carlos Mendez",
      dimensions: "3m x 2m",
      features: "Marble headstone, landscaped garden, bench",
      description: "Premium lot with enhanced features and larger space",
      dateAdded: "2023-07-20",
      dateReserved: "2024-01-10",
    },
    {
      id: "C-001",
      section: "Garden of Tranquility",
      type: "Family",
      status: "Available",
      price: 200000,
      dimensions: "4m x 3m",
      features: "Family monument, landscaped area, multiple burial spaces",
      description: "Spacious family lot accommodating multiple burials",
      dateAdded: "2023-08-05",
    },
    {
      id: "D-001",
      section: "Memorial Gardens",
      type: "Standard",
      status: "Available",
      price: 80000,
      dimensions: "2m x 1m",
      features: "Granite headstone, flower bed",
      description: "Standard lot in memorial gardens section",
      dateAdded: "2023-09-10",
    },
    {
      id: "E-001",
      section: "Garden of Peace",
      type: "Premium",
      status: "Maintenance",
      price: 150000,
      dimensions: "3m x 2m",
      features: "Premium headstone, landscaping, memorial bench",
      description: "Premium lot currently under maintenance",
      dateAdded: "2023-05-20",
    },
  ],
  clients: [
    {
      id: 1,
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "09123456789",
      address: "123 Main St, Surigao City",
      lots: ["A-002"],
      balance: 0,
      status: "Active",
      joinDate: "2023-06-20",
      emergencyContact: "Juan Santos Jr.",
      emergencyPhone: "09111222333",
      notes: "Preferred contact via phone. Widow of Juan Santos.",
      paymentHistory: [{ date: "2023-06-20", amount: 75000, type: "Full Payment", status: "Completed" }],
    },
    {
      id: 2,
      name: "Carlos Mendez",
      email: "carlos@email.com",
      phone: "09987654321",
      address: "456 Oak Ave, Surigao City",
      lots: ["B-001"],
      balance: 45000,
      status: "Active",
      joinDate: "2024-01-10",
      emergencyContact: "Elena Mendez",
      emergencyPhone: "09444555666",
      notes: "Prefers email communication. On installment plan.",
      paymentHistory: [{ date: "2024-01-10", amount: 75000, type: "Down Payment", status: "Completed" }],
    },
    {
      id: 3,
      name: "Ana Rodriguez",
      email: "ana@email.com",
      phone: "09555666777",
      address: "789 Pine St, Surigao City",
      lots: ["C-003"],
      balance: 15000,
      status: "Active",
      joinDate: "2023-12-15",
      emergencyContact: "Miguel Rodriguez",
      emergencyPhone: "09777888999",
      notes: "Regular client. Prefers monthly installments.",
      paymentHistory: [
        { date: "2023-12-15", amount: 100000, type: "Down Payment", status: "Completed" },
        { date: "2024-01-15", amount: 85000, type: "Installment", status: "Completed" },
      ],
    },
    {
      id: 4,
      name: "Roberto Cruz",
      email: "roberto@email.com",
      phone: "09888999000",
      address: "321 Elm St, Surigao City",
      lots: ["D-001"],
      balance: 25000,
      status: "Active",
      joinDate: "2023-11-05",
      emergencyContact: "Carmen Cruz",
      emergencyPhone: "09777666555",
      notes: "Businessman. Prefers bank transfers.",
      paymentHistory: [{ date: "2023-11-05", amount: 55000, type: "Down Payment", status: "Completed" }],
    },
    {
      id: 5,
      name: "Luz Fernandez",
      email: "luz@email.com",
      phone: "09666777888",
      address: "654 Maple Ave, Surigao City",
      lots: ["E-001"],
      balance: 0,
      status: "Inactive",
      joinDate: "2023-08-12",
      emergencyContact: "Pedro Fernandez",
      emergencyPhone: "09555444333",
      notes: "Account suspended due to non-payment.",
      paymentHistory: [{ date: "2023-08-12", amount: 50000, type: "Partial Payment", status: "Pending" }],
    },
  ],
  payments: [
    {
      id: 1,
      client: "Maria Santos",
      date: "2023-06-20",
      amount: 75000,
      type: "Full Payment",
      status: "Completed",
      method: "Bank Transfer",
      reference: "BT-20230620-001",
      lot: "A-002",
    },
    {
      id: 2,
      client: "Carlos Mendez",
      date: "2024-01-10",
      amount: 75000,
      type: "Down Payment",
      status: "Completed",
      method: "Credit Card",
      reference: "CC-20240110-002",
      lot: "B-001",
    },
    {
      id: 3,
      client: "Ana Rodriguez",
      date: "2023-12-15",
      amount: 100000,
      type: "Down Payment",
      status: "Completed",
      method: "Cash",
      reference: "CA-20231215-003",
      lot: "C-003",
    },
    {
      id: 4,
      client: "Ana Rodriguez",
      date: "2024-01-15",
      amount: 85000,
      type: "Installment",
      status: "Completed",
      method: "Bank Transfer",
      reference: "BT-20240115-004",
      lot: "C-003",
    },
    {
      id: 5,
      client: "Carlos Mendez",
      date: "2024-02-10",
      amount: 15000,
      type: "Installment",
      status: "Pending",
      method: "Online Banking",
      reference: "OB-20240210-005",
      lot: "B-001",
    },
    {
      id: 6,
      client: "Roberto Cruz",
      date: "2023-11-05",
      amount: 55000,
      type: "Down Payment",
      status: "Completed",
      method: "Bank Transfer",
      reference: "BT-20231105-006",
      lot: "D-001",
    },
    {
      id: 7,
      client: "Luz Fernandez",
      date: "2023-08-12",
      amount: 50000,
      type: "Partial Payment",
      status: "Pending",
      method: "Cash",
      reference: "CA-20230812-007",
      lot: "E-001",
    },
  ],
  burials: [
    {
      id: 1,
      name: "Juan Santos",
      date: "2024-01-15",
      lot: "A-123",
      family: "Santos Family",
      age: 78,
      cause: "Natural causes",
      funeral: "St. Mary's Church",
      burial: "10:00 AM",
      attendees: 45,
      notes: "Peaceful ceremony with family and friends",
    },
    {
      id: 2,
      name: "Maria Cruz",
      date: "2024-01-18",
      lot: "B-456",
      family: "Cruz Family",
      age: 65,
      cause: "Heart failure",
      funeral: "Sacred Heart Chapel",
      burial: "2:00 PM",
      attendees: 32,
      notes: "Memorial service held prior to burial",
    },
    {
      id: 3,
      name: "Pedro Reyes",
      date: "2024-01-20",
      lot: "C-789",
      family: "Reyes Family",
      age: 82,
      cause: "Old age",
      funeral: "Family residence",
      burial: "9:00 AM",
      attendees: 28,
      notes: "Traditional Filipino burial customs observed",
    },
    {
      id: 4,
      name: "Lucia Fernandez",
      date: "2024-01-22",
      lot: "D-234",
      family: "Fernandez Family",
      age: 71,
      cause: "Stroke",
      funeral: "City Cathedral",
      burial: "3:00 PM",
      attendees: 52,
      notes: "Large family gathering with extended relatives",
    },
    {
      id: 5,
      name: "Antonio Gonzales",
      date: "2024-01-25",
      lot: "A-345",
      family: "Gonzales Family",
      age: 68,
      cause: "Cancer",
      funeral: "Memorial Chapel",
      burial: "11:00 AM",
      attendees: 40,
      notes: "Military honors provided for the veteran",
    },
  ],
}


export default function AdminDashboard() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [burials, setBurials] = useState<any[]>([])

  // UI States
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("")
  const [inquirySearchTerm, setInquirySearchTerm] = useState("")
  const [isAddLotOpen, setIsAddLotOpen] = useState(false)
  const [isEditLotOpen, setIsEditLotOpen] = useState(false)
  const [isViewLotOpen, setIsViewLotOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [isViewClientOpen, setIsViewClientOpen] = useState(false)
  const [isViewBurialOpen, setIsViewBurialOpen] = useState(false)
  const [isReplyInquiryOpen, setIsReplyInquiryOpen] = useState(false)
  const [isViewInquiryOpen, setIsViewInquiryOpen] = useState(false)
  const [isMessageClientOpen, setIsMessageClientOpen] = useState(false)
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false)
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportType, setReportType] = useState<string>("")
  const [reportPeriod, setReportPeriod] = useState<string>("monthly")
  const [reportData, setReportData] = useState<any>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")

  // Form Data States
  const [lotFormData, setLotFormData] = useState({
    id: "",
    section: "",
    type: "",
    status: "",
    price: "",
    description: "",
    dimensions: "",
    features: "",
    mapId: null, // To store the associated map ID if available
  })
  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  })
  const [replyFormData, setReplyFormData] = useState({
    subject: "",
    message: "",
    priority: "normal",
    sendCopy: false,
    followUpDate: "",
  })
  const [messageFormData, setMessageFormData] = useState({
    subject: "",
    message: "",
    type: "general",
  })

  // Selected Item States
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [selectedBurial, setSelectedBurial] = useState<any>(null)

  // Load messages from store
  const loadMessages = async () => {
    const adminUsername = localStorage.getItem('adminUser') || 'admin'
    const fetchedMessages = await getMessagesForUser(adminUsername);
    setMessages(fetchedMessages)
  }


  // CHANGE Add authentication check at the top of the component
  useEffect(() => {
    const employeeSession = localStorage.getItem('employeeSession')
    const employeeUser = localStorage.getItem('employeeUser')
    const currentUser = localStorage.getItem('currentUser')
    
    console.log("[v0] Checking employee authentication...")
    console.log("[v0] employeeSession:", employeeSession)
    console.log("[v0] employeeUser:", employeeUser)
    console.log("[v0] currentUser:", currentUser)
    
    if (!employeeSession && !employeeUser && !currentUser) {
      console.log("[v0] No employee session found, redirecting to login")
      router.push('/admin/login')
      return
    }
    
    // Verify it's actually an employee role
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user.role !== 'employee') {
          console.log("[v0] User is not employee role, redirecting")
          router.push('/admin/login')
          return
        }
      } catch (e) {
        console.error("[v0] Error parsing currentUser:", e)
      }
    }
    
    console.log("[v0] Employee authenticated, continuing to dashboard")
  }, [router])

  // Initialize dashboard data from localStorage only on client side
  useEffect(() => {
    setIsMounted(true)
    
    // Load initial data from localStorage
    const loadedData = loadFromLocalStorage()
    if (loadedData) {
      setDashboardData(loadedData)
      setInquiries(loadedData?.pendingInquiries || [])
      setLots(loadedData?.lots || [])
      setClients(loadedData?.clients || [])
      setPayments(loadedData?.payments || [])
      setBurials(loadedData?.burials || [])
    } else {
      // Use default data if nothing is found in localStorage
      setDashboardData(defaultDashboardData)
      setInquiries(defaultDashboardData.pendingInquiries || [])
      setLots(defaultDashboardData.lots || [])
      setClients(defaultDashboardData.clients || [])
      setPayments(defaultDashboardData.payments || [])
      setBurials(defaultDashboardData.burials || [])
      saveToLocalStorage(defaultDashboardData) // Save default data for future use
    }
    
    setIsLoading(false)
  }, []) // Empty dependency array - runs only once on mount

  useEffect(() => {
    if (dashboardData) {
      setInquiries(dashboardData?.pendingInquiries || [])
      setLots(dashboardData?.lots || [])
      setClients(dashboardData?.clients || [])
      setPayments(dashboardData?.payments || [])
      setBurials(dashboardData?.burials || [])
    }
  }, [dashboardData])

  useEffect(() => {
    loadMessages()
    
    // Auto-reload messages every 10 seconds
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, []) // Empty dependency array - runs only once and sets up interval

  if (!isMounted || isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleViewMessage = (msg: Message) => {
    setSelectedMessage(msg)
    markMessageAsRead(msg.id)
    loadMessages()
  }

  const handleReplyMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !replyText) return

    const adminUser = localStorage.getItem('adminUser')
    sendMessage(adminUser || 'admin', 'superadmin', `Re: ${selectedMessage.subject}`, replyText, 'normal', 'reply', selectedMessage.id)
    
    logActivity(adminUser || 'admin', 'MESSAGE_REPLY', `Replied to super admin message: ${selectedMessage.subject}`, 'success', 'system')
    
    setReplyText('')
    setSelectedMessage(null)
    toast({ title: 'Reply sent successfully' })
  }

  // Handler functions
  const handleAddLot = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const newLot = {
      id: lotFormData.id,
      section: lotFormData.section,
      type: lotFormData.type,
      status: lotFormData.status,
      price: Number.parseInt(lotFormData.price),
      dimensions: lotFormData.dimensions,
      features: lotFormData.features,
      description: lotFormData.description,
      dateAdded: new Date().toISOString().split("T")[0],
    }

    const updatedData = { ...dashboardData }
    updatedData.lots.push(newLot)
    updatedData.stats.totalLots += 1
    if (newLot.status === "Available") {
      updatedData.stats.availableLots += 1
    } else if (newLot.status === "Occupied") {
      updatedData.stats.occupiedLots += 1
    }

    setDashboardData(updatedData)
    saveToLocalStorage(updatedData)

    toast({
      title: "Lot Added Successfully",
      description: `Lot ${lotFormData.id} has been added to ${lotFormData.section}.`,
    })
    setIsAddLotOpen(false)
    setLotFormData({
      id: "",
      section: "",
      type: "",
      status: "",
      price: "",
      description: "",
      dimensions: "",
      features: "",
      mapId: null,
    })

    const adminUser = localStorage.getItem('adminUser')
    logActivity(
      adminUser || 'admin',
      'LOT_CREATED',
      `Created lot ${lotFormData.id} in section ${lotFormData.section}`,
      'success',
      'lot',
      [lotFormData.id]
    )
  }

  const handleEditLot = () => {
    const lotIndex = dashboardData.lots.findIndex((lot) => lot.id === selectedLot?.id)
    if (lotIndex !== -1) {
      const oldStatus = dashboardData.lots[lotIndex].status
      const newStatus = lotFormData.status

      const updatedData = { ...dashboardData }
      updatedData.lots[lotIndex] = {
        ...updatedData.lots[lotIndex],
        id: lotFormData.id,
        section: lotFormData.section,
        type: lotFormData.type,
        status: lotFormData.status,
        price: Number.parseInt(lotFormData.price),
        dimensions: lotFormData.dimensions,
        features: lotFormData.features,
        description: lotFormData.description,
      }

      // Assuming mapStore is available and has a syncGlobalLotToMap method
      // This part might need adjustment based on how mapStore is implemented
      if (updatedData.lots[lotIndex].mapId && typeof mapStore !== "undefined" && mapStore.syncGlobalLotToMap) {
        mapStore.syncGlobalLotToMap(updatedData.lots[lotIndex])
      }

      // Update stats if status changed
      if (oldStatus !== newStatus) {
        if (oldStatus === "Available") updatedData.stats.availableLots -= 1
        else if (oldStatus === "Occupied") updatedData.stats.occupiedLots -= 1

        if (newStatus === "Available") updatedData.stats.availableLots += 1
        else if (newStatus === "Occupied") updatedData.stats.occupiedLots += 1
      }

      setDashboardData(updatedData)
      saveToLocalStorage(updatedData)
    }

    toast({
      title: "Lot Updated Successfully",
      description: `Lot ${selectedLot?.id} has been updated.`,
    })
    setIsEditLotOpen(false)
  }

  const handleDeleteLot = (lot: any) => {
    const lotIndex = dashboardData.lots.findIndex((l) => l.id === lot.id)
    if (lotIndex !== -1) {
      const deletedLot = dashboardData.lots[lotIndex]
      const updatedData = { ...dashboardData }

      // Assuming mapStore is available and has a deleteLot method
      if (deletedLot.mapId && typeof mapStore !== "undefined" && mapStore.deleteLot) {
        mapStore.deleteLot(deletedLot.mapId, deletedLot.id)
      }

      updatedData.lots.splice(lotIndex, 1)
      updatedData.stats.totalLots -= 1

      if (deletedLot.status === "Available") {
        updatedData.stats.availableLots -= 1
      } else if (deletedLot.status === "Occupied") {
        updatedData.stats.occupiedLots -= 1
      }

      setDashboardData(updatedData)
      saveToLocalStorage(updatedData)
    }

    toast({
      title: "Lot Deleted",
      description: `Lot ${lot.id} has been removed from the system.`,
      variant: "destructive",
    })
  }

  const handleAddClient = () => {
    const newClient = {
      id: dashboardData.clients.length + 1,
      name: clientFormData.name,
      email: clientFormData.email,
      phone: clientFormData.phone,
      address: clientFormData.address,
      lots: [],
      balance: 0,
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      emergencyContact: clientFormData.emergencyContact,
      emergencyPhone: clientFormData.emergencyPhone,
      notes: clientFormData.notes,
      paymentHistory: [],
    }

    const updatedData = { ...dashboardData }
    updatedData.clients.push(newClient)
    updatedData.stats.totalClients += 1
    setDashboardData(updatedData)
    saveToLocalStorage(updatedData)

    toast({
      title: "Client Added Successfully",
      description: `${clientFormData.name} has been added to the system.`,
    })
    setIsAddClientOpen(false)
    setClientFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      notes: "",
    })
  }

  const handleUpdateClient = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clientIndex = dashboardData.clients.findIndex((client) => client.id === selectedClient?.id)
    if (clientIndex !== -1) {
      const updatedData = { ...dashboardData }
      updatedData.clients[clientIndex] = {
        ...updatedData.clients[clientIndex],
        name: clientFormData.name,
        email: clientFormData.email,
        phone: clientFormData.phone,
        address: clientFormData.address,
        emergencyContact: clientFormData.emergencyContact,
        emergencyPhone: clientFormData.emergencyPhone,
        notes: clientFormData.notes,
      }

      setDashboardData(updatedData)
      saveToLocalStorage(updatedData)
    }

    toast({
      title: "Client Updated Successfully",
      description: `${clientFormData.name}'s information has been updated.`,
    })
    setIsEditClientOpen(false)

    const adminUser = localStorage.getItem('adminUser')
    logActivity(
      adminUser || 'admin',
      'CLIENT_UPDATED',
      `Updated client ${selectedClient.name}`,
      'success',
      'client',
      [selectedClient.id]
    )
  }

  const handleReplyInquiry = () => {
    const inquiryIndex = inquiries.findIndex((inquiry) => inquiry.id === selectedInquiry?.id)
    if (inquiryIndex !== -1) {
      const newResponse = {
        id: (inquiries[inquiryIndex].responses?.length || 0) + 1,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        respondent: "Admin",
        message: replyFormData.message,
        method: "Email",
      }

      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        status: "In Progress",
        responses: [...(inquiries[inquiryIndex].responses || []), newResponse],
        followUpDate: replyFormData.followUpDate || null,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq) => inq.id === selectedInquiry?.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
      saveToLocalStorage(updatedGlobalData)
    }

    toast({
      title: "Reply Sent Successfully",
      description: `Your reply has been sent to ${selectedInquiry?.name}.`,
    })
    setIsReplyInquiryOpen(false)
    setReplyFormData({
      subject: "",
      message: "",
      priority: "normal",
      sendCopy: false,
      followUpDate: "",
    })
  }

  const handleMarkResolved = (inquiry: any) => {
    const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        status: "Resolved",
        resolvedDate: new Date().toISOString().split("T")[0],
        resolvedBy: "Admin",
        followUpDate: null,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq) => inq.id === inquiry.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
      saveToLocalStorage(updatedGlobalData)
    }

    toast({
      title: "Inquiry Resolved",
      description: `Inquiry from ${inquiry.name} has been marked as resolved.`,
    })
  }

  const handleReopenInquiry = (inquiry: any) => {
    const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        status: "In Progress",
        resolvedDate: null,
        resolvedBy: null,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq) => inq.id === inquiry.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
      saveToLocalStorage(updatedGlobalData)
    }

    toast({
      title: "Inquiry Reopened",
      description: `Inquiry from ${inquiry.name} has been reopened.`,
    })
  }

  const handleAssignInquiry = (inquiry: any, assignee: string) => {
    const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        assignedTo: assignee,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq) => inq.id === inquiry.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
      saveToLocalStorage(updatedGlobalData)
    }

    toast({
      title: "Inquiry Assigned",
      description: `Inquiry has been assigned to ${assignee}.`,
    })
  }

  const handleUpdatePriority = (inquiry: any, priority: string) => {
    const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        priority: priority,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq) => inq.id === inquiry.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
      saveToLocalStorage(updatedGlobalData)
    }

    toast({
      title: "Priority Updated",
      description: `Inquiry priority has been updated to ${priority}.`,
    })
  }

  const handleSendMessage = () => {
    toast({
      title: "Message Sent Successfully",
      description: `Your message has been sent to ${selectedClient?.name}.`,
    })
    setIsMessageClientOpen(false)
    setMessageFormData({
      subject: "",
      message: "",
      type: "general",
    })
  }

  const handleAssignLotToOwner = (lotId: string, ownerId: string, ownerName: string, ownerEmail: string) => {
    // Find which map this lot belongs to
    const maps = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("cemeteryMaps") || "[]") : []

    let lotFound = false;
    const updatedData = { ...dashboardData };

    for (const map of maps) {
      const lot = map.lots?.find((l: any) => l.id === lotId)
      if (lot) {
        // Update in map store
        // Assuming mapStore is available and has a linkLotToOwner method
        // If mapStore is a context or needs specific import, adjust accordingly.
        // For now, simulating the action.
        // mapStore.linkLotToOwner(map.id, lotId, ownerName, ownerEmail, ownerId)

        // Update global lots system
        const lotIndex = updatedData.lots.findIndex((l) => l.id === lotId)
        if (lotIndex !== -1) {
          updatedData.lots[lotIndex].owner = ownerName
          updatedData.lots[lotIndex].status = "Reserved" // Or "Occupied" depending on business logic
          updatedData.lots[lotIndex].ownerId = ownerId // Store owner ID for future reference
          updatedData.lots[lotIndex].mapId = map.id // Store the map ID
          lotFound = true
          break // Stop searching once the lot is found and updated
        }
      }
    }

    if (lotFound) {
      setDashboardData(updatedData)
      saveToLocalStorage(updatedData)

      toast({
        title: "Lot Assigned Successfully",
        description: `Lot ${lotId} has been assigned to ${ownerName}`,
      })
    } else {
      toast({
        title: "Assignment Failed",
        description: `Could not find lot ${lotId} or map data is unavailable.`,
        variant: "destructive",
      })
    }
  }

  // Generate report data based on report type
  const generateReportData = (reportType: string) => {
    switch (reportType) {
      case "Occupancy Report":
        return {
          title: "Cemetery Occupancy Report",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalLots: dashboardData.stats.totalLots,
            occupiedLots: dashboardData.stats.occupiedLots,
            availableLots: dashboardData.stats.availableLots,
            occupancyRate: ((dashboardData.stats.occupiedLots / dashboardData.stats.totalLots) * 100).toFixed(2) + "%",
          },
          data: dashboardData.lots.map((lot) => ({
            id: lot.id,
            section: lot.section,
            type: lot.type,
            status: lot.status,
            dateAdded: lot.dateAdded,
            dateOccupied: lot.dateOccupied || "N/A",
            owner: lot.owner || "N/A",
            occupant: lot.occupant || "N/A",
          })),
          sections: [
            {
              name: "Garden of Peace",
              total: dashboardData.lots.filter((lot) => lot.section === "Garden of Peace").length,
              occupied: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Peace" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Peace" && lot.status === "Available",
              ).length,
            },
            {
              name: "Garden of Serenity",
              total: dashboardData.lots.filter((lot) => lot.section === "Garden of Serenity").length,
              occupied: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Serenity" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Serenity" && lot.status === "Available",
              ).length,
            },
            {
              name: "Garden of Tranquility",
              total: dashboardData.lots.filter((lot) => lot.section === "Garden of Tranquility").length,
              occupied: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Tranquility" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot) => lot.section === "Garden of Tranquility" && lot.status === "Available",
              ).length,
            },
          ],
        }
      case "Revenue Report":
        return {
          title: "Revenue Report",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalRevenue: formatCurrency(dashboardData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            completedPayments: dashboardData.payments.filter((payment) => payment.status === "Completed").length,
            pendingPayments: dashboardData.payments.filter((payment) => payment.status === "Pending").length,
            averagePayment: formatCurrency(
              dashboardData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) / dashboardData.payments.length || 0
            ),
          },
          data: dashboardData.payments.map((payment) => ({
            id: payment.id,
            client: payment.client,
            date: payment.date,
            amount: formatCurrency(payment.amount),
            type: payment.type,
            status: payment.status,
            method: payment.method,
            reference: payment.reference,
            lot: payment.lot,
          })),
          paymentTypes: [
            {
              type: "Full Payment",
              count: dashboardData.payments.filter((payment) => payment.type === "Full Payment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.type === "Full Payment")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
            {
              type: "Down Payment",
              count: dashboardData.payments.filter((payment) => payment.type === "Down Payment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.type === "Down Payment")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
            {
              type: "Installment",
              count: dashboardData.payments.filter((payment) => payment.type === "Installment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.type === "Installment")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
          ],
        }
      case "Client Report":
        return {
          title: "Client Report",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalClients: dashboardData.clients.length,
            activeClients: dashboardData.clients.filter((client) => client.status === "Active").length,
            inactiveClients: dashboardData.clients.filter((client) => client.status !== "Active").length,
            clientsWithBalance: dashboardData.clients.filter((client) => client.balance > 0).length,
          },
          data: dashboardData.clients.map((client) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            lots: client.lots.join(", "),
            balance: formatCurrency(client.balance),
            status: client.status,
            joinDate: client.joinDate,
          })),
        }
      case "Burial Schedule":
        return {
          title: "Burial Schedule",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalBurials: dashboardData.burials.length,
            averageAge: Math.round(
              dashboardData.burials.reduce((sum, burial) => sum + burial.age, 0) / dashboardData.burials.length,
            ),
            largestAttendance: Math.max(...dashboardData.burials.map((burial) => burial.attendees)),
          },
          data: dashboardData.burials.map((burial) => ({
            id: burial.id,
            name: burial.name,
            date: burial.date,
            time: burial.burial,
            lot: burial.lot,
            family: burial.family,
            age: burial.age,
            cause: burial.cause,
            funeral: burial.funeral,
            attendees: burial.attendees,
          })),
        }
      case "Payment Report":
        return {
          title: "Payment Report",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalPayments: dashboardData.payments.length,
            completedPayments: dashboardData.payments.filter((payment) => payment.status === "Completed").length,
            pendingPayments: dashboardData.payments.filter((payment) => payment.status === "Pending").length,
            totalAmount: formatCurrency(dashboardData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)),
          },
          data: dashboardData.payments.map((payment) => ({
            id: payment.id,
            client: payment.client,
            date: payment.date,
            amount: formatCurrency(payment.amount),
            type: payment.type,
            status: payment.status,
            method: payment.method,
            reference: payment.reference,
            lot: payment.lot,
          })),
          paymentMethods: [
            {
              method: "Bank Transfer",
              count: dashboardData.payments.filter((payment) => payment.method === "Bank Transfer").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.method === "Bank Transfer")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Credit Card",
              count: dashboardData.payments.filter((payment) => payment.method === "Credit Card").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.method === "Credit Card")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Cash",
              count: dashboardData.payments.filter((payment) => payment.method === "Cash").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.method === "Cash")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Online Banking",
              count: dashboardData.payments.filter((payment) => payment.method === "Online Banking").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment) => payment.method === "Online Banking")
                .reduce((sum, payment) => sum + (payment.amount || 0), 0)),
            },
          ],
        }
      case "Inquiry Report":
        return {
          title: "Inquiry Report",
          date: new Date().toLocaleDateString(),
          period: reportPeriod === "monthly" ? "Monthly" : reportPeriod === "quarterly" ? "Quarterly" : "Annual",
          summary: {
            totalInquiries: inquiries.length,
            newInquiries: inquiries.filter((inquiry) => inquiry.status === "New").length,
            inProgressInquiries: inquiries.filter((inquiry) => inquiry.status === "In Progress").length,
            resolvedInquiries: inquiries.filter((inquiry) => inquiry.status === "Resolved").length,
            highPriorityInquiries: inquiries.filter((inquiry) => inquiry.priority === "high").length,
          },
          data: inquiries.map((inquiry) => ({
            id: inquiry.id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            type: inquiry.type,
            date: inquiry.date,
            status: inquiry.status,
            priority: inquiry.priority,
            assignedTo: inquiry.assignedTo,
            responseCount: inquiry.responses ? inquiry.responses.length : 0,
            resolvedDate: inquiry.resolvedDate || "N/A",
          })),
          inquiryTypes: [
            {
              type: "Lot Availability",
              count: inquiries.filter((inquiry) => inquiry.type === "Lot Availability").length,
              resolved: inquiries.filter(
                (inquiry) => inquiry.type === "Lot Availability" && inquiry.status === "Resolved",
              ).length,
            },
            {
              type: "Payment Plans",
              count: inquiries.filter((inquiry) => inquiry.type === "Payment Plans").length,
              resolved: inquiries.filter((inquiry) => inquiry.type === "Payment Plans" && inquiry.status === "Resolved")
                .length,
            },
            {
              type: "Maintenance",
              count: inquiries.filter((inquiry) => inquiry.type === "Maintenance").length,
              resolved: inquiries.filter((inquiry) => inquiry.type === "Maintenance" && inquiry.status === "Resolved")
                .length,
            },
            {
              type: "Documentation",
              count: inquiries.filter((inquiry) => inquiry.type === "Documentation").length,
              resolved: inquiries.filter((inquiry) => inquiry.type === "Documentation" && inquiry.status === "Resolved")
                .length,
            },
            {
              type: "General Information",
              count: inquiries.filter((inquiry) => inquiry.type === "General Information").length,
              resolved: inquiries.filter(
                (inquiry) => inquiry.type === "General Information" && inquiry.status === "Resolved",
              ).length,
            },
          ],
        }
      default:
        return {
          title: "System Report",
          date: new Date().toLocaleDateString(),
          data: [],
        }
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true)
    setReportType(reportType)

    // Generate report data
    const data = generateReportData(reportType)
    setReportData(data)
    setSelectedReport(data)

    // Simulate report generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsGeneratingReport(false)
    setIsReportPreviewOpen(true)

    toast({
      title: "Report Generated Successfully",
      description: `${reportType} has been generated and is ready for preview and download.`,
    })
  }

  // Export report to Excel
  const exportToExcel = () => {
    if (!selectedReport) return

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()

      // Add summary sheet
      const summaryData = [
        ["Report Title", selectedReport.title],
        ["Date Generated", selectedReport.date],
        ["Report Period", selectedReport.period],
        ["", ""],
        ["Summary", ""],
      ]

      // Add summary data
      Object.entries(selectedReport.summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
        summaryData.push([formattedKey, String(value)])
      })

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

      // Add data sheet
      if (selectedReport.data && selectedReport.data.length > 0) {
        const dataWs = XLSX.utils.json_to_sheet(selectedReport.data)
        XLSX.utils.book_append_sheet(wb, dataWs, "Data")
      }

      // Add additional sheets based on report type
      if (reportType === "Occupancy Report" && selectedReport.sections) {
        const sectionsData = [["Section", "Total Lots", "Occupied Lots", "Available Lots"]]
        selectedReport.sections.forEach((section: any) => {
          sectionsData.push([section.name, section.total, section.occupied, section.available])
        })
        const sectionsWs = XLSX.utils.aoa_to_sheet(sectionsData)
        XLSX.utils.book_append_sheet(wb, sectionsWs, "Sections")
      }

      if (reportType === "Revenue Report" && selectedReport.paymentTypes) {
        const typesData = [["Payment Type", "Count", "Total Amount"]]
        selectedReport.paymentTypes.forEach((type: any) => {
          typesData.push([type.type, type.count, type.total])
        })
        const typesWs = XLSX.utils.aoa_to_sheet(typesData)
        XLSX.utils.book_append_sheet(wb, typesWs, "Payment Types")
      }

      if (reportType === "Payment Report" && selectedReport.paymentMethods) {
        const methodsData = [["Payment Method", "Count", "Total Amount"]]
        selectedReport.paymentMethods.forEach((method: any) => {
          methodsData.push([method.method, method.count, method.total])
        })
        const methodsWs = XLSX.utils.aoa_to_sheet(methodsData)
        XLSX.utils.book_append_sheet(wb, methodsWs, "Payment Methods")
      }

      if (reportType === "Inquiry Report" && selectedReport.inquiryTypes) {
        const typesData = [["Inquiry Type", "Count", "Resolved"]]
        selectedReport.inquiryTypes.forEach((type: any) => {
          typesData.push([type.type, type.count, type.resolved])
        })
        const typesWs = XLSX.utils.aoa_to_sheet(typesData)
        XLSX.utils.book_append_sheet(wb, typesWs, "Inquiry Types")
      }

      // Generate filename
      const fileName = `${selectedReport.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`

      // Create binary string from workbook
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })

      // Create blob and download
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

      // Create download link
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL object
      URL.revokeObjectURL(link.href)

      toast({
        title: "Report Exported Successfully",
        description: `${selectedReport.title} has been exported to Excel.`,
      })
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      toast({
        title: "Export Error",
        description: "There was an error exporting the report to Excel. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Export report to Word (HTML format that can be opened in Word)
  const exportToWord = () => {
    if (!selectedReport) return

    try {
      // Create HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${selectedReport.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2563eb; text-align: center; }
            h2 { color: #1e40af; margin-top: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin: 20px 0; padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #2563eb; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedReport.title}</h1>
            <p>Generated on: ${selectedReport.date} | Period: ${selectedReport.period}</p>
            <p>Surigao Memorial Park Inc.</p>
          </div>
          
          <h2>Summary</h2>
          <div class="summary">
            <table>
              <tbody>
      `

      // Add summary data
      Object.entries(selectedReport.summary).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
        htmlContent += `
          <tr>
            <td><strong>${formattedKey}</strong></td>
            <td>${value}</td>
          </tr>
        `
      })

      htmlContent += `
              </tbody>
            </table>
          </div>
      `

      // Add main data table
      if (selectedReport.data && selectedReport.data.length > 0) {
        htmlContent += `
          <h2>Detailed Data</h2>
          <table>
            <thead>
              <tr>
        `

        // Add table headers
        Object.keys(selectedReport.data[0]).forEach((key) => {
          const formattedHeader = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
          htmlContent += `<th>${formattedHeader}</th>`
        })

        htmlContent += `
              </tr>
            </thead>
            <tbody>
        `

        // Add table rows
        selectedReport.data.forEach((item: any) => {
          htmlContent += `<tr>`
          Object.values(item).forEach((value) => {
            htmlContent += `<td>${value}</td>`
          })
          htmlContent += `</tr>`
        })

        htmlContent += `
            </tbody>
          </table>
        `
      }

      // Add additional sections based on report type
      if (reportType === "Occupancy Report" && selectedReport.sections) {
        htmlContent += `
          <h2>Section Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Total Lots</th>
                <th>Occupied Lots</th>
                <th>Available Lots</th>
              </tr>
            </thead>
            <tbody>
        `

        selectedReport.sections.forEach((section: any) => {
          htmlContent += `
            <tr>
              <td>${section.name}</td>
              <td>${section.total}</td>
              <td>${section.occupied}</td>
              <td>${section.available}</td>
            </tr>
          `
        })

        htmlContent += `
            </tbody>
          </table>
        `
      }

      if (reportType === "Revenue Report" && selectedReport.paymentTypes) {
        htmlContent += `
          <h2>Payment Type Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Payment Type</th>
                <th>Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
        `

        selectedReport.paymentTypes.forEach((type: any) => {
          htmlContent += `
            <tr>
              <td>${type.type}</td>
              <td>${type.count}</td>
              <td>₱${type.total}</td>
            </tr>
          `
        })

        htmlContent += `
            </tbody>
          </table>
        `
      }

      if (reportType === "Payment Report" && selectedReport.paymentMethods) {
        htmlContent += `
          <h2>Payment Method Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Payment Method</th>
                <th>Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
        `

        selectedReport.paymentMethods.forEach((method: any) => {
          htmlContent += `
            <tr>
              <td>${method.method}</td>
              <td>${method.count}</td>
              <td>₱${method.total}</td>
            </tr>
          `
        })

        htmlContent += `
            </tbody>
          </table>
        `
      }

      if (reportType === "Inquiry Report" && selectedReport.inquiryTypes) {
        htmlContent += `
          <h2>Inquiry Type Analysis</h2>
          <table>
            <thead>
              <tr>
                <th>Inquiry Type</th>
                <th>Count</th>
                <th>Resolved</th>
                <th>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
        `

        selectedReport.inquiryTypes.forEach((type: any) => {
          const resolutionRate = type.count > 0 ? Math.round((type.resolved / type.count) * 100) + "%" : "N/A"
          htmlContent += `
            <tr>
              <td>${type.type}</td>
              <td>${type.count}</td>
              <td>${type.resolved}</td>
              <td>${resolutionRate}</td>
            </tr>
          `
        })

        htmlContent += `
            </tbody>
          </table>
        `
      }

      // Add footer
      htmlContent += `
          <div class="footer">
            <p>This report was automatically generated by Surigao Memorial Park Management System.</p>
            <p>© ${new Date().getFullYear()} Surigao Memorial Park Inc. All rights reserved.</p>
          </div>
        </body>
        </html>
      `

      // Create blob and download
      const blob = new Blob([htmlContent], { type: "application/msword" })
      const fileName = `${selectedReport.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.doc`

      // Create download link
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Report Exported Successfully",
        description: `${selectedReport.title} has been exported to Word format.`,
      })
    } catch (error) {
      console.error("Error exporting to Word:", error)
      toast({
        title: "Export Error",
        description: "There was an error exporting the report to Word. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper functions for opening dialogs
  const openEditLot = (lot: any) => {
    setSelectedLot(lot)
    setLotFormData({
      id: lot.id,
      section: lot.section,
      type: lot.type,
      status: lot.status,
      price: lot.price.toString(),
      description: lot.description || "",
      dimensions: lot.dimensions || "",
      features: lot.features || "",
      mapId: lot.mapId || null, // Carry over mapId
    })
    setIsEditLotOpen(true)
  }

  const openViewLot = (lot: any) => {
    setSelectedLot(lot)
    setIsViewLotOpen(true)
  }

  const openEditClient = (client: any) => {
    setSelectedClient(client)
    setClientFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address || "",
      emergencyContact: client.emergencyContact || "",
      emergencyPhone: client.emergencyPhone || "",
      notes: client.notes || "",
    })
    setIsEditClientOpen(true)
  }

  const openViewClient = (client: any) => {
    setSelectedClient(client)
    setIsViewClientOpen(true)
  }

  const openViewBurial = (burial: any) => {
    setSelectedBurial(burial)
    setIsViewBurialOpen(true)
  }

  const openReplyInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry)
    setReplyFormData({
      subject: `Re: ${inquiry.type} - ${inquiry.name}`,
      message: "",
      priority: inquiry.priority,
      sendCopy: false,
      followUpDate: "",
    })
    setIsReplyInquiryOpen(true)
  }

  const openViewInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry)
    setIsViewInquiryOpen(true)
  }

  const openMessageClient = (client: any) => {
    setSelectedClient(client)
    setMessageFormData({
      subject: "",
      message: "",
      type: "general",
    })
    setIsMessageClientOpen(true)
  }

  // Filter functions for search bars
  const filteredLots = dashboardData.lots.filter(
    (lot) =>
      lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.owner && lot.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lot.occupant && lot.occupant.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredClients = dashboardData.clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.address.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.lots.some((lot) => lot.toLowerCase().includes(clientSearchTerm.toLowerCase())),
  )

  const filteredPayments = dashboardData.payments.filter(
    (payment) =>
      payment.client.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.lot.toLowerCase().includes(paymentSearchTerm.toLowerCase()),
  )

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.name.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
      inquiry.type.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(inquirySearchTerm.toLowerCase()),
  )

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "destructive"
      case "In Progress":
        return "default"
      case "Resolved":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "normal":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('employeeSession'); // Updated based on the new auth check
    localStorage.removeItem('employeeUser'); // Updated
    localStorage.removeItem('currentUser'); // Updated
    router.push('/admin/login');
  };

  const handleUpdatePayment = (clientName: string, newBalance: number) => {
    // Find the client and update their balance
    const clientIndex = dashboardData.clients.findIndex((client) => client.name === clientName);
    const updatedData = { ...dashboardData };
    if (clientIndex !== -1) {
      updatedData.clients[clientIndex].balance = newBalance;
      // You might also want to update payment history or status here if applicable
      // For example, if the balance becomes 0, you could mark the related payments as fully paid.
    }

    // Update the global state and save to local storage
    setDashboardData(updatedData);
    saveToLocalStorage(updatedData);

    toast({
      title: "Payment Status Updated",
      description: `The balance for ${clientName} has been updated to ₱${formatCurrency(newBalance)}.`,
    });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button - Floating */}
      <Button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header - Made responsive */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 ml-12 sm:ml-16">
            <div className="bg-white p-1 sm:p-2 rounded-lg shadow-sm">
              <Image
                src="/images/smpi-logo.png"
                alt="SMPI Logo"
                width={24}
                height={24}
                className="sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">Surigao Memorial Park</h1>
              <p className="text-xs sm:text-sm text-gray-600">Administration Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AdminNotificationBadge
              adminUsername={localStorage.getItem('adminUser') || 'admin'}
              onOpenMessages={() => setShowMessages(true)}
            />
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage cemetery operations and monitor system performance.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 w-full text-xs sm:text-sm overflow-x-auto">
            <TabsTrigger value="overview" className="px-2 sm:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="lots" className="px-2 sm:px-4">
              Lots
            </TabsTrigger>
            <TabsTrigger value="burials" className="px-2 sm:px-4">
              Burials
            </TabsTrigger>
            <TabsTrigger value="clients" className="px-2 sm:px-4">
              Clients
            </TabsTrigger>
            <TabsTrigger value="payments" className="px-2 sm:px-4">
              Payments
            </TabsTrigger>
            <TabsTrigger value="maps" className="px-2 sm:px-4">
              Maps
            </TabsTrigger>
            <TabsTrigger value="news" className="px-2 sm:px-4">
              News
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="px-2 sm:px-4">
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="reports" className="px-2 sm:px-4">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Lots</p>
                      <p className="text-xl sm:text-2xl font-bold">{dashboardData.stats.totalLots}</p>
                      <p className="text-xs text-gray-500">
                        {dashboardData.stats.occupiedLots} occupied • {dashboardData.stats.availableLots} available
                      </p>
                    </div>
                    <MapPin />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clients</p>
                      <p className="text-xl sm:text-2xl font-bold">{dashboardData.stats.totalClients}</p>
                      <p className="text-xs text-gray-500">Active lot owners</p>
                    </div>
                    <Users />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        ₱{formatCurrency(dashboardData.stats.monthlyRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">{dashboardData.stats.overduePayments} overdue payments</p>
                    </div>
                    <DollarSign />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Inquiries</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {inquiries.filter((i) => i.status !== "Resolved").length}
                      </p>
                      <p className="text-xs text-gray-500">Require attention</p>
                    </div>
                    <MessageSquare />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Burials</CardTitle>
                  <CardDescription>Latest burial records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.recentBurials.map((burial) => (
                      <div key={burial.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{burial.name}</p>
                          <p className="text-sm text-gray-600">
                            Lot {burial.lot} • {burial.family}
                          </p>
                          <p className="text-xs text-gray-500">{burial.date}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openViewBurial(burial)}>
                          <Eye />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Inquiries</CardTitle>
                  <CardDescription>Client inquiries requiring response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inquiries
                      .filter((i) => i.status !== "Resolved")
                      .slice(0, 3)
                      .map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{inquiry.name}</p>
                            <p className="text-sm text-gray-600">{inquiry.type}</p>
                            <p className="text-xs text-gray-500">{inquiry.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                            <Button variant="outline" size="sm" onClick={() => openReplyInquiry(inquiry)}>
                              Reply
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lots" className="space-y-6">
            <div className="flex flex-col sm:flex-col justify-between items-center mb-4 sm:mb-0">
              <div>
                <h3 className="text-lg font-semibold">Lot Management</h3>
                <p className="text-gray-600">Manage cemetery lots and assignments</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setIsAssignOwnerOpen(true)}
                  disabled={filteredLots.length === 0}
                  title="Select a lot to assign to an owner"
                >
                  Assign Lot to Owner
                </Button>
                <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700" title="Add a new lot to the system">
                      <Plus />
                      Add New Lot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Lot</DialogTitle>
                      <DialogDescription>Create a new cemetery lot in the system.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lot-id">Lot ID</Label>
                        <Input
                          id="lot-id"
                          placeholder="e.g., A-001"
                          value={lotFormData.id}
                          onChange={(e) => setLotFormData({ ...lotFormData, id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Select
                          value={lotFormData.section}
                          onValueChange={(value) => setLotFormData({ ...lotFormData, section: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Garden of Peace">Garden of Peace</SelectItem>
                            <SelectItem value="Garden of Serenity">Garden of Serenity</SelectItem>
                            <SelectItem value="Garden of Tranquility">Garden of Tranquility</SelectItem>
                            <SelectItem value="Memorial Gardens">Memorial Gardens</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={lotFormData.type}
                          onValueChange={(value) => setLotFormData({ ...lotFormData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Standard">Standard (Lawn Lot)</SelectItem>
                            <SelectItem value="Premium">Premium (Garden Lot)</SelectItem>
                            <SelectItem value="Family">Family (Estate)</SelectItem>
                            <SelectItem value="Mausoleum">Mausoleum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={lotFormData.status}
                          onValueChange={(value) => setLotFormData({ ...lotFormData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Reserved">Reserved</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₱)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="75000"
                          value={lotFormData.price}
                          onChange={(e) => setLotFormData({ ...lotFormData, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                          id="dimensions"
                          placeholder="2m x 1m"
                          value={lotFormData.dimensions}
                          onChange={(e) => setLotFormData({ ...lotFormData, dimensions: e.target.value })}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2 space-y-2">
                        <Label htmlFor="features">Features</Label>
                        <Input
                          id="features"
                          placeholder="Concrete headstone, garden border"
                          value={lotFormData.features}
                          onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Beautiful standard lot with garden view"
                          value={lotFormData.description}
                          onChange={(e) => setLotFormData({ ...lotFormData, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddLotOpen(false)}
                        type="button"
                        title="Cancel adding a new lot"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddLot}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!lotFormData.id || !lotFormData.section || !lotFormData.type || !lotFormData.status}
                        type="button"
                        title="Add the lot to the system"
                      >
                        Add Lot
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Cemetery Lots</CardTitle>
                    <CardDescription>Manage lot availability and assignments</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search lots..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No lots found. Create a new lot or add lots from the map editor.</p>
                    </div>
                  ) : (
                    filteredLots.map((lot) => (
                      <div
                        key={lot.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <MapPin />
                          </div>
                          <div>
                            <p className="font-medium">Lot {lot.id}</p>
                            <p className="text-sm text-gray-600">
                              {lot.section} • {lot.type}
                            </p>
                            <p className="text-sm text-gray-600">₱{formatCurrency(lot.price)}</p>
                            {lot.occupant && <p className="text-xs text-gray-500">Occupant: {lot.occupant}</p>}
                            {lot.owner && <p className="text-xs text-gray-500">Owner: {lot.owner}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              lot.status === "Available"
                                ? "default"
                                : lot.status === "Occupied"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {lot.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditLot(lot)} title="Edit this lot">
                              <Edit />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewLot(lot)}
                              title="View lot details"
                            >
                              <Eye />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  title="Delete this lot"
                                >
                                  <Trash2 />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Lot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete Lot {lot.id}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLot(lot)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="burials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Burial Records</CardTitle>
                <CardDescription>Manage and view all burial records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.burials.map((burial) => (
                    <div key={burial.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Calendar />
                        </div>
                        <div>
                          <p className="font-medium">{burial.name}</p>
                          <p className="text-sm text-gray-600">
                            Lot {burial.lot} • {burial.family}
                          </p>
                          <p className="text-xs text-gray-500">{burial.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => openViewBurial(burial)}>
                          <Eye />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-0">
              <div>
                <h3 className="text-lg font-semibold">Client Management</h3>
                <p className="text-gray-600">Manage lot owners and their information</p>
              </div>
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 mt-4 sm:mt-0">
                    <Plus />
                    Add New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Register a new client in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Full Name</Label>
                      <Input
                        id="client-name"
                        placeholder="Juan Dela Cruz"
                        value={clientFormData.name}
                        onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="juan@email.com"
                        value={clientFormData.email}
                        onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone Number</Label>
                      <Input
                        id="client-phone"
                        placeholder="09123456789"
                        value={clientFormData.phone}
                        onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency-contact">Emergency Contact</Label>
                      <Input
                        id="emergency-contact"
                        placeholder="Maria Dela Cruz"
                        value={clientFormData.emergencyContact}
                        onChange={(e) => setClientFormData({ ...clientFormData, emergencyContact: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency-phone">Emergency Phone</Label>
                      <Input
                        id="emergency-phone"
                        placeholder="09987654321"
                        value={clientFormData.emergencyPhone}
                        onChange={(e) => setClientFormData({ ...clientFormData, emergencyPhone: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <Label htmlFor="client-address">Address</Label>
                      <Input
                        id="client-address"
                        placeholder="123 Main St, Surigao City"
                        value={clientFormData.address}
                        onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <Label htmlFor="client-notes">Notes</Label>
                      <Textarea
                        id="client-notes"
                        placeholder="Additional notes about the client"
                        value={clientFormData.notes}
                        onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddClient} className="bg-green-600 hover:bg-green-700">
                      Add Client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Registered Clients</CardTitle>
                    <CardDescription>Lot owners and their account information</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <Avatar>
                          <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-600">{client.phone}</p>
                          <p className="text-xs text-gray-500">
                            Lots: {client.lots.join(", ")} • Balance: ₱{formatCurrency(client.balance)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEditClient(client)}>
                            <Edit />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openViewClient(client)}>
                            <Eye />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openMessageClient(client)}>
                            <MessageSquare />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-0">
              <div>
                <h3 className="text-lg font-semibold">Inquiry Management</h3>
                <p className="text-gray-600">Manage and respond to client inquiries and requests</p>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search inquiries..."
                    value={inquirySearchTerm}
                    onChange={(e) => setInquirySearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {inquiries.filter((i) => i.status === "New").length} New
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    {inquiries.filter((i) => i.status === "In Progress").length} In Progress
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {inquiries.filter((i) => i.status === "Resolved").length} Resolved
                  </Badge>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Inquiries</CardTitle>
                <CardDescription>Manage and respond to client inquiries and requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">{inquiry.name}</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span>{inquiry.email}</span>
                              <Phone className="h-3 w-3 ml-1 sm:ml-2" />
                              <span>{inquiry.phone}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {inquiry.date} at {inquiry.time}
                              </span>
                              <span>•</span>
                              <span>via {inquiry.source}</span>
                              <span>•</span>
                              <span>Assigned to: {inquiry.assignedTo}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(inquiry.priority)}>{inquiry.priority}</Badge>
                          <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                          {inquiry.status === "Resolved" && <CheckCircle />}
                          {inquiry.followUpDate && inquiry.status !== "Resolved" && (
                            <AlertCircle
                              className="h-4 w-4 text-orange-500"
                              title={`Follow up: ${inquiry.followUpDate}`}
                            />
                          )}
                        </div>
                      </div>

                      <div className="mb-3 w-full">
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-700">Inquiry Type: {inquiry.type}</p>
                          {inquiry.budget && inquiry.budget !== "N/A" && (
                            <Badge variant="outline" className="text-xs">
                              Budget: {inquiry.budget}
                            </Badge>
                          )}
                          {inquiry.timeline && (
                            <Badge variant="outline" className="text-xs">
                              Timeline: {inquiry.timeline}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{inquiry.message}</p>

                        {inquiry.tags && inquiry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {inquiry.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {inquiry.responses && inquiry.responses.length > 0 && (
                        <div className="mb-3 w-full">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Recent Responses ({inquiry.responses.length}):
                          </p>
                          <div className="space-y-2">
                            {inquiry.responses.slice(-2).map((response) => (
                              <div key={response.id} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-xs font-medium text-blue-800">{response.respondent}</p>
                                  <p className="text-xs text-blue-600">
                                    {response.date} at {response.time}
                                  </p>
                                </div>
                                <p className="text-sm text-blue-700">{response.message}</p>
                                <p className="text-xs text-blue-600 mt-1">Sent via: {response.method}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {inquiry.followUpDate && inquiry.status !== "Resolved" && (
                        <div className="mb-3 w-full p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Follow-up scheduled for: {inquiry.followUpDate}
                          </p>
                        </div>
                      )}

                      {inquiry.status === "Resolved" && inquiry.resolvedDate && (
                        <div className="mb-3 w-full p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Resolved on {inquiry.resolvedDate} by {inquiry.resolvedBy}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 w-full">
                        {inquiry.status !== "Resolved" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => openReplyInquiry(inquiry)}
                            >
                              <Send />
                              Reply
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark as Resolved
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Mark Inquiry as Resolved</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to mark this inquiry from {inquiry.name} as resolved? This
                                    will close the inquiry and remove it from the active list.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleMarkResolved(inquiry)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Mark as Resolved
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {inquiry.status === "Resolved" && (
                          <Button variant="outline" size="sm" onClick={() => handleReopenInquiry(inquiry)}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Reopen
                          </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={() => openViewInquiry(inquiry)}>
                          <Eye />
                          View Details
                        </Button>

                        <Select onValueChange={(value) => handleUpdatePriority(inquiry, value)}>
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="normal">Normal Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>Monitor client payments and balances (Status Updates Only)</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search payments..."
                      value={paymentSearchTerm}
                      onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          ₱{formatCurrency(dashboardData.stats.monthlyRevenue)}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Payments Received</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-orange-600">
                          {dashboardData.stats.overduePayments}
                        </p>
                        <p className="text-sm text-gray-600">Overdue Balances</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">₱125,000</p>
                        <p className="text-sm text-gray-600">Total Outstanding Balance</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lot ID
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Price
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount Paid
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.client}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{payment.reference}</td>
                          <td className="px-6 py-4 whitespace-nowrap">₱{formatCurrency(payment.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                            ₱{formatCurrency((payment.amount || 0) * 0.6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-orange-600">
                              ₱{formatCurrency((payment.amount || 0) * 0.4)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={payment.status === "Completed" ? "default" : "secondary"}>
                              {payment.status === "Completed" ? "On Payment" : "Overdue"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newBalanceInput = prompt("Enter new balance amount:")
                                if (newBalanceInput !== null) {
                                  const newBalance = Number.parseFloat(newBalanceInput)
                                  if (!isNaN(newBalance) && newBalance >= 0) {
                                    handleUpdatePayment(payment.client, newBalance)
                                  } else {
                                    toast({
                                      title: "Invalid Input",
                                      description: "Please enter a valid non-negative number for the balance.",
                                      variant: "destructive"
                                    })
                                  }
                                }
                              }}
                              title="Update payment status or balance"
                            >
                              Update Status
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-0">
              <div>
                <h3 className="text-lg font-semibold">System Reports</h3>
                <p className="text-gray-600">Generate and download various system reports</p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Report Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter />
                  <span>Filters</span>
                  <ChevronDown />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>Generate and download various system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border border-blue-100 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <BarChart3 className="h-10 w-10 mb-3 text-blue-600" />
                        <h3 className="text-lg font-medium mb-1">Occupancy Report</h3>
                        <p className="text-sm text-gray-600 mb-4">View lot occupancy statistics and availability</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Occupancy Report")}
                            disabled={isGeneratingReport}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isGeneratingReport && reportType === "Occupancy Report" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-100 hover:border-green-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <DollarSign className="h-10 w-10 mb-3 text-green-600" />
                        <h3 className="text-lg font-medium mb-1">Revenue Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Track financial performance and revenue streams</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Revenue Report")}
                            disabled={isGeneratingReport}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isGeneratingReport && reportType === "Revenue Report" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-purple-100 hover:border-purple-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Users className="h-10 w-10 mb-3 text-purple-600" />
                        <h3 className="text-lg font-medium mb-1">Client Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Analyze client demographics and activity</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Client Report")}
                            disabled={isGeneratingReport}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {isGeneratingReport && reportType === "Client Report" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-amber-100 hover:border-amber-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Calendar className="h-10 w-10 mb-3 text-amber-600" />
                        <h3 className="text-lg font-medium mb-1">Burial Schedule</h3>
                        <p className="text-sm text-gray-600 mb-4">View upcoming and past burial ceremonies</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Burial Schedule")}
                            disabled={isGeneratingReport}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            {isGeneratingReport && reportType === "Burial Schedule" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-teal-100 hover:border-teal-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <FileText className="h-10 w-10 mb-3 text-teal-600" />
                        <h3 className="text-lg font-medium mb-1">Payment Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Track payment history and outstanding balances</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Payment Report")}
                            disabled={isGeneratingReport}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            {isGeneratingReport && reportType === "Payment Report" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-orange-100 hover:border-orange-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <MessageSquare className="h-10 w-10 mb-3 text-orange-600" />
                        <h3 className="text-lg font-medium mb-1">Inquiry Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Analyze inquiry trends and response metrics</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport("Inquiry Report")}
                            disabled={isGeneratingReport}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {isGeneratingReport && reportType === "Inquiry Report" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>Generate Report</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maps" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Cemetery Maps</h3>
                <p className="text-gray-600">Manage interactive cemetery maps and lot boundaries</p>
              </div>
            </div>

            <MapManager />
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <NewsManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Report Preview Dialog */}
      <Dialog open={isReportPreviewOpen} onOpenChange={setIsReportPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span>{selectedReport?.title}</span>
              <div className="flex gap-2">
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
                <Button onClick={exportToWord} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Word
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Generated on {selectedReport?.date} | Period: {selectedReport?.period}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedReport.summary).map(([key, value]) => {
                    const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

                    return (
                      <div key={key} className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">{formattedKey}</p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Data Table */}
              {selectedReport.data && selectedReport.data.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Data</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {Object.keys(selectedReport.data[0]).map((key) => {
                              const formattedHeader = key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())

                              return (
                                <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                                  {formattedHeader}
                                </th>
                              )
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.data.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              {Object.values(item).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Analysis Sections */}
              {reportType === "Occupancy Report" && selectedReport.sections && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Section Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedReport.sections.map((section, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{section.name}</h4>
                        <div className="space-y-1 text-sm">
                          <p>Total Lots: {section.total}</p>
                          <p>Occupied: {section.occupied}</p>
                          <p>Available: {section.available}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(section.occupied / section.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportType === "Revenue Report" && selectedReport.paymentTypes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Type Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedReport.paymentTypes.map((type, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{type.type}</h4>
                        <div className="space-y-1 text-sm">
                          <p>Count: {type.count}</p>
                          <p>Total: ₱{type.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportType === "Payment Report" && selectedReport.paymentMethods && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Method Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {selectedReport.paymentMethods.map((method, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{method.method}</h4>
                        <div className="space-y-1 text-sm">
                          <p>Count: {method.count}</p>
                          <p>Total: ₱{method.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportType === "Inquiry Report" && selectedReport.inquiryTypes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Inquiry Type Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedReport.inquiryTypes.map((type, index) => {
                      const resolutionRate = type.count > 0 ? Math.round((type.resolved / type.count) * 100) : 0
                      return (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <h4 className="font-medium mb-2">{type.type}</h4>
                          <div className="space-y-1 text-sm">
                            <p>Total: {type.count}</p>
                            <p>Resolved: {type.resolved}</p>
                            <p>Resolution Rate: {resolutionRate}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${resolutionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsReportPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lot Dialog */}
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lot {selectedLot?.id}</DialogTitle>
            <DialogDescription>Update lot information and settings.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lot-id">Lot ID</Label>
              <Input
                id="edit-lot-id"
                value={lotFormData.id}
                onChange={(e) => setLotFormData({ ...lotFormData, id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section</Label>
              <Select
                value={lotFormData.section}
                onValueChange={(value) => setLotFormData({ ...lotFormData, section: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Garden of Peace">Garden of Peace</SelectItem>
                  <SelectItem value="Garden of Serenity">Garden of Serenity</SelectItem>
                  <SelectItem value="Garden of Tranquility">Garden of Tranquility</SelectItem>
                  <SelectItem value="Memorial Gardens">Memorial Gardens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={lotFormData.type}
                onValueChange={(value) => setLotFormData({ ...lotFormData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Mausoleum">Mausoleum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={lotFormData.status}
                onValueChange={(value) => setLotFormData({ ...lotFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₱)</Label>
              <Input
                id="edit-price"
                type="number"
                value={lotFormData.price}
                onChange={(e) => setLotFormData({ ...lotFormData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dimensions">Dimensions</Label>
              <Input
                id="edit-dimensions"
                value={lotFormData.dimensions}
                onChange={(e) => setLotFormData({ ...lotFormData, dimensions: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-features">Features</Label>
              <Input
                id="edit-features"
                value={lotFormData.features}
                onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={lotFormData.description}
                onChange={(e) => setLotFormData({ ...lotFormData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditLotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLot} className="bg-blue-600 hover:bg-blue-700">
              Update Lot
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Lot Dialog */}
      <Dialog open={isViewLotOpen} onOpenChange={setIsViewLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lot {selectedLot?.id} Details</DialogTitle>
            <DialogDescription>Complete information about this cemetery lot.</DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Section</Label>
                  <p className="text-sm">{selectedLot.section}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="text-sm">{selectedLot.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge
                    variant={
                      selectedLot.status === "Available"
                        ? "default"
                        : selectedLot.status === "Occupied"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedLot.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Price</Label>
                  <p className="text-sm">₱{formatCurrency(selectedLot.price)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dimensions</Label>
                  <p className="text-sm">{selectedLot.dimensions}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date Added</Label>
                  <p className="text-sm">{selectedLot.dateAdded}</p>
                </div>
                {selectedLot.owner && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Owner</Label>
                    <p className="text-sm">{selectedLot.owner}</p>
                  </div>
                )}
                {selectedLot.occupant && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Occupant</Label>
                    <p className="text-sm">{selectedLot.occupant}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Features</Label>
                <p className="text-sm">{selectedLot.features}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-sm">{selectedLot.description}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewLotOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client: {selectedClient?.name}</DialogTitle>
            <DialogDescription>Update client information and contact details.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client-name">Full Name</Label>
              <Input
                id="edit-client-name"
                value={clientFormData.name}
                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-email">Email</Label>
              <Input
                id="edit-client-email"
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client-phone">Phone Number</Label>
              <Input
                id="edit-client-phone"
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergency-contact">Emergency Contact</Label>
              <Input
                id="edit-emergency-contact"
                value={clientFormData.emergencyContact}
                onChange={(e) => setClientFormData({ ...clientFormData, emergencyContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergency-phone">Emergency Phone</Label>
              <Input
                id="edit-emergency-phone"
                value={clientFormData.emergencyPhone}
                onChange={(e) => setClientFormData({ ...clientFormData, emergencyPhone: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-client-address">Address</Label>
              <Input
                id="edit-client-address"
                value={clientFormData.address}
                onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-client-notes">Notes</Label>
              <Textarea
                id="edit-client-notes"
                value={clientFormData.notes}
                onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClient} className="bg-green-600 hover:bg-green-700">
              Update Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewClientOpen} onOpenChange={setIsViewClientOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Client Details: {selectedClient?.name}</DialogTitle>
            <DialogDescription>Complete client information and account history.</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm">{selectedClient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedClient.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedClient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={selectedClient.status === "Active" ? "default" : "secondary"}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                  <p className="text-sm">{selectedClient.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Outstanding Balance</Label>
                  <p className="text-sm">₱{formatCurrency(selectedClient.balance)}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedClient.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                  <p className="text-sm">{selectedClient.emergencyContact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency Phone</Label>
                  <p className="text-sm">{selectedClient.emergencyPhone}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Owned Lots</Label>
                  <p className="text-sm">{selectedClient.lots.join(", ")}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{selectedClient.notes}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Payment History</Label>
                <div className="space-y-2">
                  {selectedClient.paymentHistory?.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{payment.type}</p>
                        <p className="text-xs text-gray-500">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₱{formatCurrency(payment.amount)}</p>
                        <Badge variant={payment.status === "Completed" ? "default" : "secondary"} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => openMessageClient(selectedClient)}>
              <MessageSquare />
              Send Message
            </Button>
            <Button variant="outline" onClick={() => setIsViewClientOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Burial Dialog */}
      <Dialog open={isViewBurialOpen} onOpenChange={setIsViewBurialOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Burial Record: {selectedBurial?.name}</DialogTitle>
            <DialogDescription>Complete burial information and ceremony details.</DialogDescription>
          </DialogHeader>
          {selectedBurial && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-sm font-medium">{selectedBurial.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Age</Label>
                  <p className="text-sm">{selectedBurial.age} years old</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Burial Date</Label>
                  <p className="text-sm">{selectedBurial.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Burial Time</Label>
                  <p className="text-sm">{selectedBurial.burial}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Lot Number</Label>
                  <p className="text-sm">{selectedBurial.lot}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Family</Label>
                  <p className="text-sm">{selectedBurial.family}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Cause of Death</Label>
                  <p className="text-sm">{selectedBurial.cause}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Attendees</Label>
                  <p className="text-sm">{selectedBurial.attendees} people</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Funeral Service</Label>
                  <p className="text-sm">{selectedBurial.funeral}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{selectedBurial.notes}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewBurialOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Inquiry Dialog */}
      <Dialog open={isReplyInquiryOpen} onOpenChange={setIsReplyInquiryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>Send a response to {selectedInquiry?.name}'s inquiry.</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-3">
                  <div>
                    <p className="font-medium">{selectedInquiry.name}</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{selectedInquiry.email}</span>
                      <Phone className="h-3 w-3 ml-1 sm:ml-2" />
                      <span>{selectedInquiry.phone}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedInquiry.date} at {selectedInquiry.time}
                    </p>
                  </div>
                  <Badge variant={getPriorityColor(selectedInquiry.priority)}>{selectedInquiry.priority}</Badge>
                </div>
                <div className="mt-2 w-full">
                  <p className="text-sm font-medium text-gray-700">Original Message:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedInquiry.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reply-subject">Subject</Label>
                  <Input
                    id="reply-subject"
                    value={replyFormData.subject}
                    onChange={(e) => setReplyFormData({ ...replyFormData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-priority">Priority</Label>
                  <Select
                    value={replyFormData.priority}
                    onValueChange={(value) => setReplyFormData({ ...replyFormData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message">Reply Message</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your response here..."
                  rows={6}
                  value={replyFormData.message}
                  onChange={(e) => setReplyFormData({ ...replyFormData, message: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Follow-up Date (Optional)</Label>
                  <Input
                    id="follow-up-date"
                    type="date"
                    value={replyFormData.followUpDate}
                    onChange={(e) => setReplyFormData({ ...replyFormData, followUpDate: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="send-copy"
                    checked={replyFormData.sendCopy}
                    onChange={(e) => setReplyFormData({ ...replyFormData, sendCopy: e.target.checked })}
                  />
                  <Label htmlFor="send-copy" className="text-sm">
                    Send copy to my email
                  </Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsReplyInquiryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReplyInquiry} className="bg-blue-600 hover:bg-blue-700">
              <Send />
              Send Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewInquiryOpen} onOpenChange={setIsViewInquiryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details: {selectedInquiry?.name}</DialogTitle>
            <DialogDescription>Complete inquiry information and response history.</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedInquiry.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedInquiry.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Inquiry Type</Label>
                  <p className="text-sm">{selectedInquiry.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                  <p className="text-sm">
                    {selectedInquiry.date} at {selectedInquiry.time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Source</Label>
                  <p className="text-sm">{selectedInquiry.source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge variant={getPriorityColor(selectedInquiry.priority)}>{selectedInquiry.priority}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={getStatusColor(selectedInquiry.status)}>{selectedInquiry.status}</Badge>
                </div>
                {selectedInquiry.budget && selectedInquiry.budget !== "N/A" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Budget</Label>
                    <p className="text-sm">{selectedInquiry.budget}</p>
                  </div>
                )}
                {selectedInquiry.timeline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                    <p className="text-sm">{selectedInquiry.timeline}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Original Message</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedInquiry.message}</p>
                </div>
              </div>

              {selectedInquiry.tags && selectedInquiry.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedInquiry.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">
                    Response History ({selectedInquiry.responses.length})
                  </Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedInquiry.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-blue-800">{response.respondent}</p>
                          <p className="text-xs text-blue-600">
                            {response.date} at {response.time} via {response.method}
                          </p>
                        </div>
                        <p className="text-sm text-blue-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInquiry.followUpDate && selectedInquiry.status !== "Resolved" && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Follow-up scheduled for: {selectedInquiry.followUpDate}
                  </p>
                </div>
              )}

              {selectedInquiry.status === "Resolved" && selectedInquiry.resolvedDate && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Resolved on {selectedInquiry.resolvedDate} by {selectedInquiry.resolvedBy}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => openReplyInquiry(selectedInquiry)}>
              <Send />
              Reply
            </Button>
            <Button variant="outline" onClick={() => setIsViewInquiryOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessageClientOpen} onOpenChange={setIsMessageClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedClient?.name}</DialogTitle>
            <DialogDescription>Send a direct message to the client.</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                    <AvatarFallback>
                      {selectedClient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedClient.name}</p>
                    <p className="text-sm text-gray-600">{selectedClient.email}</p>
                    <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="message-subject">Subject</Label>
                  <Input
                    id="message-subject"
                    placeholder="Message subject"
                    value={messageFormData.subject}
                    onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message-type">Message Type</Label>
                  <Select
                    value={messageFormData.type}
                    onValueChange={(value) => setMessageFormData({ ...messageFormData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="payment">Payment Reminder</SelectItem>
                      <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-content">Message</Label>
                <Textarea
                  id="message-content"
                  placeholder="Type your message here..."
                  rows={6}
                  value={messageFormData.message}
                  onChange={(e) => setMessageFormData({ ...messageFormData, message: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMessageClientOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700">
              <Send />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LotOwnerSelector
        isOpen={isAssignOwnerOpen}
        onClose={() => setIsAssignOwnerOpen(false)}
        onAssign={handleAssignLotToOwner}
      />

      <AIHelpWidget portalType="admin" />

      <Dialog open={showMessages} onOpenChange={setShowMessages}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Messages from Super Admin</DialogTitle>
            <DialogDescription>View and respond to messages from system administrators</DialogDescription>
          </DialogHeader>

          {selectedMessage ? (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                <ArrowLeft /> Back to Messages
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedMessage.subject}</CardTitle>
                      <CardDescription>
                        From: Super Admin | {new Date(selectedMessage.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        selectedMessage.priority === 'urgent' ? 'destructive' :
                        selectedMessage.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {selectedMessage.priority}
                      </Badge>
                      <Badge variant="outline">{selectedMessage.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.body}</p>
                  
                  <form onSubmit={handleReplyMessage} className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                    <Button type="submit" size="sm">
                      <Send /> Send Reply
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={`cursor-pointer hover:bg-gray-50 ${!msg.read ? 'border-blue-500 border-2' : ''}`}
                    onClick={() => handleViewMessage(msg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {!msg.read && <Badge variant="default">New</Badge>}
                            <Badge variant={
                              msg.priority === 'urgent' ? 'destructive' :
                              msg.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {msg.priority}
                            </Badge>
                            <Badge variant="outline">{msg.type}</Badge>
                          </div>
                          <p className="font-semibold text-sm">{msg.subject}</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{msg.body}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
