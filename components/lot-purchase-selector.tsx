"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mapStore } from "@/lib/map-store"
import { CheckCircle } from "lucide-react"

export default function LotPurchaseSelector() {
  const [maps, setMaps] = useState(mapStore.getMaps())
  const [selectedMap, setSelectedMap] = useState<string>("")
  const [selectedLots, setSelectedLots] = useState<string[]>([])
  const [lotType, setLotType] = useState<"Lawn" | "Garden" | "Family State">("Lawn")

  const map = maps.find((m) => m.id === selectedMap)
  const availableLots = map?.lots?.filter((lot) => lot.status === "vacant" && lot.lotType === lotType) || []

  const toggleLotSelection = (lotId: string) => {
    setSelectedLots((prev) => (prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Lot</CardTitle>
          <CardDescription>Choose from available cemetery lots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cemetery Section</label>
              <Select value={selectedMap} onValueChange={setSelectedMap}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a map" />
                </SelectTrigger>
                <SelectContent>
                  {maps.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lot Type</label>
              <Select value={lotType} onValueChange={(v: any) => setLotType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lawn">Lawn</SelectItem>
                  <SelectItem value="Garden">Garden</SelectItem>
                  <SelectItem value="Family State">Family State</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {map && (
            <div>
              <p className="text-sm font-medium mb-3">Available Lots: {availableLots.length}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableLots.map((lot) => (
                  <Button
                    key={lot.id}
                    onClick={() => toggleLotSelection(lot.id)}
                    variant={selectedLots.includes(lot.id) ? "default" : "outline"}
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    {selectedLots.includes(lot.id) && <CheckCircle className="h-4 w-4 mb-1" />}
                    <span className="text-xs">Lot {lot.id}</span>
                    <span className="text-xs">₱{(lot.price || 0).toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedLots.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium">
                Selected: {selectedLots.length} lot(s) • Total: ₱
                {selectedLots
                  .reduce((sum, lotId) => {
                    const lot = availableLots.find((l) => l.id === lotId)
                    return sum + (lot?.price || 0)
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
