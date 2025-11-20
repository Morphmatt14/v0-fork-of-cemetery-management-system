"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface LotOwnerSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (lotId: string, ownerId: string, ownerName: string, ownerEmail: string) => Promise<void> | void
}

type ClientOption = {
  id: string
  name: string
  email?: string
}

type LotOption = {
  id: string
  lot_number: string
  section_id?: string | null
  lot_type?: string | null
  status?: string | null
  price?: number | null
}

export default function LotOwnerSelector({ isOpen, onClose, onAssign }: LotOwnerSelectorProps) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [availableLots, setAvailableLots] = useState<LotOption[]>([])
  const [selectedLot, setSelectedLot] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      setSelectedClient("")
      setSelectedLot("")
      setError(null)
    }
  }, [isOpen])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [clientsRes, lotsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/lots?status=Available"),
      ])

      const clientsJson = await clientsRes.json()
      if (!clientsRes.ok || !clientsJson.success) {
        throw new Error(clientsJson.error || "Failed to load clients")
      }
      setClients(clientsJson.data || [])

      const lotsJson = await lotsRes.json()
      if (!lotsRes.ok || !lotsJson.success) {
        throw new Error(lotsJson.error || "Failed to load lots")
      }

      const available = (lotsJson.data || [])
        .filter((lot: LotOption) => lot.status === "Available")
        .map((lot: any) => ({
          id: lot.id,
          lot_number: lot.lot_number,
          section_id: lot.section_id,
          lot_type: lot.lot_type,
          status: lot.status,
          price: lot.price,
        }))
      setAvailableLots(available)
    } catch (err) {
      console.error("[LotOwnerSelector] loadData error", err)
      setError(err instanceof Error ? err.message : "Failed to load assignment data")
      setClients([])
      setAvailableLots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedClient || !selectedLot) {
      alert("Please select both a client and a lot")
      return
    }

    const client = clients.find((c) => c.id === selectedClient)
    const lot = availableLots.find((l) => l.id === selectedLot)

    if (client && lot) {
      try {
        setIsSubmitting(true)
        await Promise.resolve(onAssign(lot.id, client.id, client.name, client.email || ""))
        onClose()
      } catch (err) {
        console.error("[LotOwnerSelector] assign error", err)
        setError(err instanceof Error ? err.message : "Failed to assign lot")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Lot to Owner</DialogTitle>
          <DialogDescription>Select a client and assign them to a vacant lot</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-2">Select Client</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 && !isLoading && (
                  <div className="px-3 py-2 text-sm text-gray-500">No clients available</div>
                )}
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name || "Unnamed"}
                    {client.email ? ` (${client.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Lot ({availableLots.length} available)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {isLoading && <p className="text-sm text-gray-500">Loading lots...</p>}
              {!isLoading && availableLots.length === 0 && (
                <p className="text-sm text-gray-500">No available lots</p>
              )}
              {availableLots.map((lot) => (
                <Card
                  key={lot.id}
                  className={`cursor-pointer transition-all ${selectedLot === lot.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedLot(lot.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">Lot {lot.lot_number}</p>
                        <p className="text-xs text-gray-600">
                          {lot.section_id || "No section"} • {lot.lot_type || "Unknown type"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {lot.status || "n/a"}
                      </Badge>
                    </div>
                    {typeof lot.price === "number" && (
                      <p className="text-xs font-medium text-green-600 mt-1">₱{lot.price.toLocaleString()}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedClient || !selectedLot || isSubmitting}
            >
              {isSubmitting ? "Assigning..." : "Assign Lot"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
