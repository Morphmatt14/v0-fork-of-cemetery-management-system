"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Check } from "lucide-react"
import { getContent, setContent } from "@/lib/content-manager"

interface PricingItem {
  id: string
  key: string
  name: string
  currentPrice: number
}

const PRICING_ITEMS: PricingItem[] = [
  { id: "1", key: "lawn_lot_price", name: "Lawn Lot", currentPrice: 75000 },
  { id: "2", key: "garden_lot_price", name: "Garden Lot", currentPrice: 120000 },
  { id: "3", key: "family_state_price", name: "Family State", currentPrice: 500000 },
]

export function PricingEditor() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, number>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const newPrices: Record<string, number> = {}
    PRICING_ITEMS.forEach((item) => {
      const price = Number.parseInt(getContent(item.key))
      newPrices[item.key] = price || item.currentPrice
    })
    setPrices(newPrices)
  }, [])

  const handleEdit = (key: string) => {
    setEditingId(key)
    setEditValues({ [key]: prices[key] })
  }

  const handleSave = (key: string) => {
    const newPrice = editValues[key]
    if (newPrice && newPrice > 0) {
      setContent(key, newPrice.toString(), "pricing")
      setPrices({ ...prices, [key]: newPrice })
      setEditingId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lot Pricing</span>
          {saved && (
            <Badge className="bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Update prices for different lot types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PRICING_ITEMS.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Label className="font-medium">{item.name}</Label>
                {editingId === item.key ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave(item.key)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item.key)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {editingId === item.key ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">₱</span>
                  <Input
                    type="number"
                    value={editValues[item.key] || prices[item.key]}
                    onChange={(e) => setEditValues({ ...editValues, [item.key]: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold text-teal-600">₱{prices[item.key]?.toLocaleString() || "0"}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
