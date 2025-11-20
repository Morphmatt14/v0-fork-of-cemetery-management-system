"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MyLotsTabProps {
  lots: any[]
  onViewDetails: (lot: any) => void
}

const Eye = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

export function MyLotsTab({ lots, onViewDetails }: MyLotsTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "vacant":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (balance: number) => {
    if (balance === 0) return "bg-green-100 text-green-800 border-green-200"
    if (balance > 0) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentStatusText = (balance: number, price: number) => {
    if (balance === 0) return "Fully Paid"
    if (balance > 0 && balance < price) return "Under Payment"
    if (balance >= price) return "Outstanding"
    return "N/A"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Lots</h2>
        <p className="text-gray-600">
          You have {lots.length} lot{lots.length !== 1 ? "s" : ""} registered in the memorial park
        </p>
      </div>

      {lots.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-gray-400"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Lots Assigned</h3>
              <p className="text-gray-600">You don't have any lots assigned yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Contact cemetery staff to inquire about available lots.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lots.map((lot) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Lot {lot.id}</CardTitle>
                    <CardDescription>{lot.section}</CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(lot.status)}>
                    {lot.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Deceased Information */}
                {lot.occupant && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Deceased Person</h4>
                        <p className="text-sm text-gray-700 font-medium">{lot.occupant}</p>
                        {lot.burialDate && (
                          <p className="text-xs text-gray-600 mt-1">
                            Burial Date: {new Date(lot.burialDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lot Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{lot.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium text-gray-900">{lot.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(lot.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                    <Badge variant="outline" className={getPaymentStatusColor(lot.balance)}>
                      {getPaymentStatusText(lot.balance, lot.price)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(lot.price)}
                      </span>
                    </div>
                    {lot.balance > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Outstanding Balance:</span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(lot.balance)}
                        </span>
                      </div>
                    )}
                    {lot.balance === 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">✓ Fully Paid</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onViewDetails(lot)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye />
                  <span className="ml-2">View Full Details</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {lots.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lots.filter((l) => l.status === "Occupied").length}
                </div>
                <div className="text-sm text-gray-600">Occupied Lots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {lots.filter((l) => l.status === "Reserved").length}
                </div>
                <div className="text-sm text-gray-600">Reserved Lots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(lots.reduce((sum, lot) => sum + lot.balance, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
