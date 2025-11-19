// Shared types for employee dashboard components

export interface DashboardData {
  stats: {
    totalLots: number
    occupiedLots: number
    availableLots: number
    totalClients: number
    monthlyRevenue: number
    pendingInquiries: number
    overduePayments: number
  }
  recentBurials: any[]
  pendingInquiries: any[]
  lots: any[]
  clients: any[]
  payments: any[]
  burials: any[]
}

export interface TabComponentProps {
  dashboardData: DashboardData
  setDashboardData: (data: DashboardData) => void
  lots: any[]
  setLots: (lots: any[]) => void
  clients: any[]
  setClients: (clients: any[]) => void
  payments: any[]
  setPayments: (payments: any[]) => void
  inquiries: any[]
  setInquiries: (inquiries: any[]) => void
  burials: any[]
  setBurials: (burials: any[]) => void
  filteredLots: any[]
  filteredClients: any[]
  filteredPayments: any[]
  filteredInquiries: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  clientSearchTerm: string
  setClientSearchTerm: (term: string) => void
  paymentSearchTerm: string
  setPaymentSearchTerm: (term: string) => void
  inquirySearchTerm: string
  setInquirySearchTerm: (term: string) => void
  isAddLotOpen: boolean
  setIsAddLotOpen: (open: boolean) => void
  isEditLotOpen: boolean
  setIsEditLotOpen: (open: boolean) => void
  isViewLotOpen: boolean
  setIsViewLotOpen: (open: boolean) => void
  isAddClientOpen: boolean
  setIsAddClientOpen: (open: boolean) => void
  isEditClientOpen: boolean
  setIsEditClientOpen: (open: boolean) => void
  isViewClientOpen: boolean
  setIsViewClientOpen: (open: boolean) => void
  isViewBurialOpen: boolean
  setIsViewBurialOpen: (open: boolean) => void
  isReplyInquiryOpen: boolean
  setIsReplyInquiryOpen: (open: boolean) => void
  isViewInquiryOpen: boolean
  setIsViewInquiryOpen: (open: boolean) => void
  isMessageClientOpen: boolean
  setIsMessageClientOpen: (open: boolean) => void
  isAssignOwnerOpen: boolean
  setIsAssignOwnerOpen: (open: boolean) => void
  isReportPreviewOpen: boolean
  setIsReportPreviewOpen: (open: boolean) => void
  isGeneratingReport: boolean
  setIsGeneratingReport: (open: boolean) => void
  reportType: string
  setReportType: (type: string) => void
  reportPeriod: string
  setReportPeriod: (period: string) => void
  reportData: any
  setReportData: (data: any) => void
  selectedReport: any
  setSelectedReport: (report: any) => void
  lotFormData: any
  setLotFormData: (data: any) => void
  clientFormData: any
  setClientFormData: (data: any) => void
  replyFormData: any
  setReplyFormData: (data: any) => void
  messageFormData: any
  setMessageFormData: (data: any) => void
  selectedLot: any
  setSelectedLot: (lot: any) => void
  selectedClient: any
  setSelectedClient: (client: any) => void
  selectedInquiry: any
  setSelectedInquiry: (inquiry: any) => void
  selectedBurial: any
  setSelectedBurial: (burial: any) => void
  handleAddLot: (e?: React.FormEvent) => void
  handleEditLot: () => void
  handleDeleteLot: (lot: any) => void
  handleAddClient: (e?: React.FormEvent) => void
  handleEditClient: () => void
  handleDeleteClient: (client: any) => void
  handleReplyInquiry: () => void
  handleSendMessage: () => void
  handleGenerateReport: () => void
  handleExportReport: () => void
  openEditLot: (lot: any) => void
  openViewLot: (lot: any) => void
  openEditClient: (client: any) => void
  openViewClient: (client: any) => void
  openReplyInquiry: (inquiry: any) => void
  openViewInquiry: (inquiry: any) => void
  openMessageClient: (client: any) => void
  openViewBurial: (burial: any) => void
  getStatusColor: (status: string) => string
  formatCurrency: (value: number | null | undefined) => string
}
