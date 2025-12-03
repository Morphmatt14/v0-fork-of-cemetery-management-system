"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { SVGProps } from "react"
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
import { mapStoreApi } from "@/lib/map-store-api"
import { MAP_LOTS_UPDATED_EVENT } from "@/lib/map-events"
import { deriveBlockId, normalizeLotTypeLabel } from "@/lib/utils/lot-normalizer"
import {
  submitPendingAction,
  checkApprovalRequired,
  listMyPendingActions,
  formatActionType,
  formatApprovalStatus,
  getStatusColor,
  getTimeElapsed
} from "@/lib/api/approvals-api"
import { fetchDashboardData, createClient as createClientInDB, checkClientEmailExists, updatePayment, deleteClient as deleteClientInDB } from "@/lib/api/dashboard-api"
import { updateLot } from "@/lib/api/lots-api"
import { FrontPageTab } from "./components/front-page-tab"
import { formatCurrency } from "./components/utils"

const mergeClasses = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base)

const saveToLocalStorage = (data: any) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("cemeteryData", JSON.stringify(data))
  } catch (error) {
    console.error("[Employee Dashboard] Failed to save dashboard data to localStorage", error)
  }
}

const createEmptyClientForm = () => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  notes: "",
  username: "",
  password: "",
  confirmPassword: "",
  contractSection: "",
  contractBlock: "",
  contractLotNumber: "",
  contractLotType: "",
  selectedLotId: "",
  contractSignedAt: "",
  contractAuthorizedBy: "",
  contractAuthorizedPosition: "",
  preferredPaymentMethod: "cash",
  preferredPaymentSchedule: "monthly",
})

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online Payment" },
]

const paymentScheduleOptions = [
  { value: "demo_1min", label: "Every 1 Minute (Demo)" },
  { value: "demo_5min", label: "Every 5 Minutes (Demo)" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "full", label: "Full Payment" },
]

const CLEAR_SELECTION_VALUE = '__clear_selection__'
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

const isValidUUID = (value?: string | null) => (typeof value === 'string' && UUID_REGEX.test(value))

type EmployeeInfo = {
  id: string
  name?: string
  username?: string
  role?: string
  employeeRole?: string
}

const EMPLOYEE_ROLE_TITLES: Record<string, string> = {
  admin: "Administrator",
  manager: "Operations Manager",
  supervisor: "Supervisor",
  cashier: "Cashier",
  staff: "Staff",
}

const formatEmployeeRoleTitle = (role?: string): string => {
  if (!role) return "Authorized Signatory"
  const normalized = role.toLowerCase()
  if (EMPLOYEE_ROLE_TITLES[normalized]) {
    return EMPLOYEE_ROLE_TITLES[normalized]
  }

  return normalized
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const normalizeClientStatus = (status?: string | null) => {
  if (!status || typeof status !== 'string') return 'unknown'
  const normalized = status.trim().toLowerCase()
  return normalized || 'unknown'
}

type ClientStatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  description?: string
}

const CLIENT_STATUS_META: Record<string, ClientStatusMeta> = {
  active: {
    label: 'Active',
    variant: 'default',
  },
  pending: {
    label: 'Pending Activation',
    variant: 'secondary',
    description: 'Awaiting cashier payment to activate.',
  },
  inactive: {
    label: 'Pending Activation',
    variant: 'secondary',
    description: 'Awaiting cashier payment to activate.',
  },
  suspended: {
    label: 'Suspended',
    variant: 'destructive',
    description: 'Access temporarily restricted by administration.',
  },
  archived: {
    label: 'Archived',
    variant: 'outline',
  },
  deleted: {
    label: 'Deleted',
    variant: 'outline',
  },
}

const getClientStatusMeta = (status?: string | null): ClientStatusMeta => {
  const normalized = normalizeClientStatus(status)
  if (CLIENT_STATUS_META[normalized]) {
    return CLIENT_STATUS_META[normalized]
  }

  return {
    label: status && status.trim() ? status : 'Unknown',
    variant: 'outline',
  }
}

type AvailableLotOption = {
  id: string
  section?: string
  block?: string
  lotNumber: string
  lotType?: string
  raw: any
}

const getLotSectionLabel = (lot: any): string | undefined => {
  const candidates = [
    lot?.section,
    lot?.section_name,
    lot?.sectionName,
    lot?.cemetery_sections?.name,
    lot?.section_label,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  return candidates[0]?.trim()
}

const getLotBlockLabel = (lot: any): string | undefined => {
  const candidates = [
    lot?.block,
    lot?.block_label,
    lot?.blockLabel,
    lot?.block_number,
    lot?.blockNumber,
    lot?.section_block,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  if (candidates[0]) return candidates[0].trim()

  const lotIdentifier = typeof lot?.lot_number === 'string' ? lot.lot_number : typeof lot?.id === 'string' ? lot.id : undefined
  if (lotIdentifier && lotIdentifier.includes('-')) {
    return lotIdentifier.split('-')[0]?.trim()
  }

  return undefined
}

const getLotNumberLabel = (lot: any): string | undefined => {
  const candidates = [lot?.lot_number, lot?.lotNumber, lot?.label]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  if (candidates[0]) return candidates[0].trim()
  if (typeof lot?.id === 'string' && lot.id.trim().length > 0) return lot.id.trim()
  return undefined
}

const getLotTypeLabel = (lot: any): string | undefined => {
  const candidates = [lot?.type, lot?.lot_type, lot?.lotType]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  return candidates[0]?.trim()
}

const lotIsAvailable = (lot: any): boolean => {
  const status = (lot?.status || lot?.lot_status || lot?.state || '').toString().toLowerCase()
  return status === 'available' || status === 'vacant'
}

const formatLotNumberLabel = (option: AvailableLotOption) => {
  const parts: string[] = [`Lot ${option.lotNumber}`]
  if (option.section) parts.push(option.section)
  if (option.block) parts.push(`Block ${option.block}`)
  if (option.lotType) parts.push(option.lotType)
  return parts.join(' • ')
}

const MapPin = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-8 w-8 text-blue-500", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Users = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-8 w-8 text-green-500", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20h-2.117A6.985 6.985 0 0123 17v-2a6 6 0 00-9-5.592M5 20H3v-2a6 6 0 019-5.592"
    />
  </svg>
)

const DollarSign = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-8 w-8 text-purple-500", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const MessageSquare = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-8 w-8 text-orange-500", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const Eye = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const LogOut = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const ArrowLeft = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const Search = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4 text-gray-400", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const Plus = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4 mr-2", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const Edit = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036a11.062 11.062 0 01-3.594.707l-1.582-.934a1 1 0 00-1.17.274l-1.17.174a1 1 0 00-.707.707l-.427 1.582a1 1 0 00.274 1.17l1.17.174a1 1 0 00.707.707l1.582.934a11.062 11.062 0 013.594-.707L19.036 7.036a2.5 2.5 0 00-3.536-3.536m-10 5.036a2.5 2.5 0 00-3.536 3.536L13.964 21.036a11.062 11.062 0 013.594.707l1.582.934a1 1 0 001.17-.274l1.17-.174a1 1 0 00.707-.707l.934-1.582a1 1 0 00-.274-1.17l-.174-1.17a1 1 0 00-.707-.707l-1.582-.934A11.062 11.062 0 0113.964 12z"
    />
  </svg>
)

const Trash2 = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12H5.067L4 7m2 0h12m-3 0a3 3 0 00-6 0m0 0H7m12 0a3 3 0 013 3v3a3 3 0 01-3 3H3a3 3 0 01-3-3v-3a3 3 0 013-3h12z"
    />
  </svg>
)

const Calendar = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-10 w-10 mb-3 text-amber-600", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M4 21h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const FileText = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-10 w-10 mb-3 text-teal-600", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m3-7v3a2 2 0 002 2h3m-3 3H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2H9z"
    />
  </svg>
)

const BarChart3 = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-10 w-10 mb-3 text-blue-600", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h18M3 17h18M3 21h18M4 7h18M7 14V3" />
  </svg>
)

const Send = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4 mr-2", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-6l-9-6l-9 6 9 6z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.4 6.824L12 11.395l6.6-4.571C17.654 6.749 15.98 6 14 6h-4c-1.98 0-3.654.749-4.6 1.824z"
    />
  </svg>
)

const CheckCircle = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4 text-green-500", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Clock = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const AlertCircle = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-4 w-4 text-orange-500", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Filter = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h16M4 8h16m-4 4h12m-8 4h8m-12 4h16" />
  </svg>
)

const ChevronDown = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const Download = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg {...props} className={mergeClasses("h-4 w-4 mr-2", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const Loader2 = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={mergeClasses("h-4 w-4 mr-2 animate-spin", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2v1m0 18v1M4.93 4.93l.707.707m12.728 12.728.707.707M21 12h-1M3 12h-1M12 4.93v.707M17.07 17.07l-.707.707M12 21v-1M4.93 19.07l.707-.707" />
    <path d="M12 18c2.968 0 5.705-1.234 7.727-3.348-.168.022-.34.032-.517.04C14.284 14.855 12.171 15 10.005 15c-2.176 0-4.289-.049-6.404-.154-.177-.008-.35-.018-.517-.04C6.295 16.765 9.032 18 12 18z" />
  </svg>
)

import { AIHelpWidget } from '@/components/ai-help-widget'

// Import Mail, Phone, and RefreshCw components
import { Mail, Phone, RefreshCw } from 'lucide-react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import * as XLSX from "xlsx"
import { NewsManager } from "@/components/news-manager"
// import MapManager from "@/components/map-manager" // Already imported above

// Import for messaging and activity logging
import { AdminNotificationBadge } from '@/components/admin-notification-badge'
import { getMessagesForUser, markMessageAsRead, sendMessage } from '@/lib/messaging-store'
import type { Message } from '@/lib/messaging-store'
import { logActivity } from '@/lib/activity-logger'
import { DashboardOverview } from '@/components/dashboard-overview'
import { logout } from '@/lib/dashboard-api'

// Import tab components
import { OverviewTab, LotsTab, MapsTab, NewsTab } from './components'

// CHANGE Renamed function from AdminDashboard to EmployeeDashboard
export default function EmployeeDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [burials, setBurials] = useState<any[]>([])

  const clientStatusCounts = useMemo(() => {
    const counts = {
      total: clients.length,
      active: 0,
      pending: 0,
      suspended: 0,
      archived: 0,
      deleted: 0,
      unknown: 0,
    }

    clients.forEach((client: any) => {
      const normalized = normalizeClientStatus(client?.status)
      switch (normalized) {
        case 'active':
          counts.active += 1
          break
        case 'pending':
        case 'inactive':
          counts.pending += 1
          break
        case 'suspended':
          counts.suspended += 1
          break
        case 'archived':
          counts.archived += 1
          break
        case 'deleted':
          counts.deleted += 1
          break
        default:
          counts.unknown += 1
          break
      }
    })

    return counts
  }, [clients])

  // UI States (activeTab removed - now using URL params)
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
  const [isAddBurialOpen, setIsAddBurialOpen] = useState(false)
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
  const [clientFormData, setClientFormData] = useState(createEmptyClientForm())
  const [mapSectionOptions, setMapSectionOptions] = useState<string[]>([])
  const [mapLotOptions, setMapLotOptions] = useState<AvailableLotOption[]>([])
  const [isLoadingMapLots, setIsLoadingMapLots] = useState(false)
  const [burialFormData, setBurialFormData] = useState({
    lotId: "",
    ownerId: "",
    deceasedName: "",
    familyName: "",
    age: "",
    dateOfDeath: "",
    burialDate: "",
    burialTime: "",
    cause: "",
    funeralHome: "",
    attendees: "",
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
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  const isCreateClientDisabled =
    !clientFormData.name.trim() ||
    !clientFormData.email.trim() ||
    !clientFormData.password ||
    clientFormData.password !== clientFormData.confirmPassword ||
    clientFormData.password.length < 6 ||
    !clientFormData.contractSection.trim() ||
    !clientFormData.contractBlock.trim() ||
    !clientFormData.contractLotNumber.trim() ||
    !clientFormData.contractLotType.trim() ||
    !clientFormData.selectedLotId.trim() ||
    !clientFormData.contractSignedAt ||
    !clientFormData.contractAuthorizedBy.trim() ||
    !clientFormData.contractAuthorizedPosition.trim()

  // Get real employee ID from authenticated user
  const getCurrentEmployeeInfo = (): EmployeeInfo | null => {
    if (typeof window === 'undefined') return null

    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user.role !== 'employee') return null
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          employeeRole: user.employeeRole,
        }
      } catch (e) {
        console.error('Error parsing currentUser:', e)
      }
    }
    return null
  }

  const currentEmployeeInfo = useMemo(() => getCurrentEmployeeInfo(), [])
  const currentEmployeeId = currentEmployeeInfo?.id || null

  const resetClientForm = useCallback(() => {
    const baseForm = createEmptyClientForm()
    const authorizedName = (currentEmployeeInfo?.name && currentEmployeeInfo.name.trim())
      || (currentEmployeeInfo?.username && currentEmployeeInfo.username.trim())
      || "Authorized Employee"
    const authorizedPosition = formatEmployeeRoleTitle(currentEmployeeInfo?.employeeRole || currentEmployeeInfo?.role)

    setClientFormData({
      ...baseForm,
      contractAuthorizedBy: authorizedName,
      contractAuthorizedPosition: authorizedPosition,
    })
  }, [currentEmployeeInfo])

  useEffect(() => {
    resetClientForm()
  }, [resetClientForm])
  const [isUpdatePaymentStatusOpen, setIsUpdatePaymentStatusOpen] = useState(false)
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("")

  // Approval Workflow States
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [isLoadingPendingActions, setIsLoadingPendingActions] = useState(false)
  const [showPendingActions, setShowPendingActions] = useState(false)

  const refreshMapLotOptions = useCallback(async () => {
    setIsLoadingMapLots(true)
    try {
      const maps = await mapStoreApi.getMaps()

      const sections = new Set<string>()
      const options: AvailableLotOption[] = []

      maps.forEach((map) => {
        const mapName = map?.name?.trim()
        if (mapName) sections.add(mapName)

        map?.lots?.forEach((lot) => {
          if (!lot) return
          const status = (lot.status || "").toString().toLowerCase()
          if (status !== "vacant") return
          const lotId = typeof lot.id === "string" ? lot.id.trim() : ""
          if (!isValidUUID(lotId)) {
            return
          }

          const lotNumber =
            (typeof (lot as any).lot_number === "string" && (lot as any).lot_number.trim()) ||
            (typeof (lot as any).lotNumber === "string" && (lot as any).lotNumber.trim()) ||
            lotId
          if (!lotNumber) return

          const normalizedLotType = normalizeLotTypeLabel((lot as any).lotType)
          const blockId = deriveBlockId(mapName, normalizedLotType)

          options.push({
            id: lotId,
            section: mapName,
            block: (lot as any).block || (lot as any).blockLabel || blockId,
            lotNumber,
            lotType: normalizedLotType,
            raw: { ...lot, mapName },
          })
        })
      })

      setMapSectionOptions(Array.from(sections).sort((a, b) => a.localeCompare(b)))
      setMapLotOptions(options)
    } catch (error) {
      console.error("[EmployeeDashboard] Failed to load map sections", error)
    } finally {
      setIsLoadingMapLots(false)
    }
  }, [])

  const handleDeleteClient = async (client: any) => {
    try {
      const response = await deleteClientInDB(client.id)

      if (!response.success) {
        toast({
          title: "Delete Failed",
          description: response.error || "Unable to delete client. They may have existing payments.",
          variant: "destructive",
        })
        return
      }

      const updatedClients = clients.filter((c: any) => c.id !== client.id)
      setClients(updatedClients)

      const updatedDashboardData = {
        ...dashboardData,
        clients: updatedClients,
        stats: {
          ...dashboardData.stats,
          totalClients: updatedClients.length,
        },
      }
      setDashboardData(updatedDashboardData)

      toast({
        title: "Client Deleted",
        description: `${client.name} has been removed from the active client list.`,
        variant: "destructive",
      })
    } catch (error: any) {
      console.error('[Employee Dashboard] Failed to delete client:', error)
      toast({
        title: "Delete Failed",
        description: error?.message || "Unable to delete client. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    refreshMapLotOptions()
  }, [refreshMapLotOptions])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => refreshMapLotOptions()
    window.addEventListener(MAP_LOTS_UPDATED_EVENT, handler)
    return () => {
      window.removeEventListener(MAP_LOTS_UPDATED_EVENT, handler)
    }
  }, [refreshMapLotOptions])

  // Load pending actions for current employee
  const loadPendingActions = async () => {
    if (!currentEmployeeId) {
      console.warn('[Pending Actions] No currentEmployeeId, skipping load');
      return;
    }

    console.log('[Pending Actions] Loading for employee:', currentEmployeeId);
    setIsLoadingPendingActions(true);
    try {
      const response = await listMyPendingActions(currentEmployeeId, {
        status: ['pending', 'approved', 'rejected']
      });

      console.log('[Pending Actions] Response:', response);

      if (response.success) {
        console.log('[Pending Actions] Loaded:', response.data.length, 'actions');
        setPendingActions(response.data);

        // Check if any actions were recently executed (approved in last 5 minutes and executed)
        const recentlyExecuted = response.data.filter((action: any) => {
          if (action.status === 'approved' && action.is_executed && action.executed_at) {
            const executedTime = new Date(action.executed_at).getTime();
            const now = Date.now();
            const fiveMinutesAgo = now - (5 * 60 * 1000);
            return executedTime > fiveMinutesAgo;
          }
          return false;
        });

        // If there are recently executed actions, auto-refresh dashboard data
        if (recentlyExecuted.length > 0) {
          console.log('[Pending Actions] Found recently executed actions, auto-refreshing dashboard...');
          setTimeout(() => {
            refreshDashboard();
          }, 1000);
        }
      } else {
        console.error('[Pending Actions] Failed to load:', response.error);
      }
    } catch (error) {
      console.error('[Pending Actions] Error:', error);
    } finally {
      setIsLoadingPendingActions(false);
    }
  };

  // Load messages from store
  const loadMessages = async () => {
    const adminUsername = localStorage.getItem('employeeUser') || 'employee' // Use employeeUser
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
      router.push('/admin/employee/login')
      return
    }

    // Verify it's actually an employee role
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        if (user.role !== 'employee') {
          console.log("[v0] User is not employee role, redirecting")
          router.push('/admin/employee/login')
          return
        }
      } catch (e) {
        console.error("[v0] Error parsing currentUser:", e)
      }
    }

    console.log("[v0] Employee authenticated, continuing to dashboard")
  }, [router])

  // Load pending actions when component mounts
  useEffect(() => {
    loadPendingActions();
  }, []);

  // Manual refresh function
  const refreshDashboard = async () => {
    console.log('[Dashboard] Manual refresh triggered')
    setIsLoading(true)

    try {
      const response = await fetchDashboardData()

      if (response.success && response.data) {
        console.log('[Dashboard] Data refreshed successfully:', response.data)
        setDashboardData(response.data)
        setInquiries(response.data.pendingInquiries || [])
        setLots(response.data.lots || [])
        setClients(response.data.clients || [])
        setPayments(response.data.payments || [])
        setBurials(response.data.burials || [])

        toast({
          title: "Refreshed ✓",
          description: "Dashboard data has been updated",
        })
      } else {
        toast({
          title: "Refresh Failed",
          description: response.error || "Failed to refresh data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('[Dashboard] Refresh error:', error)
      toast({
        title: "Error",
        description: "Failed to refresh dashboard",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize dashboard data from Supabase
  useEffect(() => {
    async function loadDashboardFromSupabase() {
      setIsMounted(true)
      setIsLoading(true)

      try {
        console.log('[Dashboard] Fetching data from Supabase...')
        const response = await fetchDashboardData()

        if (response.success && response.data) {
          console.log('[Dashboard] Data loaded successfully:', response.data)
          setDashboardData(response.data)
          setInquiries(response.data.pendingInquiries || [])
          setLots(response.data.lots || [])
          setClients(response.data.clients || [])
          setPayments(response.data.payments || [])
          setBurials(response.data.burials || [])
        } else {
          console.error('[Dashboard] Error loading data:', response.error)
          // Set empty arrays if loading fails
          setDashboardData({
            lots: [],
            clients: [],
            payments: [],
            burials: [],
            pendingInquiries: [],
            recentBurials: [],
            stats: {
              totalLots: 0,
              occupiedLots: 0,
              availableLots: 0,
              totalClients: 0,
              monthlyRevenue: 0,
              pendingInquiries: 0,
              overduePayments: 0
            }
          })
          setInquiries([])
          setLots([])
          setClients([])
          setPayments([])
          setBurials([])
        }
      } catch (error) {
        console.error('[Dashboard] Unexpected error loading data:', error)
        // Set empty arrays on error
        setDashboardData({
          lots: [],
          clients: [],
          payments: [],
          burials: [],
          pendingInquiries: [],
          recentBurials: [],
          stats: {
            totalLots: 0,
            occupiedLots: 0,
            availableLots: 0,
            totalClients: 0,
            monthlyRevenue: 0,
            pendingInquiries: 0,
            overduePayments: 0
          }
        })
        setInquiries([])
        setLots([])
        setClients([])
        setPayments([])
        setBurials([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardFromSupabase()
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

  useEffect(() => {
    if (typeof window === "undefined") return

    let isRunning = false

    const tick = async () => {
      if (isRunning) return
      isRunning = true
      try {
        const response = await fetch('/api/notifications/demo-reminders?intervalMinutes=5&lookaheadDays=7', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
        await response.json().catch(() => ({}))
      } catch (error) {
        console.error('[Employee Dashboard] Auto demo reminder tick failed:', error)
      } finally {
        isRunning = false
      }
    }

    const intervalMs = 5 * 60 * 1000
    const intervalId = window.setInterval(tick, intervalMs)

    tick()

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const demoClients = (clients || []).filter((client: any) => {
      const schedule = client?.preferred_payment_schedule || client?.preferredPaymentSchedule
      return schedule === 'demo_1min'
    })

    if (demoClients.length === 0) return

    let isRunning = false

    const tick = async () => {
      if (isRunning) return
      isRunning = true
      try {
        await Promise.all(
          demoClients.map(async (client: any) => {
            if (!client?.id) return
            const response = await fetch('/api/notifications/demo-reminders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clientId: client.id,
                intervalMinutes: 1,
                limit: 1,
                lookaheadDays: 7,
              }),
            })
            await response.json().catch(() => ({}))
          })
        )
      } catch (error) {
        console.error('[Employee Dashboard] Auto 1-min demo reminder tick failed:', error)
      } finally {
        isRunning = false
      }
    }

    const intervalMs = 1 * 60 * 1000
    const intervalId = window.setInterval(tick, intervalMs)

    tick()

    return () => {
      window.clearInterval(intervalId)
    }
  }, [clients])

  const handleViewMessage = (msg: Message) => {
    setSelectedMessage(msg)
    markMessageAsRead(msg.id)
    loadMessages()
  }

  const handleReplyMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !replyText) return

    const adminUser = localStorage.getItem('employeeUser') || 'employee' // Use employeeUser
    sendMessage(adminUser, 'superadmin', `Re: ${selectedMessage.subject}`, replyText, 'normal', 'reply', selectedMessage.id)

    logActivity(adminUser, 'MESSAGE_REPLY', `Replied to super admin message: ${selectedMessage.subject}`, 'success', 'system')

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

    const adminUser = localStorage.getItem('employeeUser') || 'employee' // Use employeeUser
    logActivity(
      adminUser,
      'LOT_CREATED',
      `Created lot ${lotFormData.id} in section ${lotFormData.section}`,
      'success',
      'lot',
      [lotFormData.id]
    )
  }

  const handleEditLot = () => {
    const lotIndex = dashboardData.lots.findIndex((lot: any) => lot.id === selectedLot?.id)
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
    }

    toast({
      title: "Lot Updated Successfully",
      description: `Lot ${selectedLot?.id} has been updated.`,
    })
    setIsEditLotOpen(false)
  }

  const handleDeleteLot = (lot: any) => {
    const lotIndex = dashboardData.lots.findIndex((l: any) => l.id === lot.id)
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

  const handleAddClient = async () => {
    // Validate required fields
    if (!clientFormData.name.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Client name is required.",
        variant: "destructive",
      })
      return
    }

    if (!clientFormData.email || !clientFormData.password || !clientFormData.confirmPassword) {
      toast({
        title: "Missing Required Fields",
        description: "Email and password are required to create a client account.",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientFormData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Check if email already exists
    const emailCheck = await checkClientEmailExists(clientFormData.email)
    if (emailCheck.exists) {
      toast({
        title: "Email Already Exists",
        description: "A client with this email address already exists. Please use a different email.",
        variant: "destructive",
      })
      return
    }

    // Validate password match
    if (clientFormData.password !== clientFormData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    // Validate password strength (minimum 6 characters)
    if (clientFormData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    const requiredContractFields = [
      { value: clientFormData.contractSection.trim(), label: 'Section' },
      { value: clientFormData.contractBlock.trim(), label: 'Block' },
      { value: clientFormData.contractLotNumber.trim(), label: 'Lot Number' },
      { value: clientFormData.contractLotType.trim(), label: 'Lot Type' },
      { value: clientFormData.contractSignedAt, label: 'Contract Signed Date' },
      { value: clientFormData.contractAuthorizedBy.trim(), label: 'Authorized Signatory' },
      { value: clientFormData.contractAuthorizedPosition.trim(), label: 'Authorized Position' }
    ]

    const missingContractField = requiredContractFields.find((field) => !field.value)
    if (missingContractField) {
      toast({
        title: 'Missing Contract Detail',
        description: `${missingContractField.label} is required for the ownership certificate.`,
        variant: 'destructive'
      })
      return
    }
    try {
      // Prepare client data for database (only use fields that exist in schema)
      // Note: clients table uses email for login, not username
      const clientData: any = {
        name: clientFormData.name,
        email: clientFormData.email,
        phone: clientFormData.phone,
        address: clientFormData.address,
        status: "inactive", // Start as inactive until cashier processes first payment
        password_hash: clientFormData.password, // Will be hashed in API
        balance: 0,
        contract_section: clientFormData.contractSection,
        contract_block: clientFormData.contractBlock,
        contract_lot_number: clientFormData.contractLotNumber,
        contract_lot_type: clientFormData.contractLotType,
        contract_signed_at: clientFormData.contractSignedAt,
        contract_authorized_by: clientFormData.contractAuthorizedBy,
        contract_authorized_pos: clientFormData.contractAuthorizedPosition,
        lot_id: clientFormData.selectedLotId,
        preferred_payment_method: clientFormData.preferredPaymentMethod,
        preferred_payment_schedule: clientFormData.preferredPaymentSchedule,
      }

      if (process.env.NODE_ENV !== 'production') {
        const { password_hash: ignored, ...safeClientData } = clientData
        console.log('[handleAddClient] Submitting client payload:', {
          ...safeClientData,
          lot_id_present: Boolean(clientData.lot_id),
          contractLotNumber: clientFormData.contractLotNumber,
        })
      }

      // Add optional fields only if they have values (match database schema)
      if (clientFormData.emergencyContact) {
        clientData.emergency_contact_name = clientFormData.emergencyContact
      }
      if (clientFormData.emergencyPhone) {
        clientData.emergency_contact_phone = clientFormData.emergencyPhone
      }
      if (clientFormData.notes) {
        clientData.notes = clientFormData.notes
      }

      // Check if approval is required for client creation
      const approvalCheck = await checkApprovalRequired('client_create')

      if (approvalCheck.required) {
        // Submit for approval workflow
        const approvalRequest = {
          action_type: 'client_create' as const,
          target_entity: 'client' as const,
          change_data: clientData,
          notes: `Create new client account for ${clientFormData.name}`,
          priority: 'normal' as const
        }

        const response = await submitPendingAction(approvalRequest, currentEmployeeId!)

        if (response.success) {
          toast({
            title: "Submitted for Approval ⏳",
            description: `Client account for ${clientFormData.name} has been submitted for admin approval.`,
          })

          // Refresh pending actions
          loadPendingActions()
        } else {
          toast({
            title: "Submission Failed",
            description: response.error || "Failed to submit client creation for approval.",
            variant: "destructive",
          })
        }
      } else {
        // Create directly if approval not required
        const response = await createClientInDB(clientData)

        if (response.success && response.data) {
          // Update local state with new client
          const updatedClients = [...clients, response.data]
          setClients(updatedClients)

          // Update dashboardData
          const updatedDashboardData = {
            ...dashboardData,
            clients: updatedClients,
            stats: {
              ...dashboardData.stats,
              totalClients: updatedClients.length
            }
          }
          setDashboardData(updatedDashboardData)

          toast({
            title: "Client Account Created ✅",
            description: `${clientFormData.name} has been added as a pending client. Their portal access will be activated after the cashier records their first payment.`,
          })
        } else {
          toast({
            title: "Creation Failed",
            description: response.error || "Failed to create client account.",
            variant: "destructive",
          })
          return
        }
      }

      // Close dialog and reset form
      resetClientForm()
      setIsAddClientOpen(false)

    } catch (error) {
      console.error('[handleAddClient] Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the client account.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateClient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!selectedClient) return

    const updateData = {
      name: clientFormData.name,
      email: clientFormData.email,
      phone: clientFormData.phone,
      address: clientFormData.address,
      emergencyContact: clientFormData.emergencyContact,
      emergencyPhone: clientFormData.emergencyPhone,
      notes: clientFormData.notes,
      contractSection: clientFormData.contractSection,
      contractBlock: clientFormData.contractBlock,
      contractLotNumber: clientFormData.contractLotNumber,
      contractLotType: clientFormData.contractLotType,
      contractSignedAt: clientFormData.contractSignedAt,
      contractAuthorizedBy: clientFormData.contractAuthorizedBy,
      contractAuthorizedPosition: clientFormData.contractAuthorizedPosition,
      preferredPaymentMethod: clientFormData.preferredPaymentMethod,
      preferredPaymentSchedule: clientFormData.preferredPaymentSchedule,
    }

    try {
      // Check if approval is required for client updates
      const approvalCheck = await checkApprovalRequired('client_update')

      if (approvalCheck.required && currentEmployeeId) {
        // Submit for approval workflow
        const approvalRequest = {
          action_type: 'client_update' as const,
          target_entity: 'client' as const,
          target_id: selectedClient.id,
          change_data: updateData,
          previous_data: {
            name: selectedClient.name,
            email: selectedClient.email,
            phone: selectedClient.phone,
            address: selectedClient.address,
            emergencyContact: selectedClient.emergencyContact,
            emergencyPhone: selectedClient.emergencyPhone,
            notes: selectedClient.notes,
            contractSection: selectedClient.contractSection,
            contractBlock: selectedClient.contractBlock,
            contractLotNumber: selectedClient.contractLotNumber,
            contractLotType: selectedClient.contractLotType,
            contractSignedAt: selectedClient.contractSignedAt,
            contractAuthorizedBy: selectedClient.contractAuthorizedBy,
            contractAuthorizedPosition: selectedClient.contractAuthorizedPosition,
          },
          notes: `Update client ${selectedClient.name}`,
          priority: 'normal' as const
        }

        const response = await submitPendingAction(approvalRequest, currentEmployeeId)

        if (response.success) {
          toast({
            title: 'Submitted for Approval',
            description: `Client update request for ${clientFormData.name} has been submitted to admin for review.`,
          })

          const adminUser = localStorage.getItem('employeeUser') || 'employee'
          logActivity(
            adminUser,
            'CLIENT_UPDATE_SUBMITTED',
            `Submitted update request for client ${selectedClient.name}`,
            'success',
            'client',
            [selectedClient.id]
          )
        } else {
          toast({
            title: 'Submission Failed',
            description: response.error || 'Failed to submit for approval.',
            variant: 'destructive',
          })
        }
      } else {
        // Direct update without approval
        const clientIndex = dashboardData.clients.findIndex((client: any) => client.id === selectedClient?.id)
        if (clientIndex !== -1) {
          const updatedData = { ...dashboardData }
          updatedData.clients[clientIndex] = {
            ...updatedData.clients[clientIndex],
            ...updateData
          }

          setDashboardData(updatedData)
        }

        toast({
          title: 'Client Updated Successfully',
          description: `${clientFormData.name}'s information has been updated.`,
        })

        const adminUser = localStorage.getItem('employeeUser') || 'employee'
        logActivity(
          adminUser,
          'CLIENT_UPDATED',
          `Updated client ${selectedClient.name}`,
          'success',
          'client',
          [selectedClient.id]
        )
      }

      setIsEditClientOpen(false)
    } catch (error: any) {
      console.error('Error updating client:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update client. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReplyInquiry = () => {
    const inquiryIndex = inquiries.findIndex((inquiry: any) => inquiry.id === selectedInquiry?.id)
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
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq: any) => inq.id === selectedInquiry?.id)
      const updatedGlobalData = { ...dashboardData }
      if (globalInquiryIndex !== -1) {
        updatedGlobalData.pendingInquiries[globalInquiryIndex] = updatedInquiry
      }

      setInquiries(updatedInquiries)
      setDashboardData(updatedGlobalData)
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
    const inquiryIndex = inquiries.findIndex((inq: any) => inq.id === inquiry.id)
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
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq: any) => inq.id === inquiry.id)
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
    const inquiryIndex = inquiries.findIndex((inq: any) => inq.id === inquiry.id)
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
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq: any) => inq.id === inquiry.id)
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
    const inquiryIndex = inquiries.findIndex((inq: any) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        assignedTo: assignee,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq: any) => inq.id === inquiry.id)
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
    const inquiryIndex = inquiries.findIndex((inq: any) => inq.id === inquiry.id)
    if (inquiryIndex !== -1) {
      const updatedInquiry = {
        ...inquiries[inquiryIndex],
        priority: priority,
      }

      const updatedInquiries = [...inquiries]
      updatedInquiries[inquiryIndex] = updatedInquiry

      // Update global data
      const globalInquiryIndex = dashboardData.pendingInquiries.findIndex((inq: any) => inq.id === inquiry.id)
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

  const handleResendClientDocuments = async () => {
    if (!selectedClient?.id) {
      toast({
        title: "No client selected",
        description: "Please select a client first.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/client/email-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId: selectedClient.id }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.success === false) {
        toast({
          title: "Email Failed",
          description: data?.error || "Unable to send documents. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Documents Sent",
        description: `Contract and invoices have been emailed to ${selectedClient.email}.`,
      })
    } catch (error: any) {
      console.error('[Employee Dashboard] Failed to email client documents:', error)
      toast({
        title: "Email Failed",
        description: error?.message || "Unable to send documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendDemoReminder = async () => {
    if (!selectedClient?.id) {
      toast({
        title: "No client selected",
        description: "Please select a client first.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/notifications/demo-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          intervalMinutes: 1,
          limit: 1,
          lookaheadDays: 7,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.success === false) {
        toast({
          title: "Reminder Failed",
          description: data?.error || "Unable to send reminder. Please try again.",
          variant: "destructive",
        })
        return
      }

      const count = typeof data?.remindersSent === 'number' ? data.remindersSent : 1
      toast({
        title: "Reminder Sent",
        description: `Demo reminder email sent to ${selectedClient.email}. (${count} reminder${count === 1 ? '' : 's'} queued)`,
      })
    } catch (error: any) {
      console.error('[Employee Dashboard] Failed to send demo reminder:', error)
      toast({
        title: "Reminder Failed",
        description: error?.message || "Unable to send reminder. Please try again.",
        variant: "destructive",
      })
    }
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
        const lotIndex = updatedData.lots.findIndex((l: any) => l.id === lotId)
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

  const resetBurialForm = () => {
    setBurialFormData({
      lotId: "",
      ownerId: "",
      deceasedName: "",
      familyName: "",
      age: "",
      dateOfDeath: "",
      burialDate: "",
      burialTime: "",
      cause: "",
      funeralHome: "",
      attendees: "",
      notes: "",
    })
  }

  const handleLotSelectForBurial = (lotId: string) => {
    const ownerByLot = dashboardData?.clients?.find((client: any) => (client.lots || []).includes(lotId))
    setBurialFormData((prev) => ({
      ...prev,
      lotId,
      ownerId: ownerByLot ? String(ownerByLot.id) : prev.ownerId,
    }))
  }

  const handleAddBurial = async () => {
    if (
      !burialFormData.lotId ||
      !burialFormData.ownerId ||
      !burialFormData.deceasedName ||
      !burialFormData.burialDate ||
      !burialFormData.burialTime
    ) {
      toast({
        title: "Missing Information",
        description: "Lot, owner, deceased name, burial date, and time are required.",
        variant: "destructive",
      })
      return
    }

    const lot = dashboardData?.lots?.find((l: any) => l.id === burialFormData.lotId)
    if (!lot) {
      toast({
        title: "Lot Not Found",
        description: "Please select a valid lot for this burial.",
        variant: "destructive",
      })
      return
    }

    if (lot.status === "Occupied") {
      toast({
        title: "Lot Already Occupied",
        description: `Lot ${lot.id} already has an occupant. Please choose another lot.`,
        variant: "destructive",
      })
      return
    }

    const ownerRecord = dashboardData?.clients?.find((client: any) => String(client.id) === burialFormData.ownerId)

    // Check if approval is required for burial creation
    try {
      const approvalCheck = await checkApprovalRequired('burial_create')

      if (approvalCheck.required && currentEmployeeId) {
        // Submit for approval workflow
        const burialData = {
          deceasedName: burialFormData.deceasedName,
          familyName: burialFormData.familyName || ownerRecord?.name || "Family",
          lotId: burialFormData.lotId,
          ownerId: burialFormData.ownerId,
          burialDate: burialFormData.burialDate,
          burialTime: burialFormData.burialTime,
          age: burialFormData.age ? Number(burialFormData.age) : undefined,
          cause: burialFormData.cause || "N/A",
          funeralHome: burialFormData.funeralHome || "N/A",
          attendees: burialFormData.attendees ? Number(burialFormData.attendees) : 0,
          notes: burialFormData.notes || "",
          ownerName: ownerRecord?.name || lot.owner || "",
        }

        const approvalRequest = {
          action_type: 'burial_create' as const,
          target_entity: 'burial' as const,
          change_data: burialData,
          notes: `Create burial record for ${burialFormData.deceasedName} at Lot ${lot.id}`,
          priority: 'high' as const
        }

        const response = await submitPendingAction(approvalRequest, currentEmployeeId)

        if (response.success) {
          toast({
            title: 'Submitted for Approval',
            description: `Burial record for ${burialFormData.deceasedName} has been submitted to admin for review.`,
          })
          resetBurialForm()
          setIsAddBurialOpen(false)
          return
        } else {
          toast({
            title: 'Submission Failed',
            description: response.error || 'Failed to submit for approval.',
            variant: 'destructive',
          })
          return
        }
      }
    } catch (error: any) {
      console.error('Error checking approval:', error)
    }

    // Direct creation without approval (if not required or approval check failed)

    const newBurial = {
      id: `burial-${Date.now()}`,
      name: burialFormData.deceasedName,
      family: burialFormData.familyName || ownerRecord?.name || "Family",
      lot: lot.id,
      date: burialFormData.burialDate,
      burial: burialFormData.burialTime,
      age: burialFormData.age ? Number(burialFormData.age) : undefined,
      cause: burialFormData.cause || "N/A",
      funeral: burialFormData.funeralHome || "N/A",
      attendees: burialFormData.attendees ? Number(burialFormData.attendees) : 0,
      notes: burialFormData.notes || "",
      ownerName: ownerRecord?.name || lot.owner || "",
    }

    const updatedBurials = [newBurial, ...(dashboardData?.burials || [])]
    const updatedRecentBurials = [newBurial, ...(dashboardData?.recentBurials || [])].slice(0, 5)

    const updatedLots = (dashboardData?.lots || []).map((existingLot: any) => {
      if (existingLot.id !== lot.id) return existingLot
      return {
        ...existingLot,
        status: "Occupied",
        occupant: newBurial.name,
        occupant_name: newBurial.name,
        owner: ownerRecord?.name || existingLot.owner,
        owner_id: ownerRecord?.id ?? existingLot.owner_id,
      }
    })

    const updatedStats = { ...(dashboardData?.stats || {}) }
    if (lot.status !== "Occupied") {
      if (lot.status === "Available" && typeof updatedStats.availableLots === "number" && updatedStats.availableLots > 0) {
        updatedStats.availableLots -= 1
      }
      if (typeof updatedStats.occupiedLots === "number") {
        updatedStats.occupiedLots += 1
      }
    }

    const updatedClients = (dashboardData?.clients || []).map((client: any) => {
      if (String(client.id) !== burialFormData.ownerId) return client
      const ownedLots = client.lots || []
      if (ownedLots.includes(lot.id)) return client
      return {
        ...client,
        lots: [...ownedLots, lot.id],
      }
    })

    const updatedData = {
      ...(dashboardData || {}),
      burials: updatedBurials,
      recentBurials: updatedRecentBurials,
      lots: updatedLots,
      clients: updatedClients,
      stats: updatedStats,
    }

    setDashboardData(updatedData)
    setBurials(updatedBurials)
    setClients(updatedClients)

    try {
      await updateLot(lot.id, {
        status: "Occupied",
        owner_id: ownerRecord ? String(ownerRecord.id) : burialFormData.ownerId,
        occupant_name: burialFormData.deceasedName,
      })
    } catch (error) {
      console.error("[Burial] Failed syncing lot", error)
    }

    resetBurialForm()
    setIsAddBurialOpen(false)
    toast({
      title: "Burial Recorded",
      description: `${newBurial.name} has been scheduled for Lot ${lot.id}.`,
    })
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
          data: dashboardData.lots.map((lot: any) => ({
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
              total: dashboardData.lots.filter((lot: any) => lot.section === "Garden of Peace").length,
              occupied: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Peace" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Peace" && lot.status === "Available",
              ).length,
            },
            {
              name: "Garden of Serenity",
              total: dashboardData.lots.filter((lot: any) => lot.section === "Garden of Serenity").length,
              occupied: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Serenity" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Serenity" && lot.status === "Available",
              ).length,
            },
            {
              name: "Garden of Tranquility",
              total: dashboardData.lots.filter((lot: any) => lot.section === "Garden of Tranquility").length,
              occupied: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Tranquility" && lot.status === "Occupied",
              ).length,
              available: dashboardData.lots.filter(
                (lot: any) => lot.section === "Garden of Tranquility" && lot.status === "Available",
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
            totalRevenue: formatCurrency(dashboardData.payments.reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            paidPayments: dashboardData.payments.filter((payment: any) => payment.status === "Paid").length,
            underPaymentPayments: dashboardData.payments.filter((payment: any) => payment.status === "Under Payment").length,
            overduePayments: dashboardData.payments.filter((payment: any) => payment.status === "Overdue").length,
            averagePayment: formatCurrency(
              dashboardData.payments.reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0) / dashboardData.payments.length || 0
            ),
          },
          data: dashboardData.payments.map((payment: any) => ({
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
              count: dashboardData.payments.filter((payment: any) => payment.type === "Full Payment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.type === "Full Payment")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            },
            {
              type: "Down Payment",
              count: dashboardData.payments.filter((payment: any) => payment.type === "Down Payment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.type === "Down Payment")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            },
            {
              type: "Installment",
              count: dashboardData.payments.filter((payment: any) => payment.type === "Installment").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.type === "Installment")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
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
            activeClients: dashboardData.clients.filter((client: any) => client.status === "Active").length,
            inactiveClients: dashboardData.clients.filter((client: any) => client.status !== "Active").length,
            clientsWithBalance: dashboardData.clients.filter((client: any) => client.balance > 0).length,
          },
          data: dashboardData.clients.map((client: any) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            lots: (client.lots || []).join(", "),
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
              dashboardData.burials.reduce((sum: any, burial: any) => sum + burial.age, 0) / dashboardData.burials.length,
            ),
            largestAttendance: Math.max(...dashboardData.burials.map((burial: any) => burial.attendees)),
          },
          data: dashboardData.burials.map((burial: any) => ({
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
            paidPayments: dashboardData.payments.filter((payment: any) => payment.status === "Paid").length,
            underPaymentPayments: dashboardData.payments.filter((payment: any) => payment.status === "Under Payment").length,
            overduePayments: dashboardData.payments.filter((payment: any) => payment.status === "Overdue").length,
            totalAmount: formatCurrency(dashboardData.payments.reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
          },
          data: dashboardData.payments.map((payment: any) => ({
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
              count: dashboardData.payments.filter((payment: any) => payment.method === "Bank Transfer").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.method === "Bank Transfer")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Credit Card",
              count: dashboardData.payments.filter((payment: any) => payment.method === "Credit Card").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.method === "Credit Card")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Cash",
              count: dashboardData.payments.filter((payment: any) => payment.method === "Cash").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.method === "Cash")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
            },
            {
              method: "Online Banking",
              count: dashboardData.payments.filter((payment: any) => payment.method === "Online Banking").length,
              total: formatCurrency(dashboardData.payments
                .filter((payment: any) => payment.method === "Online Banking")
                .reduce((sum: any, payment: any) => sum + (payment.amount || 0), 0)),
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
      ...createEmptyClientForm(),
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      emergencyContact: client.emergencyContact || "",
      emergencyPhone: client.emergencyPhone || "",
      notes: client.notes || "",
      contractSection: client.contract_section || client.contractSection || "",
      contractBlock: client.contract_block || client.contractBlock || "",
      contractLotNumber: client.contract_lot_number || client.contractLotNumber || "",
      contractLotType: client.contract_lot_type || client.contractLotType || "",
      contractSignedAt: client.contract_signed_at || client.contractSignedAt || "",
      contractAuthorizedBy: client.contract_authorized_by || client.contractAuthorizedBy || "",
      contractAuthorizedPosition: client.contract_authorized_pos || client.contractAuthorizedPosition || "",
      preferredPaymentMethod: client.preferred_payment_method || client.preferredPaymentMethod || "cash",
      preferredPaymentSchedule: client.preferred_payment_schedule || client.preferredPaymentSchedule || "monthly",
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
    if (!client) return
    setSelectedClient(client)
    setMessageFormData({
      subject: "",
      message: "",
      type: "general",
    })
    setIsMessageClientOpen(true)
  }

  const dashboardLots: any[] = Array.isArray(dashboardData?.lots) ? dashboardData!.lots : []

  // Filter functions for search bars
  const filteredLots = dashboardLots.filter(
    (lot: any) =>
      lot.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.section?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.type?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.status?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lot.owner && lot.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lot.occupant && lot.occupant.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const availableLotOptions = useMemo<AvailableLotOption[]>(() => {
    const options: AvailableLotOption[] = []
    const seen = new Set<string>()

    const pushOption = (option: AvailableLotOption) => {
      const key = option.id || `${option.section}-${option.block}-${option.lotNumber}`
      if (!key || seen.has(key)) return
      seen.add(key)
      options.push(option)
    }

    dashboardLots
      .filter(lotIsAvailable)
      .forEach((lot: any) => {
        const lotNumber = getLotNumberLabel(lot)
        if (!lotNumber) return
        pushOption({
          id: lot.id || lot.lot_id || lotNumber,
          section: getLotSectionLabel(lot),
          block: getLotBlockLabel(lot),
          lotNumber,
          lotType: getLotTypeLabel(lot),
          raw: lot,
        })
      })

    mapLotOptions.forEach((option) => {
      pushOption(option)
    })

    return options
  }, [dashboardLots, mapLotOptions])

  const lotsFilteredBySection = useMemo(() => {
    if (!clientFormData.contractSection) return availableLotOptions
    return availableLotOptions.filter((option) => option.section === clientFormData.contractSection)
  }, [availableLotOptions, clientFormData.contractSection])

  const lotsFilteredByBlock = useMemo(() => {
    if (!clientFormData.contractBlock) return lotsFilteredBySection
    return lotsFilteredBySection.filter((option) => option.block === clientFormData.contractBlock)
  }, [lotsFilteredBySection, clientFormData.contractBlock])

  const selectedClientPayments = useMemo(() => {
    if (!selectedClient) return []
    return payments.filter((payment: any) => payment.client_id === selectedClient.id)
  }, [selectedClient, payments])

  const selectedClientHasDocuments = useMemo(() => {
    if (!selectedClient) return false
    if (selectedClient.contract_pdf_url) return true
    return selectedClientPayments.some((payment: any) => payment.invoice_pdf_url)
  }, [selectedClient, selectedClientPayments])

  const sectionOptions = useMemo(() => {
    const sections = new Set<string>(mapSectionOptions)
    availableLotOptions.forEach((option) => {
      if (option.section) sections.add(option.section)
    })
    if (clientFormData.contractSection?.trim()) {
      sections.add(clientFormData.contractSection.trim())
    }
    return Array.from(sections).sort((a, b) => a.localeCompare(b))
  }, [availableLotOptions, clientFormData.contractSection, mapSectionOptions])

  const blockOptions = useMemo(() => {
    const blocks = new Set<string>()
    lotsFilteredBySection.forEach((option) => {
      if (option.block) blocks.add(option.block)
    })
    if (clientFormData.contractBlock?.trim()) {
      blocks.add(clientFormData.contractBlock.trim())
    }
    return Array.from(blocks).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  }, [lotsFilteredBySection, clientFormData.contractBlock])

  const lotTypeOptions = useMemo(() => {
    const lotTypes = new Set<string>()
    lotsFilteredBySection.forEach((option) => {
      if (option.lotType) lotTypes.add(option.lotType)
    })
    if (clientFormData.contractLotType?.trim()) {
      lotTypes.add(clientFormData.contractLotType.trim())
    }
    return Array.from(lotTypes).sort((a, b) => a.localeCompare(b))
  }, [lotsFilteredBySection, clientFormData.contractLotType])

  const lotNumberOptions = useMemo<AvailableLotOption[]>(() => {
    const baseOptions = [...lotsFilteredByBlock]
    if (clientFormData.contractLotNumber?.trim()) {
      const exists = baseOptions.some((option) => option.lotNumber === clientFormData.contractLotNumber)
      if (!exists) {
        return [
          {
            id: `existing-${clientFormData.contractLotNumber}`,
            section: clientFormData.contractSection || undefined,
            block: clientFormData.contractBlock || undefined,
            lotNumber: clientFormData.contractLotNumber,
            lotType: clientFormData.contractLotType || undefined,
            raw: null,
          },
          ...baseOptions,
        ]
      }
    }
    return baseOptions
  }, [
    lotsFilteredByBlock,
    clientFormData.contractLotNumber,
    clientFormData.contractSection,
    clientFormData.contractBlock,
    clientFormData.contractLotType,
  ])

  const selectedLotOptionValue = useMemo(() => {
    if (clientFormData.selectedLotId) {
      const matchById = lotNumberOptions.find((option) => option.id === clientFormData.selectedLotId)
      if (matchById) return matchById.id
    }
    if (clientFormData.contractLotNumber) {
      const fallback = lotNumberOptions.find((option) => option.lotNumber === clientFormData.contractLotNumber)
      if (fallback) return fallback.id
    }
    return ''
  }, [lotNumberOptions, clientFormData.selectedLotId, clientFormData.contractLotNumber])

  const handleSelectContractSection = (value: string) => {
    if (value === CLEAR_SELECTION_VALUE) {
      setClientFormData((prev) => ({
        ...prev,
        contractSection: "",
        contractBlock: "",
        contractLotNumber: "",
        contractLotType: "",
        selectedLotId: "",
      }))
      return
    }
    const lotsInSection = availableLotOptions.filter((option) => option.section === value)
    const firstLot = lotsInSection[0]
    setClientFormData((prev) => ({
      ...prev,
      contractSection: value,
      contractBlock: firstLot?.block || "",
      contractLotNumber: firstLot?.lotNumber || "",
      contractLotType: firstLot?.lotType || "",
      selectedLotId: firstLot?.id || "",
    }))
  }

  const handleSelectContractBlock = (value: string) => {
    if (value === CLEAR_SELECTION_VALUE) {
      setClientFormData((prev) => ({
        ...prev,
        contractBlock: "",
        contractLotNumber: "",
        contractLotType: prev.contractLotType,
        selectedLotId: "",
      }))
      return
    }
    setClientFormData((prev) => {
      const lotsInBlock = availableLotOptions.filter(
        (option) => option.section === prev.contractSection && option.block === value
      )
      const firstLot = lotsInBlock[0]
      return {
        ...prev,
        contractBlock: value,
        contractLotNumber: firstLot?.lotNumber || "",
        contractLotType: firstLot?.lotType || prev.contractLotType,
        selectedLotId: firstLot?.id || "",
      }
    })
  }

  const handleSelectContractLotType = (value: string) => {
    if (value === CLEAR_SELECTION_VALUE) {
      setClientFormData((prev) => ({
        ...prev,
        contractLotType: "",
      }))
      return
    }
    setClientFormData((prev) => ({
      ...prev,
      contractLotType: value,
    }))
  }

  const handleSelectContractLotNumber = (value: string) => {
    if (value === CLEAR_SELECTION_VALUE) {
      setClientFormData((prev) => ({
        ...prev,
        contractLotNumber: "",
        selectedLotId: "",
      }))
      return
    }
    const selected = lotNumberOptions.find((option) => option.id === value)
    if (!selected) return
    setClientFormData((prev) => ({
      ...prev,
      contractSection: selected.section || prev.contractSection,
      contractBlock: selected.block || prev.contractBlock,
      contractLotNumber: selected.lotNumber,
      contractLotType: selected.lotType || prev.contractLotType,
      selectedLotId: selected.id,
    }))
  }

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

  const filteredClients = dashboardData.clients.filter(
    (client: any) =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.address.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.lots.some((lot: any) => lot.toLowerCase().includes(clientSearchTerm.toLowerCase())),
  )

  const filteredPayments = dashboardData.payments.filter(
    (payment: any) =>
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

  const getOwnerDisplay = (lot: any) => {
    if (!lot) return "Unknown owner"
    if (lot.owner && lot.owner.email) {
      return `${lot.owner.name} (${lot.owner.email})`
    }
    if (lot.ownerName) return lot.ownerName
    if (lot.owner_id) return lot.owner_id
    return "No owner on file"
  }

  const handleLogout = () => {
    logout(router, '/'); // Redirect to Welcome Page
  };

  const handleTabChange = (value: string) => {
    router.push(`/admin/employee/dashboard?tab=${value}`, { scroll: false })
  }

  const handleUpdatePayment = (clientName: string, newBalance: number) => {
    // Find the client and update their balance
    const clientIndex = dashboardData.clients.findIndex((client: any) => client.name === clientName);
    const updatedData = { ...dashboardData };
    if (clientIndex !== -1) {
      updatedData.clients[clientIndex].balance = newBalance;
      // You might also want to update payment history or status here if applicable
      // For example, if the balance becomes 0, you could mark the related payments as fully paid.
    }

    // Update the global state and save to local storage
    setDashboardData(updatedData);

    toast({
      title: "Payment Status Updated",
      description: `The balance for ${clientName} has been updated to ₱${formatCurrency(newBalance)}.`,
    });
  };

  // Handler to update payment status (with approval workflow)
  const handleUpdatePaymentStatus = async () => {
    if (!selectedPayment || !newPaymentStatus) {
      toast({
        title: "Error",
        description: "Please select a payment status.",
        variant: "destructive",
      });
      return;
    }

    // Skip approval if status is the same
    if (selectedPayment.status === newPaymentStatus) {
      toast({
        title: "No Changes",
        description: "The payment status is already set to this value.",
        variant: "default",
      });
      return;
    }

    try {
      // Check if approval is required for payment updates
      const approvalCheck = await checkApprovalRequired('payment_update');

      if (approvalCheck.required) {
        // Submit for approval workflow
        const approvalRequest = {
          action_type: 'payment_update' as const,
          target_entity: 'payment' as const,
          target_id: selectedPayment.id,
          change_data: {
            status: newPaymentStatus
          },
          previous_data: {
            status: selectedPayment.status
          },
          notes: `Update payment status from ${selectedPayment.status} to ${newPaymentStatus}`,
          related_client_id: selectedPayment.client_id,
          related_payment_id: selectedPayment.id,
          priority: 'normal' as const
        };

        console.log('[Payment Update] Submitting for approval:', {
          approvalRequest,
          currentEmployeeId
        });

        const response = await submitPendingAction(approvalRequest, currentEmployeeId);

        console.log('[Payment Update] Approval submission response:', response);

        if (response.success) {
          toast({
            title: "Submitted for Approval ⏳",
            description: `Payment status change for ${selectedPayment.client} has been submitted for admin approval.`,
          });

          // Refresh pending actions
          loadPendingActions();
        } else {
          console.error('[Payment Update] Submission failed:', response.error);
          toast({
            title: "Submission Failed",
            description: response.error || "Failed to submit payment update for approval.",
            variant: "destructive",
          });
        }
      } else {
        // Execute directly if approval not required
        executePaymentStatusUpdate();
      }

      // Close dialog and reset
      setIsUpdatePaymentStatusOpen(false);
      setSelectedPayment(null);
      setNewPaymentStatus("");

    } catch (error) {
      console.error('Payment update error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing the payment update.",
        variant: "destructive",
      });
    }
  };

  // Direct execution function (for when approval not required)
  const executePaymentStatusUpdate = async () => {
    try {
      const response = await updatePayment(selectedPayment.id, {
        status: newPaymentStatus
      });

      if (response.success && response.data) {
        // Update local state with new payment data
        const updatedPayments = payments.map((p: any) =>
          p.id === selectedPayment.id ? { ...p, status: newPaymentStatus } : p
        );
        setPayments(updatedPayments);

        // Update dashboardData
        const updatedDashboardData = {
          ...dashboardData,
          payments: updatedPayments
        };
        setDashboardData(updatedDashboardData);

        toast({
          title: "Payment Status Updated ✅",
          description: `Payment status has been updated to ${newPaymentStatus}.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: response.error || "Failed to update payment status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the payment.",
        variant: "destructive",
      });
    }
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
              <p className="text-xs sm:text-sm text-gray-600">Employee Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <AdminNotificationBadge
              adminUsername={localStorage.getItem('employeeUser') || 'employee'}
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 w-full text-xs sm:text-sm overflow-x-auto">
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
            <TabsTrigger value="approvals" className="px-2 sm:px-4 relative">
              Approvals
              {pendingActions.filter(a => a.status === 'pending').length > 0 && (
                <Badge className="ml-1 bg-orange-500 text-white text-xs px-1 py-0 h-4 min-w-4">
                  {pendingActions.filter(a => a.status === 'pending').length}
                </Badge>
              )}
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
            <TabsTrigger value="frontpage" className="px-2 sm:px-4">
              Front Page
            </TabsTrigger>
          </TabsList>

          {activeTab === 'overview' && (
            <OverviewTab
              dashboardData={dashboardData}
              inquiries={inquiries}
              openViewBurial={openViewBurial}
              openReplyInquiry={openReplyInquiry}
            />
          )}

          {activeTab === 'lots' && <LotsTab currentEmployeeId={currentEmployeeId || undefined} />}

          <TabsContent value="lots" className="space-y-6" style={{ display: 'none' }}>
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
                  title="Select a lot to assign to an client"
                >
                  Assign Lot to Owner
                </Button>
                <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>

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
                    filteredLots.map((lot: any) => (
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Burial Records</CardTitle>
                    <CardDescription>Manage and view all burial records</CardDescription>
                  </div>
                  <Dialog
                    open={isAddBurialOpen}
                    onOpenChange={(open) => {
                      setIsAddBurialOpen(open)
                      if (!open) {
                        resetBurialForm()
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 mt-4 sm:mt-0">
                        <Plus />
                        Add Burial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Burial Record</DialogTitle>
                        <DialogDescription>
                          Record a burial and link it to a specific lot and its owner.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="deceased-name">Deceased Name</Label>
                          <Input
                            id="deceased-name"
                            value={burialFormData.deceasedName}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, deceasedName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="family-name">Family Name</Label>
                          <Input
                            id="family-name"
                            value={burialFormData.familyName}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, familyName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={burialFormData.age}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, age: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-of-death">Date of Death</Label>
                          <Input
                            id="date-of-death"
                            type="date"
                            value={burialFormData.dateOfDeath}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, dateOfDeath: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="burial-date">Burial Date</Label>
                          <Input
                            id="burial-date"
                            type="date"
                            value={burialFormData.burialDate}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, burialDate: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="burial-time">Burial Time</Label>
                          <Input
                            id="burial-time"
                            type="time"
                            value={burialFormData.burialTime}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, burialTime: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cause">Cause of Death</Label>
                          <Input
                            id="cause"
                            value={burialFormData.cause}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, cause: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="funeral-home">Funeral Service</Label>
                          <Input
                            id="funeral-home"
                            value={burialFormData.funeralHome}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, funeralHome: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lot-select">Lot</Label>
                          <Select
                            value={burialFormData.lotId}
                            onValueChange={(value) => handleLotSelectForBurial(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select lot" />
                            </SelectTrigger>
                            <SelectContent>
                              {(dashboardData?.lots || []).map((lot: any) => (
                                <SelectItem key={lot.id} value={lot.id}>
                                  {lot.id} • {lot.section} ({lot.status})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="owner-select">Lot Owner</Label>
                          <Select
                            value={burialFormData.ownerId}
                            onValueChange={(value) =>
                              setBurialFormData({ ...burialFormData, ownerId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select owner" />
                            </SelectTrigger>
                            <SelectContent>
                              {(dashboardData?.clients || []).map((client: any) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attendees">Attendees</Label>
                          <Input
                            id="attendees"
                            type="number"
                            value={burialFormData.attendees}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, attendees: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <Label htmlFor="burial-notes">Notes</Label>
                          <Textarea
                            id="burial-notes"
                            value={burialFormData.notes}
                            onChange={(e) =>
                              setBurialFormData({ ...burialFormData, notes: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            resetBurialForm()
                            setIsAddBurialOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleAddBurial}
                        >
                          Save Burial
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.burials.map((burial: any) => (
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
              <Dialog
                open={isAddClientOpen}
                onOpenChange={(open) => {
                  setIsAddClientOpen(open)
                  if (open) {
                    resetClientForm()
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 mt-4 sm:mt-0">
                    <Plus />
                    Add New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Register a new client and create their portal account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Account Credentials Section */}
                    <div className="col-span-1 sm:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Client Portal Login Credentials
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-username">Username <span className="text-red-500">*</span></Label>
                      <Input
                        id="client-username"
                        placeholder="juandc"
                        value={clientFormData.username}
                        onChange={(e) => setClientFormData({ ...clientFormData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-password">Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="client-password"
                        type="password"
                        placeholder="••••••••"
                        value={clientFormData.password}
                        onChange={(e) => setClientFormData({ ...clientFormData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-2">
                      <Label htmlFor="client-confirm-password">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="client-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={clientFormData.confirmPassword}
                        onChange={(e) => setClientFormData({ ...clientFormData, confirmPassword: e.target.value })}
                        required
                      />
                      {clientFormData.password && clientFormData.confirmPassword && clientFormData.password !== clientFormData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {/* Personal Information Section */}
                    <div className="col-span-1 sm:col-span-2 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h3>
                    </div>
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

                    {/* Ownership / Contract Details */}
                    <div className="col-span-1 sm:col-span-2 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Ownership & Contract Details</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        These fields populate the Contract of Ownership PDF.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-section">Section <span className="text-red-500">*</span></Label>
                      <Select
                        value={clientFormData.contractSection || ''}
                        onValueChange={handleSelectContractSection}
                        disabled={sectionOptions.length === 0}
                      >
                        <SelectTrigger id="contract-section">
                          <SelectValue placeholder={sectionOptions.length ? "Select section" : "No available sections"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No available sections</div>
                          )}
                          {sectionOptions.map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                          {sectionOptions.length > 0 && (
                            <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-block">Block <span className="text-red-500">*</span></Label>
                      <Select
                        value={clientFormData.contractBlock || ''}
                        onValueChange={handleSelectContractBlock}
                        disabled={blockOptions.length === 0}
                      >
                        <SelectTrigger id="contract-block">
                          <SelectValue placeholder={blockOptions.length ? "Select block" : "Select section first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {blockOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No blocks for this section</div>
                          )}
                          {blockOptions.map((block) => (
                            <SelectItem key={block} value={block}>
                              Block {block}
                            </SelectItem>
                          ))}
                          {blockOptions.length > 0 && (
                            <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-lot-number">Lot Number <span className="text-red-500">*</span></Label>
                      <Select
                        value={selectedLotOptionValue || ''}
                        onValueChange={handleSelectContractLotNumber}
                        disabled={lotNumberOptions.length === 0}
                      >
                        <SelectTrigger id="contract-lot-number">
                          <SelectValue placeholder={lotNumberOptions.length ? "Select lot" : "Select block first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {lotNumberOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No lots available for this block</div>
                          )}
                          {lotNumberOptions.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {formatLotNumberLabel(lot)}
                            </SelectItem>
                          ))}
                          {lotNumberOptions.length > 0 && (
                            <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-lot-type">Lot Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={clientFormData.contractLotType || ''}
                        onValueChange={handleSelectContractLotType}
                        disabled={lotTypeOptions.length === 0}
                      >
                        <SelectTrigger id="contract-lot-type">
                          <SelectValue placeholder={lotTypeOptions.length ? "Select lot type" : "Select section first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {lotTypeOptions.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500">No lot types available</div>
                          )}
                          {lotTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                          {lotTypeOptions.length > 0 && (
                            <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-1 sm:col-span-2 mt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Preferences</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Set the preferred method and schedule so the cashier portal knows how to process this client.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Payment Method</Label>
                      <div className="flex flex-wrap gap-2">
                        {paymentMethodOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={clientFormData.preferredPaymentMethod === option.value ? "default" : "outline"}
                            onClick={() => setClientFormData((prev) => ({ ...prev, preferredPaymentMethod: option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Schedule</Label>
                      <div className="flex flex-wrap gap-2">
                        {paymentScheduleOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={clientFormData.preferredPaymentSchedule === option.value ? "default" : "outline"}
                            onClick={() => setClientFormData((prev) => ({ ...prev, preferredPaymentSchedule: option.value }))}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-signed-at">Contract Signed Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="contract-signed-at"
                        type="date"
                        value={clientFormData.contractSignedAt}
                        onChange={(e) => setClientFormData({ ...clientFormData, contractSignedAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-authorized-by">Authorized Signatory <span className="text-red-500">*</span></Label>
                      <Input
                        id="contract-authorized-by"
                        placeholder="e.g., Maria Santos"
                        value={clientFormData.contractAuthorizedBy}
                        readOnly
                        disabled
                        className="bg-gray-50 text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Locked to the employee currently logged in.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract-authorized-position">Position <span className="text-red-500">*</span></Label>
                      <Input
                        id="contract-authorized-position"
                        placeholder="Authorized Signatory Position"
                        value={clientFormData.contractAuthorizedPosition}
                        readOnly
                        disabled
                        className="bg-gray-50 text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Matches the role assigned to your employee account.</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetClientForm()
                        setIsAddClientOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddClient}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isCreateClientDisabled}
                    >
                      Create Client Account
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
                  {filteredClients.map((client: any) => {
                    const statusMeta = getClientStatusMeta(client.status)
                    return (
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
                                .map((n: any) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                            <p className="text-xs text-gray-500">
                              Lots: {(client.lots || []).join(", ") || 'None'} • Balance: ₱{formatCurrency(client.balance)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={statusMeta.variant} title={statusMeta.description}>
                            {statusMeta.label}
                          </Badge>
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  title="Delete this client"
                                >
                                  <Trash2 />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete client {client.name}? This will deactivate their
                                    account and hide them from the active client list. Clients with existing payments
                                    cannot be fully removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClient(client)}
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
                    )
                  })}
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
                            <span title={`Follow up: ${inquiry.followUpDate}`}>
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            </span>
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
                            {inquiry.tags.map((tag: any, index: any) => (
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
                            {inquiry.responses.slice(-2).map((response: any) => (
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
                    <CardDescription>Monitor client payments and update status after receiving payment</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshDashboard}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search payments..."
                        value={paymentSearchTerm}
                        onChange={(e) => setPaymentSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">
                          ₱{formatCurrency(clients.reduce((sum, client) => sum + (client.balance || 0), 0))}
                        </p>
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
                          Amount
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scheduled Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment: any) => (
                        <tr key={payment.id} className={payment.status === "Pending" ? "bg-yellow-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">{payment.client}</p>
                              <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-900">₱{formatCurrency(payment.amount)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-gray-900">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                              </p>
                              {payment.status === "Pending" && payment.payment_date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.payment_date) < new Date() ? '⚠️ Past due' : '📅 Upcoming'}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{payment.method || payment.payment_method || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={
                              payment.status === "Paid" || payment.status === "Completed" ? "default" :
                                payment.status === "Pending" || payment.status === "Under Payment" ? "secondary" :
                                  "destructive"
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setNewPaymentStatus(payment.status)
                                setIsUpdatePaymentStatusOpen(true)
                              }}
                              title="Update payment status"
                              className={payment.status === "Pending" ? "border-green-600 text-green-600 hover:bg-green-50" : ""}
                            >
                              {payment.status === "Pending" ? "Confirm Payment" : "Update Status"}
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

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>My Pending Actions</CardTitle>
                    <CardDescription>
                      Track your submitted requests awaiting admin approval
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadPendingActions();
                        refreshDashboard();
                      }}
                      disabled={isLoadingPendingActions || isLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${(isLoadingPendingActions || isLoading) ? 'animate-spin' : ''}`} />
                      {isLoadingPendingActions || isLoading ? "Refreshing..." : "Refresh All"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Info banner about approved actions */}
                {pendingActions.some((action: any) => action.status === 'approved' && action.is_executed) && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-800">Approvals Executed Successfully</h4>
                        <p className="text-xs text-green-700 mt-1">
                          Your approved actions have been executed. Payment statuses may have been updated. Click &quot;Refresh All&quot; above or go to the Payments tab to see the latest data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingPendingActions ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-sm text-gray-500">Loading pending actions...</div>
                  </div>
                ) : pendingActions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No pending actions</div>
                    <div className="text-sm text-gray-400">
                      Your requests will appear here when they require admin approval
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingActions.map((action) => (
                          <tr key={action.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatActionType(action.action_type)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {action.target_entity}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {action.target_id ? `ID: ${action.target_id.slice(0, 8)}...` : 'New Record'}
                              </div>
                              {action.change_data?.status && (
                                <div className="text-sm text-gray-500">
                                  → {action.change_data.status}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  action.status === 'pending' ? 'secondary' :
                                    action.status === 'approved' ? 'default' :
                                      action.status === 'rejected' ? 'destructive' :
                                        'outline'
                                }
                                className={
                                  action.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''
                                }
                              >
                                {formatApprovalStatus(action.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getTimeElapsed(action.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {action.notes || '-'}
                              </div>
                              {action.rejection_reason && (
                                <div className="text-sm text-red-600 max-w-xs truncate">
                                  Rejected: {action.rejection_reason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {action.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement cancel action
                                    console.log('Cancel action:', action.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">Pending</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {pendingActions.filter(a => a.status === 'pending').length}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Approved</div>
                    <div className="text-2xl font-bold text-green-900">
                      {pendingActions.filter(a => a.status === 'approved').length}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-red-800">Rejected</div>
                    <div className="text-2xl font-bold text-red-900">
                      {pendingActions.filter(a => a.status === 'rejected').length}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-800">Total</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {pendingActions.length}
                    </div>
                  </div>
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

          {activeTab === 'maps' && <MapsTab />}

          {activeTab === 'news' && <NewsTab />}

          {activeTab === 'frontpage' && (
            <FrontPageTab
              currentEmployeeId={currentEmployeeId || 'employee-mock'}
              onSubmitForApproval={async (data) => {
                try {
                  const response = await submitPendingAction(data, currentEmployeeId!)
                  if (response.success) {
                    loadPendingActions()
                  }
                } catch (error) {
                  console.error('Error submitting for approval:', error)
                }
              }}
            />
          )}
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
                        <p className="text-lg font-semibold">{value as any}</p>
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
                          {selectedReport.data.map((item: any, index: any) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              {Object.values(item).map((value, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                                  {value as any}
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
                    {selectedReport.sections.map((section: any, index: any) => (
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
                    {selectedReport.paymentTypes.map((type: any, index: any) => (
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
                    {selectedReport.paymentMethods.map((method: any, index: any) => (
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
                    {selectedReport.inquiryTypes.map((type: any, index: any) => {
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

            {/* Ownership / Contract Details */}
            <div className="col-span-1 sm:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ownership & Contract Details</h3>
              <p className="text-xs text-gray-500 mb-2">
                Update the values that populate the Contract of Ownership PDF.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-section">Section</Label>
              <Select
                value={clientFormData.contractSection || undefined}
                onValueChange={handleSelectContractSection}
                disabled={sectionOptions.length === 0}
              >
                <SelectTrigger id="edit-contract-section">
                  <SelectValue placeholder={sectionOptions.length ? "Select section" : "No available sections"} />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No available sections</div>
                  )}
                  {sectionOptions.map((section) => (
                    <SelectItem key={`edit-section-${section}`} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                  {sectionOptions.length > 0 && (
                    <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-block">Block</Label>
              <Select
                value={clientFormData.contractBlock || undefined}
                onValueChange={handleSelectContractBlock}
                disabled={blockOptions.length === 0}
              >
                <SelectTrigger id="edit-contract-block">
                  <SelectValue placeholder={blockOptions.length ? "Select block" : "Select section first"} />
                </SelectTrigger>
                <SelectContent>
                  {blockOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No blocks for this section</div>
                  )}
                  {blockOptions.map((block) => (
                    <SelectItem key={`edit-block-${block}`} value={block}>
                      Block {block}
                    </SelectItem>
                  ))}
                  {blockOptions.length > 0 && (
                    <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-lot-number">Lot Number</Label>
              <Select
                value={selectedLotOptionValue}
                onValueChange={handleSelectContractLotNumber}
                disabled={lotNumberOptions.length === 0}
              >
                <SelectTrigger id="edit-contract-lot-number">
                  <SelectValue placeholder={lotNumberOptions.length ? "Select lot" : "Select block first"} />
                </SelectTrigger>
                <SelectContent>
                  {lotNumberOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No lots available for this block</div>
                  )}
                  {lotNumberOptions.map((lot) => (
                    <SelectItem key={`edit-lot-${lot.id}`} value={lot.id}>
                      {formatLotNumberLabel(lot)}
                    </SelectItem>
                  ))}
                  {lotNumberOptions.length > 0 && (
                    <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-lot-type">Lot Type</Label>
              <Select
                value={clientFormData.contractLotType || undefined}
                onValueChange={handleSelectContractLotType}
                disabled={lotTypeOptions.length === 0}
              >
                <SelectTrigger id="edit-contract-lot-type">
                  <SelectValue placeholder={lotTypeOptions.length ? "Select lot type" : "Select section first"} />
                </SelectTrigger>
                <SelectContent>
                  {lotTypeOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No lot types available</div>
                  )}
                  {lotTypeOptions.map((type) => (
                    <SelectItem key={`edit-type-${type}`} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  {lotTypeOptions.length > 0 && (
                    <SelectItem value={CLEAR_SELECTION_VALUE}>Clear selection</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 sm:col-span-2 mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Preferences</h3>
              <p className="text-xs text-gray-500 mb-2">
                Adjust how this client prefers to settle their dues so the cashier can follow the plan.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Preferred Payment Method</Label>
              <div className="flex flex-wrap gap-2">
                {paymentMethodOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={clientFormData.preferredPaymentMethod === option.value ? "default" : "outline"}
                    onClick={() => setClientFormData((prev) => ({ ...prev, preferredPaymentMethod: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Schedule</Label>
              <div className="flex flex-wrap gap-2">
                {paymentScheduleOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={clientFormData.preferredPaymentSchedule === option.value ? "default" : "outline"}
                    onClick={() => setClientFormData((prev) => ({ ...prev, preferredPaymentSchedule: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-signed-at">Contract Signed Date</Label>
              <Input
                id="edit-contract-signed-at"
                type="date"
                value={clientFormData.contractSignedAt}
                onChange={(e) => setClientFormData({ ...clientFormData, contractSignedAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-authorized-by">Authorized Signatory</Label>
              <Input
                id="edit-contract-authorized-by"
                value={clientFormData.contractAuthorizedBy}
                onChange={(e) => setClientFormData({ ...clientFormData, contractAuthorizedBy: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contract-authorized-position">Position</Label>
              <Input
                id="edit-contract-authorized-position"
                value={clientFormData.contractAuthorizedPosition}
                onChange={(e) => setClientFormData({ ...clientFormData, contractAuthorizedPosition: e.target.value })}
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
                  <p className="text-sm">{selectedClient.join_date || selectedClient.joinDate || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Outstanding Balance</Label>
                  <p className="text-sm">₱{formatCurrency(selectedClient.balance)}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedClient.address || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                  <p className="text-sm">{selectedClient.emergencyContact || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Emergency Phone</Label>
                  <p className="text-sm">{selectedClient.emergencyPhone || "—"}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Owned Lots</Label>
                  <p className="text-sm">
                    {selectedClient.lots && selectedClient.lots.length > 0
                      ? selectedClient.lots.join(", ")
                      : "No lots assigned"}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm">{selectedClient.notes || "—"}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Payment History</Label>
                {selectedClientPayments.length === 0 ? (
                  <p className="text-sm text-gray-500">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClientPayments.map((payment: any) => (
                      <div key={payment.id} className="p-3 bg-gray-50 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{payment.type}</p>
                          <p className="text-xs text-gray-500">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <p className="text-sm font-medium">₱{formatCurrency(payment.amount)}</p>
                          <Badge variant={
                            payment.status === "Paid" || payment.status === "Completed" ? "default" :
                              payment.status === "Pending" || payment.status === "Under Payment" ? "secondary" :
                                "destructive"
                          } className="w-fit text-xs">
                            {payment.status}
                          </Badge>
                          {payment.invoice_pdf_url && (
                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                              <a href={payment.invoice_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                Invoice PDF
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedClientHasDocuments && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Documents</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.contract_pdf_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedClient.contract_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Ownership Contract
                        </a>
                      </Button>
                    )}
                    {selectedClientPayments.filter((payment: any) => payment.invoice_pdf_url).map((payment: any) => (
                      <Button key={`invoice-${payment.id}`} variant="outline" size="sm" asChild>
                        <a href={payment.invoice_pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Invoice {payment.reference}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleResendClientDocuments}
              disabled={!selectedClientHasDocuments}
            >
              Email Documents
            </Button>
            <Button
              variant="outline"
              onClick={handleSendDemoReminder}
              disabled={!selectedClient}
            >
              Send 1 min reminder sample
            </Button>
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
            <DialogDescription>Send a response to {selectedInquiry?.name}&apos;s inquiry.</DialogDescription>
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
                    {selectedInquiry.tags.map((tag: any, index: any) => (
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
                    {selectedInquiry.responses.map((response: any) => (
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
                        .map((n: any) => n[0])
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

      {/* Payment Status Update Dialog */}
      <Dialog open={isUpdatePaymentStatusOpen} onOpenChange={setIsUpdatePaymentStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change the payment status for this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client:</span>
                  <span className="text-sm font-medium">{selectedPayment.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">₱{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{selectedPayment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <Badge variant={
                    selectedPayment.status === "Completed" ? "default" :
                      selectedPayment.status === "Pending" ? "secondary" :
                        "destructive"
                  }>
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>

              {/* Approval Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800">Admin Approval Required</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      This payment status change requires administrator approval. Your update will be submitted for review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-status">New Payment Status</Label>
                <Select
                  value={newPaymentStatus}
                  onValueChange={setNewPaymentStatus}
                >
                  <SelectTrigger id="payment-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Completed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="Overdue">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Overdue
                      </div>
                    </SelectItem>
                    <SelectItem value="Cancelled">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        Cancelled
                      </div>
                    </SelectItem>
                    <SelectItem value="Refunded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Refunded
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUpdatePaymentStatusOpen(false)
                    setSelectedPayment(null)
                    setNewPaymentStatus("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePaymentStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newPaymentStatus || newPaymentStatus === selectedPayment.status}
                >
                  Submit for Approval
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
