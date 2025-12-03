"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Wallet } from "lucide-react"


interface CashierSummary {
  todaysWalkIns: number
  todaysAmount: number
  queueSize: number
  completedThisMonth: number
  pendingAssigned: number
}

interface CashierDashboardResponse {
  summary: CashierSummary
  processedPayments: any[]
  queue: any[]
  notifications: any[]
}

interface PaymentFormState {
  clientId: string
  clientName: string
  clientEmail: string
  lotId: string
  amount: string
  paymentType: string
  paymentMethod: string
  paymentStatus: string
  notes: string
  agreementText: string
  sourcePaymentId?: string
}

const summaryLayout = [
  { key: "todaysWalkIns", label: "Today's Walk-ins" },
  { key: "todaysAmount", label: "Today's Amount" },
  { key: "queueSize", label: "Queue" },
  { key: "completedThisMonth", label: "Completed (Month)" },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0)

const paymentTypeOptions = [
  "Walk-in Payment",
  "Full Payment",
  "Installment",
  "Partial Payment",
  "Other",
]

const paymentMethodOptions = ["Cash", "Bank Transfer", "Check", "Online Payment"]

const paymentStatusOptions = ["Completed", "Pending", "Overdue", "Cancelled", "Refunded"]

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

const createEmptyPaymentForm = (): PaymentFormState => ({
  clientId: "",
  clientName: "",
  clientEmail: "",
  lotId: "",
  amount: "",
  paymentType: "Walk-in Payment",
  paymentMethod: "Cash",
  paymentStatus: "Completed",
  notes: "",
  agreementText: "",
  sourcePaymentId: "",
})

export default function CashierDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cashierId, setCashierId] = useState<string | null>(null)
  const [cashierName, setCashierName] = useState<string>("")
  const [cashierUsername, setCashierUsername] = useState<string>("")
  const [data, setData] = useState<CashierDashboardResponse | null>(null)
  const [isAcceptPaymentOpen, setIsAcceptPaymentOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(createEmptyPaymentForm())
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [clientLotOptions, setClientLotOptions] = useState<{ id: string; label: string; raw: any }[]>([])
  const [isLoadingClientLots, setIsLoadingClientLots] = useState(false)

  useEffect(() => {
    const cashierSession = localStorage.getItem("cashierSession")
    const currentUser = localStorage.getItem("currentUser")

    if (!cashierSession || !currentUser) {
      router.replace("/admin/employee/login")
      return
    }

    try {
      const parsed = JSON.parse(currentUser)
      if (parsed.role !== "cashier") {
        router.replace("/admin/employee/dashboard")
        return
      }

      setCashierId(parsed.id)
      setCashierName(parsed.name || parsed.username)
      setCashierUsername(parsed.username || parsed.name || "cashier")
      fetchDashboard(parsed.id)
    } catch (err) {
      console.error("[CashierDashboard] Failed to parse current user", err)
      router.replace("/admin/employee/login")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboard = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cashier/dashboard?cashierId=${id}`)

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Unable to load dashboard")
      }

      const payload = await response.json()
      setData(payload.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const processedPayments = useMemo(() => {
    if (!data?.processedPayments) return []

    return data.processedPayments.slice(0, 5).map((payment) => ({
      id: payment.id,
      reference: payment.reference_number || payment.id.slice(0, 8).toUpperCase(),
      client: payment.clients?.name || "Walk-in",
      lot: payment.lots?.lot_number || payment.lot_id || "—",
      amount: payment.amount || 0,
      status: payment.payment_status || "Pending",
      date: payment.payment_date || payment.created_at,
    }))
  }, [data?.processedPayments])

  const handleLogout = () => {
    localStorage.removeItem("cashierSession")
    localStorage.removeItem("currentUser")
    router.replace("/admin/employee/login")
  }

  const openAcceptPaymentDialog = (prefill?: any) => {
    setPaymentForm({
      clientId: prefill?.client_id || "",
      clientName: prefill?.clients?.name || "",
      clientEmail: prefill?.clients?.email || "",
      lotId: prefill?.lot_id || "",
      amount: prefill?.amount?.toString() || "",
      paymentType: prefill?.payment_type || "Walk-in Payment",
      paymentMethod: prefill?.payment_method || "Cash",
      paymentStatus: prefill?.payment_status || "Completed",
      notes: prefill?.notes || "",
      agreementText: "",
      sourcePaymentId: prefill?.id || "",
    })
    setIsAcceptPaymentOpen(true)
  }

  const closeAcceptPaymentDialog = () => {
    setIsAcceptPaymentOpen(false)
    setPaymentForm(createEmptyPaymentForm())
  }

  const handlePaymentFieldChange = (field: keyof PaymentFormState, value: string) => {
    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
      // When switching clients, clear the lot and any linked queued payment id
      ...(field === "clientId" ? { lotId: "", sourcePaymentId: "" } : {}),
    }))

    if (field === "clientId") {
      setClientLotOptions([])
    }
  }

  const loadClientLots = useCallback(
    async (clientId: string) => {
      if (!clientId || !UUID_REGEX.test(clientId)) return
      setIsLoadingClientLots(true)
      try {
        const response = await fetch(`/api/client/lots?clientId=${clientId}`)
        const payload = await response.json()

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error || "Failed to load client lots")
        }

        const normalized = (payload?.data || []).map((lot: any) => ({
          id: lot.id || lot.lot_id || lot.lotNumber || lot.lot_number,
          label: lot.lot_number ? `Lot ${lot.lot_number}${lot.section ? ` • ${lot.section}` : ""}` : lot.id,
          raw: lot,
        }))

        setClientLotOptions(normalized)

        if (normalized.length === 1 && !paymentForm.lotId) {
          setPaymentForm((prev) => ({ ...prev, lotId: normalized[0].id }))
        }
      } catch (error: any) {
        console.error("[CashierDashboard] Failed to load client lots", error)
        toast({
          title: "Unable to load lots",
          description: error?.message || "Please verify the client ID and try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingClientLots(false)
      }
    },
    [paymentForm.lotId, toast]
  )

  useEffect(() => {
    const trimmedId = paymentForm.clientId.trim()
    if (!trimmedId || !UUID_REGEX.test(trimmedId)) {
      setClientLotOptions([])
      return
    }
    loadClientLots(trimmedId)
  }, [paymentForm.clientId, loadClientLots])

  const handleSubmitPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!cashierId) {
      toast({ title: "Missing cashier info", description: "Please sign in again to continue.", variant: "destructive" })
      return
    }

    const trimmedClientId = paymentForm.clientId.trim()
    const trimmedName = paymentForm.clientName.trim()
    const trimmedEmail = paymentForm.clientEmail.trim()

    if (!trimmedClientId && (!trimmedName || !trimmedEmail)) {
      toast({
        title: "Client details required",
        description: "Enter a client ID or provide both name and email.",
        variant: "destructive",
      })
      return
    }

    const trimmedLotId = paymentForm.lotId.trim()
    if (!trimmedLotId) {
      toast({
        title: "Lot required",
        description: "Select a lot before recording the payment.",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number(paymentForm.amount)
    if (!amountValue || amountValue <= 0) {
      toast({ title: "Invalid amount", description: "Enter a payment amount greater than zero.", variant: "destructive" })
      return
    }

    setSubmittingPayment(true)

    try {
      const response = await fetch("/api/cashier/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierId,
          cashierUsername,
          clientId: trimmedClientId || undefined,
          clientName: trimmedName || undefined,
          clientEmail: trimmedEmail || undefined,
          lotId: trimmedLotId,
          amount: amountValue,
          paymentType: paymentForm.paymentType,
          paymentMethod: paymentForm.paymentMethod,
          paymentStatus: paymentForm.paymentStatus,
          notes: paymentForm.notes || undefined,
          agreementText: paymentForm.agreementText || undefined,
          sourcePaymentId: paymentForm.sourcePaymentId || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to record payment")
      }

      toast({
        title: "Payment recorded",
        description: `Reference ${result.data?.reference_number || "updated"} saved successfully.`,
      })
      closeAcceptPaymentDialog()
      await fetchDashboard(cashierId)
    } catch (err: any) {
      console.error("[CashierDashboard] Payment submit failed", err)
      toast({ title: "Payment failed", description: err.message || "Please try again.", variant: "destructive" })
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-60 rounded-md bg-muted animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load cashier dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => cashierId && fetchDashboard(cashierId)}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || !cashierId) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-muted-foreground">Cashier Portal</div>
          <h1 className="text-3xl font-bold">Welcome back, {cashierName || "Cashier"}</h1>
          <p className="text-muted-foreground">
            Track today’s walk-in payments, manage queue assignments, and review notifications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => openAcceptPaymentDialog()} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Accept Payment
          </Button>
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{cashierName || "Cashier"}</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryLayout.map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">
                {item.key === "todaysAmount"
                  ? formatCurrency(data.summary[item.key as keyof CashierSummary] as number)
                  : data.summary[item.key as keyof CashierSummary] ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Assigned</CardDescription>
            <CardTitle className="text-2xl">{data.summary.pendingAssigned}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Monitor client payments and update status after receiving payment</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => cashierId && fetchDashboard(cashierId)}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.queue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No pending payments in queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.queue.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.clients?.name || "Walk-in"}</div>
                        <div className="text-xs text-muted-foreground">{payment.clients?.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.lots?.lot_number || payment.lot_id || "—"}</div>
                        <div className="text-xs text-muted-foreground">{payment.lots?.section || ""}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.payment_status}</Badge>
                      </TableCell>
                      <TableCell>
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => openAcceptPaymentDialog(payment)}
                        >
                          <Wallet className="mr-1 h-4 w-4" /> Confirm Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Latest updates assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              data.notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <Badge variant={notification.is_read ? "outline" : "default"}>
                      {notification.notification_type || "Alert"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest transactions you completed</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No processed payments yet.
                  </TableCell>
                </TableRow>
              ) : (
                processedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.reference}</TableCell>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell>{payment.lot}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAcceptPaymentOpen} onOpenChange={(open) => (open ? setIsAcceptPaymentOpen(true) : closeAcceptPaymentDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Accept Client Payment</DialogTitle>
            <DialogDescription>
              Record a walk-in or queued payment. Provide either an existing client ID or complete the contact
              details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID (optional)</Label>
                <Input
                  id="client-id"
                  value={paymentForm.clientId}
                  onChange={(e) => handlePaymentFieldChange("clientId", e.target.value)}
                  placeholder="UUID from client profile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot-id">Lot ID (optional)</Label>
                <Input
                  id="lot-id"
                  value={paymentForm.lotId}
                  onChange={(e) => handlePaymentFieldChange("lotId", e.target.value)}
                  placeholder="Lot UUID"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!UUID_REGEX.test(paymentForm.clientId.trim()) || isLoadingClientLots}
                    onClick={() => loadClientLots(paymentForm.clientId.trim())}
                  >
                    {isLoadingClientLots ? "Loading..." : "Load from client"}
                  </Button>
                  <span>Requires a valid client ID.</span>
                </div>
              </div>
              {clientLotOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Assigned Lot</Label>
                  <Select value={paymentForm.lotId} onValueChange={(value) => handlePaymentFieldChange("lotId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientLotOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Lots pulled from the client record.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name *</Label>
                <Input
                  id="client-name"
                  value={paymentForm.clientName}
                  onChange={(e) => handlePaymentFieldChange("clientName", e.target.value)}
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={paymentForm.clientEmail}
                  onChange={(e) => handlePaymentFieldChange("clientEmail", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => handlePaymentFieldChange("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <Select value={paymentForm.paymentType} onValueChange={(value) => handlePaymentFieldChange("paymentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value) => handlePaymentFieldChange("paymentMethod", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status *</Label>
                <Select value={paymentForm.paymentStatus} onValueChange={(value) => handlePaymentFieldChange("paymentStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={paymentForm.notes}
                onChange={(e) => handlePaymentFieldChange("notes", e.target.value)}
                placeholder="Add payment remarks (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreement">Agreement Text</Label>
              <Textarea
                id="agreement"
                value={paymentForm.agreementText}
                onChange={(e) => handlePaymentFieldChange("agreementText", e.target.value)}
                placeholder="Custom agreement text for the receipt (optional)"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeAcceptPaymentDialog} disabled={submittingPayment}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingPayment} className="bg-green-600 hover:bg-green-700">
                {submittingPayment ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
