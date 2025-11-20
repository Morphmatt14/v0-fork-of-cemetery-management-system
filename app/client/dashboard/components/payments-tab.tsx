"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PaymentsTabProps {
  payments: any[]
  lots: any[]
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

export function PaymentsTab({ payments, lots }: PaymentsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
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

  const totalBalance = lots.reduce((sum, lot) => sum + (lot.balance || 0), 0)
  const totalPaid = payments.reduce(
    (sum, payment) => sum + (payment.status === "Paid" ? payment.amount : 0),
    0
  )
  const pendingPayments = payments.filter(
    (p) => p.status === "Due" || p.status === "Pending" || p.status === "Under Payment"
  ).length
  const overduePayments = payments.filter((p) => p.status === "Overdue").length

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
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>Complete history of all your payments</CardDescription>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.lotId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
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
              {lots.map((lot) => (
                <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Lot {lot.id}</h4>
                    <p className="text-sm text-gray-600">{lot.section}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {formatCurrency(lot.price)} | Paid:{" "}
                      {formatCurrency(lot.price - (lot.balance || 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    {lot.balance === 0 ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Fully Paid
                      </Badge>
                    ) : lot.balance > 0 && lot.balance < lot.price ? (
                      <div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Under Payment
                        </Badge>
                        <p className="text-sm font-semibold text-orange-600 mt-1">
                          {formatCurrency(lot.balance)} due
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          Overdue
                        </Badge>
                        <p className="text-sm font-semibold text-red-600 mt-1">
                          {formatCurrency(lot.balance)} overdue
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                For payment arrangements or inquiries, please contact cemetery administration or submit a
                request through the Requests tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
