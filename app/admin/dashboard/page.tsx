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
import {
  Users,
  MapPin,
  DollarSign,
  MessageSquare,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Calendar,
  FileText,
  BarChart3,
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  Loader2,
  Download,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"

let globalData = {
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
      features: "Concrete headstone, garden border",
      dateAdded: "2023-06-15",
      dateOccupied: "2024-01-15",
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
      notes: "Preferred contact via phone",
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
      notes: "Prefers email communication",
      paymentHistory: [{ date: "2024-01-10", amount: 75000, type: "Down Payment", status: "Completed" }],
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
      notes: "Peaceful ceremony",
    },
  ],
  inquiries: [
    {
      id: 1,
      name: "Ana Garcia",
      email: "ana@email.com",
      phone: "09123456789",
      type: "Lot Availability",
      date: "2024-01-20",
      time: "10:30 AM",
      status: "New",
      message: "I'm interested in purchasing a family lot in the Garden of Peace section.",
      priority: "high",
      source: "Website Contact Form",
      responses: [],
      assignedTo: "Admin",
      followUpDate: "2024-01-22",
    },
  ],
}

const saveToLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cemeteryData", JSON.stringify(globalData))
  }
}

const loadFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cemeteryData")
    if (saved) {
      try {
        globalData = JSON.parse(saved)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
  }
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("")
  const [inquirySearchTerm, setInquirySearchTerm] = useState("")
  const [reportPeriod, setReportPeriod] = useState("monthly")

  // Dialog states
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
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false)

  // Selected items
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [selectedBurial, setSelectedBurial] = useState<any>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  // Loading states
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState("")

  // Form data
  const [lotFormData, setLotFormData] = useState({
    id: "",
    section: "",
    type: "",
    status: "",
    price: "",
    description: "",
    dimensions: "",
    features: "",
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
    followUpDate: "",
  })

  const [messageFormData, setMessageFormData] = useState({
    subject: "",
    message: "",
    type: "general",
  })

  // Local data states
  const [lots, setLots] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [burials, setBurials] = useState<any[]>([])
  const [stats, setStats] = useState(globalData.stats)

  const router = useRouter()

  // Initialize data on mount
  useEffect(() => {
    loadFromLocalStorage()
    setLots(globalData.lots)
    setClients(globalData.clients)
    setPayments(globalData.payments)
    setInquiries(globalData.inquiries)
    setBurials(globalData.burials)
    setStats(globalData.stats)
  }, [])

  // ==================== LOT HANDLERS ====================

  const handleAddLot = () => {
    if (!lotFormData.id || !lotFormData.section || !lotFormData.type || !lotFormData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const newLot = {
        id: lotFormData.id,
        section: lotFormData.section,
        type: lotFormData.type,
        status: lotFormData.status,
        price: Number.parseInt(lotFormData.price) || 0,
        dimensions: lotFormData.dimensions,
        features: lotFormData.features,
        description: lotFormData.description,
        dateAdded: new Date().toISOString().split("T")[0],
      }

      globalData.lots.push(newLot)
      globalData.stats.totalLots += 1
      if (newLot.status === "Available") {
        globalData.stats.availableLots += 1
      }

      setLots([...lots, newLot])
      setStats(globalData.stats)
      saveToLocalStorage()

      toast({
        title: "Success",
        description: `Lot ${lotFormData.id} has been added successfully.`,
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
      })
      setIsLoading(false)
    }, 500)
  }

  const handleEditLot = () => {
    if (!selectedLot) return

    setIsLoading(true)
    setTimeout(() => {
      const lotIndex = lots.findIndex((lot) => lot.id === selectedLot.id)
      if (lotIndex !== -1) {
        const updatedLots = [...lots]
        updatedLots[lotIndex] = {
          ...updatedLots[lotIndex],
          id: lotFormData.id,
          section: lotFormData.section,
          type: lotFormData.type,
          status: lotFormData.status,
          price: Number.parseInt(lotFormData.price) || 0,
          dimensions: lotFormData.dimensions,
          features: lotFormData.features,
          description: lotFormData.description,
        }

        globalData.lots = updatedLots
        setLots(updatedLots)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `Lot ${selectedLot.id} has been updated successfully.`,
        })

        setIsEditLotOpen(false)
        setSelectedLot(null)
      }
      setIsLoading(false)
    }, 500)
  }

  const handleDeleteLot = (lot: any) => {
    setIsLoading(true)
    setTimeout(() => {
      const filteredLots = lots.filter((l) => l.id !== lot.id)
      globalData.lots = filteredLots
      setLots(filteredLots)

      globalData.stats.totalLots -= 1
      if (lot.status === "Available") {
        globalData.stats.availableLots -= 1
      }
      setStats(globalData.stats)

      saveToLocalStorage()

      toast({
        title: "Success",
        description: `Lot ${lot.id} has been deleted.`,
        variant: "destructive",
      })
      setIsLoading(false)
    }, 500)
  }

  // ==================== CLIENT HANDLERS ====================

  const handleAddClient = () => {
    if (!clientFormData.name || !clientFormData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const newClient = {
        id: clients.length + 1,
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

      globalData.clients.push(newClient)
      globalData.stats.totalClients += 1

      setClients([...clients, newClient])
      setStats(globalData.stats)
      saveToLocalStorage()

      toast({
        title: "Success",
        description: `${clientFormData.name} has been added successfully.`,
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
      setIsLoading(false)
    }, 500)
  }

  const handleEditClient = () => {
    if (!selectedClient) return

    setIsLoading(true)
    setTimeout(() => {
      const clientIndex = clients.findIndex((c) => c.id === selectedClient.id)
      if (clientIndex !== -1) {
        const updatedClients = [...clients]
        updatedClients[clientIndex] = {
          ...updatedClients[clientIndex],
          name: clientFormData.name,
          email: clientFormData.email,
          phone: clientFormData.phone,
          address: clientFormData.address,
          emergencyContact: clientFormData.emergencyContact,
          emergencyPhone: clientFormData.emergencyPhone,
          notes: clientFormData.notes,
        }

        globalData.clients = updatedClients
        setClients(updatedClients)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `${clientFormData.name} has been updated successfully.`,
        })

        setIsEditClientOpen(false)
        setSelectedClient(null)
      }
      setIsLoading(false)
    }, 500)
  }

  const handleDeleteClient = (client: any) => {
    setIsLoading(true)
    setTimeout(() => {
      const filteredClients = clients.filter((c) => c.id !== client.id)
      globalData.clients = filteredClients
      setClients(filteredClients)

      globalData.stats.totalClients -= 1
      setStats(globalData.stats)

      saveToLocalStorage()

      toast({
        title: "Success",
        description: `${client.name} has been deleted.`,
        variant: "destructive",
      })
      setIsLoading(false)
    }, 500)
  }

  // ==================== INQUIRY HANDLERS ====================

  const handleReplyInquiry = () => {
    if (!replyFormData.message) {
      toast({
        title: "Validation Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const inquiryIndex = inquiries.findIndex((inq) => inq.id === selectedInquiry?.id)
      if (inquiryIndex !== -1) {
        const newResponse = {
          id: (inquiries[inquiryIndex].responses?.length || 0) + 1,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
          respondent: "Admin",
          message: replyFormData.message,
          method: "Email",
        }

        const updatedInquiries = [...inquiries]
        updatedInquiries[inquiryIndex] = {
          ...updatedInquiries[inquiryIndex],
          status: "In Progress",
          responses: [...(updatedInquiries[inquiryIndex].responses || []), newResponse],
          followUpDate: replyFormData.followUpDate || null,
        }

        globalData.inquiries = updatedInquiries
        setInquiries(updatedInquiries)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `Reply sent to ${selectedInquiry?.name}.`,
        })

        setIsReplyInquiryOpen(false)
        setReplyFormData({ subject: "", message: "", priority: "normal", followUpDate: "" })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleMarkResolved = (inquiry: any) => {
    setIsLoading(true)
    setTimeout(() => {
      const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
      if (inquiryIndex !== -1) {
        const updatedInquiries = [...inquiries]
        updatedInquiries[inquiryIndex] = {
          ...updatedInquiries[inquiryIndex],
          status: "Resolved",
          resolvedDate: new Date().toISOString().split("T")[0],
          resolvedBy: "Admin",
          followUpDate: null,
        }

        globalData.inquiries = updatedInquiries
        setInquiries(updatedInquiries)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `Inquiry from ${inquiry.name} marked as resolved.`,
        })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleReopenInquiry = (inquiry: any) => {
    setIsLoading(true)
    setTimeout(() => {
      const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
      if (inquiryIndex !== -1) {
        const updatedInquiries = [...inquiries]
        updatedInquiries[inquiryIndex] = {
          ...updatedInquiries[inquiryIndex],
          status: "In Progress",
          resolvedDate: null,
          resolvedBy: null,
          followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }

        globalData.inquiries = updatedInquiries
        setInquiries(updatedInquiries)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `Inquiry from ${inquiry.name} has been reopened.`,
        })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleUpdatePriority = (inquiry: any, priority: string) => {
    setIsLoading(true)
    setTimeout(() => {
      const inquiryIndex = inquiries.findIndex((inq) => inq.id === inquiry.id)
      if (inquiryIndex !== -1) {
        const updatedInquiries = [...inquiries]
        updatedInquiries[inquiryIndex] = {
          ...updatedInquiries[inquiryIndex],
          priority,
        }

        globalData.inquiries = updatedInquiries
        setInquiries(updatedInquiries)
        saveToLocalStorage()

        toast({
          title: "Success",
          description: `Priority updated to ${priority}.`,
        })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleSendMessage = () => {
    if (!messageFormData.subject || !messageFormData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      toast({
        title: "Success",
        description: `Message sent to ${selectedClient?.name}.`,
      })
      setIsMessageClientOpen(false)
      setMessageFormData({ subject: "", message: "", type: "general" })
      setIsLoading(false)
    }, 500)
  }

  // ==================== REPORT HANDLERS ====================

  const generateReportData = (type: string) => {
    return {
      title: type,
      date: new Date().toLocaleDateString(),
      period: reportPeriod,
      summary: {
        totalLots: stats.totalLots,
        occupiedLots: stats.occupiedLots,
        availableLots: stats.availableLots,
        totalClients: stats.totalClients,
        monthlyRevenue: stats.monthlyRevenue,
        totalPayments: payments.length,
        pendingInquiries: inquiries.filter((i) => i.status !== "Resolved").length,
      },
      data: type === "Occupancy Report" ? lots : type === "Client Report" ? clients : payments,
    }
  }

  const handleGenerateReport = async (type: string) => {
    setIsGeneratingReport(true)
    setReportType(type)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const data = generateReportData(type)
    setSelectedReport(data)
    setIsGeneratingReport(false)
    setIsReportPreviewOpen(true)

    toast({
      title: "Success",
      description: `${type} has been generated.`,
    })
  }

  const exportToExcel = () => {
    if (!selectedReport) return

    try {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(selectedReport.data)
      XLSX.utils.book_append_sheet(wb, ws, "Report")

      const fileName = `${selectedReport.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast({
        title: "Success",
        description: "Report exported to Excel.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report.",
        variant: "destructive",
      })
    }
  }

  // ==================== DIALOG OPEN HELPERS ====================

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
      subject: `Re: ${inquiry.type}`,
      message: "",
      priority: inquiry.priority,
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
    setMessageFormData({ subject: "", message: "", type: "general" })
    setIsMessageClientOpen(true)
  }

  // ==================== FILTER HELPERS ====================

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

  const filteredLots = lots.filter(
    (lot) =>
      lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.section.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()),
  )

  const filteredPayments = payments.filter(
    (payment) =>
      payment.client.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(paymentSearchTerm.toLowerCase()),
  )

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.name.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(inquirySearchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <Button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm border border-gray-200 rounded-full w-12 h-12 p-0"
        disabled={isLoading}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 ml-16">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Image src="/images/smpi-logo.png" alt="SMPI Logo" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Surigao Memorial Park</h1>
                <p className="text-sm text-gray-600">Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Administrator</p>
                  <p className="text-xs text-gray-500">System Admin</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                onClick={() => {
                  router.push("/admin/login")
                }}
                disabled={isLoading}
              >
                <Link href="/admin/login">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Manage cemetery operations and monitor system performance.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border">
            <TabsTrigger value="overview" disabled={isLoading}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="lots" disabled={isLoading}>
              Lots
            </TabsTrigger>
            <TabsTrigger value="clients" disabled={isLoading}>
              Clients
            </TabsTrigger>
            <TabsTrigger value="inquiries" disabled={isLoading}>
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="payments" disabled={isLoading}>
              Payments
            </TabsTrigger>
            <TabsTrigger value="reports" disabled={isLoading}>
              Reports
            </TabsTrigger>
          </TabsList>

          {/* ========== OVERVIEW TAB ========== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Lots</p>
                      <p className="text-2xl font-bold">{stats.totalLots}</p>
                      <p className="text-xs text-gray-500">
                        {stats.occupiedLots} occupied • {stats.availableLots} available
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold">{stats.totalClients}</p>
                      <p className="text-xs text-gray-500">Active lot owners</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold">₱{stats.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{stats.overduePayments} overdue payments</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Inquiries</p>
                      <p className="text-2xl font-bold">{inquiries.filter((i) => i.status !== "Resolved").length}</p>
                      <p className="text-xs text-gray-500">Require attention</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Burials</CardTitle>
                  <CardDescription>Latest burial records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {burials.map((burial) => (
                      <div
                        key={burial.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{burial.name}</p>
                          <p className="text-sm text-gray-600">
                            Lot {burial.lot} • {burial.family}
                          </p>
                          <p className="text-xs text-gray-500">{burial.date}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openViewBurial(burial)} disabled={isLoading}>
                          <Eye className="h-4 w-4" />
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
                        <div
                          key={inquiry.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{inquiry.name}</p>
                            <p className="text-sm text-gray-600">{inquiry.type}</p>
                            <p className="text-xs text-gray-500">{inquiry.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReplyInquiry(inquiry)}
                              disabled={isLoading}
                            >
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

          {/* ========== LOTS TAB ========== */}
          <TabsContent value="lots" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Lot Management</h3>
                <p className="text-gray-600">Manage cemetery lots and assignments</p>
              </div>
              <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Lot
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Lot</DialogTitle>
                    <DialogDescription>Create a new cemetery lot in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lot-id">
                        Lot ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lot-id"
                        placeholder="e.g., A-001"
                        value={lotFormData.id}
                        onChange={(e) => setLotFormData({ ...lotFormData, id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">
                        Section <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="type">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={lotFormData.type}
                        onValueChange={(value) => setLotFormData({ ...lotFormData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                      <Label htmlFor="status">
                        Status <span className="text-red-500">*</span>
                      </Label>
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
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="features">Features</Label>
                      <Input
                        id="features"
                        placeholder="Concrete headstone, garden border"
                        value={lotFormData.features}
                        onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
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
                    <Button variant="outline" onClick={() => setIsAddLotOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddLot} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Add Lot
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
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
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredLots.length > 0 ? (
                    filteredLots.map((lot) => (
                      <div
                        key={lot.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Lot {lot.id}</p>
                            <p className="text-sm text-gray-600">
                              {lot.section} • {lot.type}
                            </p>
                            <p className="text-sm text-gray-600">₱{lot.price.toLocaleString()}</p>
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
                            <Button variant="outline" size="sm" onClick={() => openEditLot(lot)} disabled={isLoading}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openViewLot(lot)} disabled={isLoading}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Lot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete lot {lot.id}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLot(lot)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No lots found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== CLIENTS TAB ========== */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Client Management</h3>
                <p className="text-gray-600">Manage lot owners and their information</p>
              </div>
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Register a new client in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="client-name"
                        placeholder="Juan Dela Cruz"
                        value={clientFormData.name}
                        onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">
                        Email <span className="text-red-500">*</span>
                      </Label>
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
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="client-address">Address</Label>
                      <Input
                        id="client-address"
                        placeholder="123 Main St, Surigao City"
                        value={clientFormData.address}
                        onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
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
                    <Button variant="outline" onClick={() => setIsAddClientOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddClient} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Add Client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
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
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                            <p className="text-xs text-gray-500">
                              Lots: {client.lots.join(", ") || "None"} • Balance: ₱{client.balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditClient(client)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewClient(client)}
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMessageClient(client)}
                              disabled={isLoading}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No clients found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== INQUIRIES TAB ========== */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Inquiry Management</h3>
                <p className="text-gray-600">Manage and respond to client inquiries and requests</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search inquiries..."
                    value={inquirySearchTerm}
                    onChange={(e) => setInquirySearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    disabled={isLoading}
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
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{inquiry.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span>{inquiry.email}</span>
                                <Phone className="h-3 w-3 ml-2" />
                                <span>{inquiry.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {inquiry.date} at {inquiry.time}
                                </span>
                                <span>•</span>
                                <span>via {inquiry.source}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(inquiry.priority)}>{inquiry.priority}</Badge>
                            <Badge variant={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                            {inquiry.status === "Resolved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Inquiry Type: {inquiry.type}</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{inquiry.message}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {inquiry.status !== "Resolved" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => openReplyInquiry(inquiry)}
                                disabled={isLoading}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" disabled={isLoading}>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark as Resolved
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Mark Inquiry as Resolved</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to mark this inquiry from {inquiry.name} as resolved?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleMarkResolved(inquiry)}
                                      className="bg-green-600 hover:bg-green-700"
                                      disabled={isLoading}
                                    >
                                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                      Mark as Resolved
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}

                          {inquiry.status === "Resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReopenInquiry(inquiry)}
                              disabled={isLoading}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Reopen
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewInquiry(inquiry)}
                            disabled={isLoading}
                          >
                            <Eye className="h-3 w-3 mr-1" />
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No inquiries found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== PAYMENTS TAB ========== */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Management</CardTitle>
                    <CardDescription>Monitor payments and outstanding balances</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search payments..."
                      value={paymentSearchTerm}
                      onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">₱{stats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.overduePayments}</p>
                        <p className="text-sm text-gray-600">Overdue Payments</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ₱{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Payments</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Client
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">₱{payment.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={payment.status === "Completed" ? "default" : "destructive"}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.method}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No payments found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== REPORTS TAB ========== */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">System Reports</h3>
                <p className="text-gray-600">Generate and download various system reports</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-40" disabled={isLoading}>
                    <SelectValue placeholder="Report Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Reports</CardTitle>
                <CardDescription>Generate and download various system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Occupancy Report", color: "blue", icon: BarChart3 },
                    { title: "Revenue Report", color: "green", icon: DollarSign },
                    { title: "Client Report", color: "purple", icon: Users },
                    { title: "Burial Schedule", color: "amber", icon: Calendar },
                    { title: "Payment Report", color: "teal", icon: FileText },
                    { title: "Inquiry Report", color: "orange", icon: MessageSquare },
                  ].map((report) => {
                    const Icon = report.icon
                    return (
                      <Card key={report.title} className="border hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Icon className="h-10 w-10 mb-3 text-gray-700" />
                            <h3 className="text-lg font-medium mb-1">{report.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">Generate comprehensive report</p>
                            <Button
                              onClick={() => handleGenerateReport(report.title)}
                              disabled={isGeneratingReport || isLoading}
                              className="w-full"
                            >
                              {isGeneratingReport && reportType === report.title ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Generate Report
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ========== DIALOGS ========== */}

      {/* Edit Lot Dialog */}
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lot {selectedLot?.id}</DialogTitle>
            <DialogDescription>Update lot information and settings.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lot ID</Label>
              <Input value={lotFormData.id} onChange={(e) => setLotFormData({ ...lotFormData, id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
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
              <Label>Type</Label>
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
              <Label>Status</Label>
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
              <Label>Price (₱)</Label>
              <Input
                type="number"
                value={lotFormData.price}
                onChange={(e) => setLotFormData({ ...lotFormData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <Input
                value={lotFormData.dimensions}
                onChange={(e) => setLotFormData({ ...lotFormData, dimensions: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Features</Label>
              <Input
                value={lotFormData.features}
                onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={lotFormData.description}
                onChange={(e) => setLotFormData({ ...lotFormData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditLotOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditLot} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Badge>{selectedLot.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Price</Label>
                  <p className="text-sm">₱{selectedLot.price.toLocaleString()}</p>
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
          <div className="flex justify-end gap-2">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={clientFormData.name}
                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={clientFormData.phone}
                onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input
                value={clientFormData.emergencyContact}
                onChange={(e) => setClientFormData({ ...clientFormData, emergencyContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Phone</Label>
              <Input
                value={clientFormData.emergencyPhone}
                onChange={(e) => setClientFormData({ ...clientFormData, emergencyPhone: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Address</Label>
              <Input
                value={clientFormData.address}
                onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={clientFormData.notes}
                onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditClientOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditClient} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
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
                  <Badge>{selectedClient.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                  <p className="text-sm">{selectedClient.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Outstanding Balance</Label>
                  <p className="text-sm">₱{selectedClient.balance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => openMessageClient(selectedClient)} disabled={isLoading}>
              <MessageSquare className="h-4 w-4 mr-2" />
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-sm font-medium text-gray-500">Lot Number</Label>
                  <p className="text-sm">{selectedBurial.lot}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Burial Time</Label>
                  <p className="text-sm">{selectedBurial.burial}</p>
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
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Notes</Label>
                <p className="text-sm">{selectedBurial.notes}</p>
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
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{selectedInquiry.name}</p>
                    <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                  </div>
                  <Badge variant={getStatusColor(selectedInquiry.status)}>{selectedInquiry.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-2">{selectedInquiry.message}</p>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={replyFormData.subject}
                  onChange={(e) => setReplyFormData({ ...replyFormData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Reply Message</Label>
                <Textarea
                  placeholder="Type your response here..."
                  rows={6}
                  value={replyFormData.message}
                  onChange={(e) => setReplyFormData({ ...replyFormData, message: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Follow-up Date (Optional)</Label>
                <Input
                  type="date"
                  value={replyFormData.followUpDate}
                  onChange={(e) => setReplyFormData({ ...replyFormData, followUpDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsReplyInquiryOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleReplyInquiry} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Inquiry Dialog */}
      <Dialog open={isViewInquiryOpen} onOpenChange={setIsViewInquiryOpen}>
        <DialogContent className="max-w-4xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details: {selectedInquiry?.name}</DialogTitle>
            <DialogDescription>Complete inquiry information and response history.</DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="text-sm">{selectedInquiry.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                  <p className="text-sm">
                    {selectedInquiry.date} at {selectedInquiry.time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge variant={getPriorityColor(selectedInquiry.priority)}>{selectedInquiry.priority}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Message</Label>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedInquiry.message}</p>
              </div>
              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2">Response History</Label>
                  <div className="space-y-2">
                    {selectedInquiry.responses.map((response: any) => (
                      <div key={response.id} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-medium text-blue-800">{response.respondent}</p>
                          <p className="text-xs text-blue-600">
                            {response.date} at {response.time}
                          </p>
                        </div>
                        <p className="text-sm text-blue-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => openReplyInquiry(selectedInquiry)} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" onClick={() => setIsViewInquiryOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Client Dialog */}
      <Dialog open={isMessageClientOpen} onOpenChange={setIsMessageClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedClient?.name}</DialogTitle>
            <DialogDescription>Send a direct message to the client.</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Message subject"
                  value={messageFormData.subject}
                  onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Message Type</Label>
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

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message here..."
                  rows={6}
                  value={messageFormData.message}
                  onChange={(e) => setMessageFormData({ ...messageFormData, message: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMessageClientOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog open={isReportPreviewOpen} onOpenChange={setIsReportPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedReport?.title}</span>
              <div className="flex gap-2">
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Generated on {selectedReport?.date} | Period: {selectedReport?.period}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedReport.summary || {}).map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.data && selectedReport.data.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Data</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {Object.keys(selectedReport.data[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.data.map((item: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              {Object.values(item).map((value: any, cellIndex: number) => (
                                <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
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
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsReportPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
