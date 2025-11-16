"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { contentStore, type PricingItem } from "@/lib/content-store"
import { DollarSign } from "lucide-react"

export function AdminPricingEditor() {
  const [pricing, setPricing] = useState<PricingItem[]>([])
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    const items = contentStore.getPricing()
    setPricing(items)
  }, [])

  const handlePriceUpdate = (type: "lawn" | "garden" | "family", price: number) => {
    contentStore.updatePrice(type, price)
    setPricing((prev) => prev.map((p) => (p.type === type ? { ...p, price } : p)))
    setSaveMessage("✓ Price updated!")
    setTimeout(() => setSaveMessage(""), 2000)
  }

  const handleDescriptionUpdate = (type: "lawn" | "garden" | "family", description: string) => {
    const pricing = contentStore.getPricing()
    const index = pricing.findIndex((p) => p.type === type)
    if (index !== -1) {
      pricing[index].description = description
      contentStore.savePricing(pricing)
      setPricing(pricing)
      setSaveMessage("✓ Description updated!")
      setTimeout(() => setSaveMessage(""), 2000)
    }
  }

  const lotTypes = [
    { type: "lawn" as const, label: "Lawn Lot", color: "bg-blue-50 border-blue-200" },
    { type: "garden" as const, label: "Garden Lot", color: "bg-green-50 border-green-200" },
    { type: "family" as const, label: "Family State", color: "bg-purple-50 border-purple-200" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Management
          </CardTitle>
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((item) => {
            const lotConfig = lotTypes.find((lt) => lt.type === item.type)
            return (
              <div key={item.type} className={`${lotConfig?.color} border rounded-lg p-4 space-y-4`}>
                <h3 className="font-semibold text-lg">{lotConfig?.label}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₱</span>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => handlePriceUpdate(item.type, Number(e.target.value))}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleDescriptionUpdate(item.type, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-h-20"
                  />
                </div>

                <div className="text-xs text-gray-600 pt-2 border-t">Current: ₱{item.price.toLocaleString()}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
