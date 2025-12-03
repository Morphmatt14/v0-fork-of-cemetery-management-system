"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SchedulePaymentForm } from "./schedule-payment-form"
import { resendClientDocuments } from "@/lib/api/client-api"

interface PaymentsTabProps {
  payments: any[]
  lots: any[]
  clientId: string
  paymentPlans?: any[]
  onRefresh?: () => void
}

const CreditCard = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H5a3 3 0 00-3 3v11a3 3 0 003 3z"
    />
  </svg>
)

export function PaymentsTab({ payments, lots, clientId, paymentPlans = [], onRefresh }: PaymentsTabProps) {
  const [isSchedulePaymentOpen, setIsSchedulePaymentOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [isSendingDocs, setIsSendingDocs] = useState(false)
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)

  const latestInvoiceUrl = useMemo(() => {
    if (!payments?.length) return null

    const sorted = [...payments].sort((a, b) => {
      const aTime = new Date(a.date || a.payment_date || '').getTime()
      const bTime = new Date(b.date || b.payment_date || '').getTime()
      return bTime - aTime
    })

    const firstWithInvoice = sorted.find((payment) => Boolean(payment.invoice_pdf_url))
    if (firstWithInvoice?.invoice_pdf_url) {
      return firstWithInvoice.invoice_pdf_url
    }

    const hasCompletedPayment = sorted.some(
      (payment) => payment.status === 'Paid' || payment.status === 'Completed'
    )

    if (hasCompletedPayment && clientId) {
      return `/api/client/latest-invoice?clientId=${clientId}`
    }

    return null
  }, [payments, clientId])

  const contractUrl = useMemo(() => {
    if (payments?.length) {
      const firstWithContract = payments.find((payment) => Boolean(payment.contract_pdf_url))
      if (firstWithContract?.contract_pdf_url) {
        return firstWithContract.contract_pdf_url
      }
    }

    if (clientId) {
      return `/api/client/certificate-template?clientId=${clientId}`
    }

    return null
  }, [payments, clientId])

  const hasDocuments = Boolean(contractUrl || latestInvoiceUrl)

  const handleSchedulePayment = (lot: any) => {
    setSelectedLot(lot)
    setIsSchedulePaymentOpen(true)
  }

  const handleScheduleSuccess = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleResendDocuments = async () => {
    if (!clientId) return

    try {
      setIsSendingDocs(true)
      await resendClientDocuments(clientId)
      alert('We have emailed your contract and invoices to your registered email address.')
    } catch (error: any) {
      console.error('[PaymentsTab] Failed to resend documents:', error)
      alert(error.message || 'Failed to send documents. Please try again later.')
    } finally {
      setIsSendingDocs(false)
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    // Handle undefined or null status
    if (!status) {
      return "bg-gray-100 text-gray-800 border-gray-200"
    }

    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "under payment":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
      case "due":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const lotSummaries = useMemo(() => {
    const summaries: Record<string, { price: number; totalPaid: number; outstanding: number }> = {}

    lots.forEach((lot) => {
      const key = String(lot.id)
      const price = Number(lot.price) || 0
      summaries[key] = {
        price,
        totalPaid: 0,
        outstanding: price,
      }
    })

    payments.forEach((payment) => {
      const lotKey = String(payment.lotId ?? "")
      if (!lotKey) return

      const matchingLot = lots.find((lot) => String(lot.id) === lotKey)
      if (!matchingLot) return

      const isCompleted =
        payment.status && (payment.status === "Paid" || payment.status === "Completed")

      if (!isCompleted) return

      const price = Number(matchingLot.price) || 0
      const previous = summaries[lotKey] || {
        price,
        totalPaid: 0,
        outstanding: price,
      }

      const amount = Number(payment.amount) || 0
      const newTotalPaid = previous.totalPaid + amount

      summaries[lotKey] = {
        price,
        totalPaid: newTotalPaid,
        outstanding: Math.max(0, price - newTotalPaid),
      }
    })

    return summaries
  }, [lots, payments])

  const totalBalance = useMemo(
    () =>
      lots.reduce((sum, lot) => {
        const key = String(lot.id)
        const summary = lotSummaries[key]

        if (summary) {
          return sum + summary.outstanding
        }

        const price = Number(lot.price) || 0
        const balance = typeof lot.balance === "number" ? lot.balance : price
        return sum + balance
      }, 0),
    [lots, lotSummaries]
  )
  const totalPaid = payments.reduce(
    (sum, payment) => sum + (payment.status === "Paid" || payment.status === "Completed" ? payment.amount : 0),
    0
  )
  const pendingPayments = payments.filter(
    (p) => p.status && (p.status === "Due" || p.status === "Pending" || p.status === "Under Payment")
  ).length
  const overduePayments = payments.filter((p) => p.status === "Overdue").length
  const scheduledPayments = payments.filter(
    (p) => p.status && (p.status === "Pending" || p.status === "Under Payment")
  ).length

  const formatPlanType = (type: string) => {
    if (!type) return 'Custom Plan'
    const normalized = type.toLowerCase()
    if (normalized === 'full') return 'Full Payment'
    return `${normalized[0].toUpperCase()}${normalized.slice(1)} Plan`
  }

  const getNextInstallment = (plan: any) => {
    if (!plan.installments) return null
    const pending = plan.installments
      .filter((inst: any) => inst.status === 'pending')
      .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    return pending[0] || null
  }

  const planStatusClasses = {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    defaulted: 'bg-red-100 text-red-800 border-red-200'
  } as const

  const upcomingInstallments = paymentPlans.flatMap((plan) =>
    (plan.installments || []).map((inst: any) => ({
      ...inst,
      plan
    }))
  )
  .filter((inst) => inst.status === 'pending')
  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const formatDate = (date?: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getLotSummary = (lot: any) => {
    const key = String(lot.id)
    const summary = lotSummaries[key]

    if (summary) return summary

    const price = Number(lot.price) || 0
    const balance = typeof lot.balance === "number" ? lot.balance : price
    const totalPaid = Math.max(0, price - balance)
    const outstanding = Math.max(0, balance)

    return { price, totalPaid, outstanding }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <p className="text-gray-600">View your complete payment records and current balance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-gray-500 mt-1">All time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingPayments}</div>
            <p className="text-xs text-gray-500 mt-1">Payments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overduePayments}</div>
            <p className="text-xs text-gray-500 mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>Complete history of all your payments</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {contractUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={contractUrl} target="_blank" rel="noopener noreferrer">
                  View Certificate
                </a>
              </Button>
            )}
            {latestInvoiceUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={latestInvoiceUrl} target="_blank" rel="noopener noreferrer">
                  Download Latest Invoice
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDocumentViewerOpen(true)}
            >
              View Documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendDocuments}
              disabled={isSendingDocs || !clientId}
            >
              {isSendingDocs ? 'Sending…' : 'Email my documents'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <CreditCard />
              </div>
              <h3 className="text-sm font-medium text-gray-900">No Payment History</h3>
              <p className="text-sm text-gray-500">Your payment records will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString()}
                        {(payment.invoice_pdf_url || payment.contract_pdf_url) && (
                          <div className="mt-2 flex flex-col gap-1">
                            {payment.invoice_pdf_url && (
                              <Button asChild variant="ghost" size="sm" className="px-0 text-blue-600 justify-start">
                                <a href={payment.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                  Download Invoice
                                </a>
                              </Button>
                            )}
                            {payment.contract_pdf_url && (
                              <Button asChild variant="ghost" size="sm" className="px-0 text-emerald-600 justify-start">
                                <a href={payment.contract_pdf_url} target="_blank" rel="noopener noreferrer">
                                  View Contract of Ownership
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.lotLabel || payment.lotId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {payment.status || "Unknown"}
                        </Badge>
                        {payment.agreement_text && (
                          <p className="mt-2 text-xs text-gray-500 max-w-xs">
                            <span className="font-semibold text-gray-700">Agreement:</span> {payment.agreement_text}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status by Lot */}
      {lots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status by Lot</CardTitle>
            <CardDescription>Current payment status for each of your lots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lots.map((lot) => {
                const summary = getLotSummary(lot)
                const isFullyPaid = summary.outstanding <= 0
                const isPartiallyPaid =
                  summary.outstanding > 0 && summary.totalPaid > 0 && summary.outstanding < summary.price

                return (
                  <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Lot {lot.lotLabel || lot.lot_number || lot.id}</h4>
                      <p className="text-sm text-gray-600">{lot.section}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {formatCurrency(summary.price)} | Paid: {" "}
                        {formatCurrency(summary.totalPaid)}
                      </p>
                    </div>
                    <div className="text-right">
                      {isFullyPaid ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Fully Paid
                        </Badge>
                      ) : isPartiallyPaid ? (
                        <div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Under Payment
                          </Badge>
                          <p className="text-sm font-semibold text-orange-600 mt-1">
                            {formatCurrency(summary.outstanding)} due
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleSchedulePayment(lot)}
                            className="mt-2 bg-green-600 hover:bg-green-700 w-full"
                          >
                            Schedule Payment
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            Overdue
                          </Badge>
                          <p className="text-sm font-semibold text-red-600 mt-1">
                            {formatCurrency(summary.outstanding)} overdue
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleSchedulePayment(lot)}
                            className="mt-2 bg-green-600 hover:bg-green-700 w-full"
                          >
                            Schedule Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Plans */}
      {paymentPlans.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Plans</CardTitle>
              <CardDescription>See your active plans and the next installment due</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {paymentPlans.map((plan) => {
                const nextInstallment = getNextInstallment(plan)
                return (
                  <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{formatPlanType(plan.plan_type)}</p>
                        <p className="text-xl font-semibold">{formatCurrency(plan.total_amount)}</p>
                      </div>
                      <Badge variant="outline" className={planStatusClasses[plan.status as keyof typeof planStatusClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                        {plan.status?.[0]?.toUpperCase() + plan.status?.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Plan ID: {plan.id.slice(0, 8).toUpperCase()}</p>
                      <p>Start: {formatDate(plan.start_date)}</p>
                      {plan.end_date && <p>End: {formatDate(plan.end_date)}</p>}
                    </div>
                    {nextInstallment ? (
                      <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                        <p className="text-xs text-blue-600 font-medium">Next Installment</p>
                        <p className="text-sm font-semibold text-blue-900">{formatCurrency(nextInstallment.amount)}</p>
                        <p className="text-xs text-blue-700">Due {formatDate(nextInstallment.due_date)}</p>
                        {nextInstallment.invoice?.pdf_url && (
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <a href={nextInstallment.invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                              Download Invoice
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">All installments paid.</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Installments</CardTitle>
              <CardDescription>Stay on top of what’s due next</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingInstallments.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming installments at the moment.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingInstallments.map((inst) => (
                    <div key={inst.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded-lg p-3 gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(inst.amount)}</p>
                        <p className="text-xs text-gray-500">Due {formatDate(inst.due_date)}</p>
                        <p className="text-xs text-gray-500">Plan: {formatPlanType(inst.plan.plan_type)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                        {inst.invoice?.pdf_url && (
                          <Button asChild variant="secondary" size="sm">
                            <a href={inst.invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                              Download Invoice
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Information Notice */}
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
              <h4 className="font-medium text-blue-900 mb-1">Payment Information</h4>
              <p className="text-sm text-blue-800">
                Schedule your payments using the &quot;Schedule Payment&quot; button above. Once scheduled, cemetery
                staff will update the status after receiving your payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Payment Form */}
      {selectedLot && (
        <SchedulePaymentForm
          lot={selectedLot}
          clientId={clientId}
          isOpen={isSchedulePaymentOpen}
          onClose={() => setIsSchedulePaymentOpen(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}

      <Dialog open={isDocumentViewerOpen} onOpenChange={setIsDocumentViewerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Documents</DialogTitle>
            <DialogDescription>Access the latest certificate of ownership and invoices available for your account.</DialogDescription>
          </DialogHeader>
          {hasDocuments ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Certificate of Ownership</p>
                  <p className="text-sm text-gray-500">PDF generated from your latest contract details.</p>
                </div>
                <Button asChild variant="outline" disabled={!contractUrl}>
                  {contractUrl ? (
                    <a href={contractUrl} target="_blank" rel="noopener noreferrer">
                      View Certificate
                    </a>
                  ) : (
                    <span>No certificate yet</span>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Latest Invoice</p>
                  <p className="text-sm text-gray-500">The most recent payment invoice saved on file.</p>
                </div>
                <Button asChild variant="outline" disabled={!latestInvoiceUrl}>
                  {latestInvoiceUrl ? (
                    <a href={latestInvoiceUrl} target="_blank" rel="noopener noreferrer">
                      Download Invoice
                    </a>
                  ) : (
                    <span>No invoice yet</span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Documents will appear here once your first payment and contract are processed.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
