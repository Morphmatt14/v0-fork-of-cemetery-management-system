"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { mapStore, type LotBox } from "@/lib/map-store"

interface LotOwnerSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (lotId: string, ownerId: string, ownerName: string, ownerEmail: string) => void
}

export default function LotOwnerSelector({ isOpen, onClose, onAssign }: LotOwnerSelectorProps) {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [availableLots, setAvailableLots] = useState<LotBox[]>([])
  const [selectedLot, setSelectedLot] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = () => {
    // Load clients from auth store
    const authStore = localStorage.getItem("auth_store")
    if (authStore) {
      const auth = JSON.parse(authStore)
      setClients(auth.clientUsers || [])
    }

    // Load available lots from all maps
    const allLots = mapStore.getAllLots()
    const vacant = allLots.filter((lot) => lot.status === "vacant" || !lot.ownerId)
    setAvailableLots(vacant)
  }

  const handleAssign = () => {
    if (!selectedClient || !selectedLot) {
      alert("Please select both a client and a lot")
      return
    }

    const client = clients.find((c) => c.id === selectedClient)
    const lot = availableLots.find((l) => l.id === selectedLot)

    if (client && lot) {
      onAssign(lot.id, client.id, client.name, client.email)
      onClose()
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
          <div>
            <label className="block text-sm font-medium mb-2">Select Client</label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Lot ({availableLots.length} available)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {availableLots.map((lot) => (
                <Card
                  key={lot.id}
                  className={`cursor-pointer transition-all ${selectedLot === lot.id ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedLot(lot.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{lot.id}</p>
                        <p className="text-xs text-gray-600">{lot.section || "No section"}</p>
                        <p className="text-xs text-gray-600">{lot.lotType}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {lot.status}
                      </Badge>
                    </div>
                    {lot.price && (
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
              disabled={!selectedClient || !selectedLot}
            >
              Assign Lot
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
