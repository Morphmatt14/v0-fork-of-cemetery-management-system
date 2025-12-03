"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mapStoreApi, type CemeteryMap, type LotBox } from "@/lib/map-store-api"
import { Trash2 } from "lucide-react"

interface InteractiveMapEditorProps {
  mapId: string
}

export default function InteractiveMapEditor({ mapId }: InteractiveMapEditorProps) {
  const [map, setMap] = useState<CemeteryMap | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<Partial<LotBox> | null>(null)
  const [selectedLot, setSelectedLot] = useState<LotBox | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<LotBox>>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (map) {
      drawMap()
    }
  }, [map, selectedLot])

  useEffect(() => {
    let isMounted = true
    const refreshMap = async () => {
      try {
        const updatedMap = await mapStoreApi.getMapById(mapId)
        if (updatedMap && isMounted) {
          setMap(updatedMap)
        }
      } catch (error) {
        console.error("[InteractiveMapEditor] Failed to refresh map", error)
      }
    }

    refreshMap()
    const interval = setInterval(() => {
      refreshMap()
    }, 2000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [mapId])

  const drawMap = () => {
    const canvas = canvasRef.current
    if (!canvas || !map) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Load and draw the map image
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw existing lot boxes
      if (map.lots) {
        map.lots.forEach((lot) => {
          const statusColors = {
            occupied: "#4ade80",
            still_on_payment: "#fbbf24",
            vacant: "#f3f4f6",
          }

          ctx.fillStyle = statusColors[lot.status]
          ctx.strokeStyle = "#000"
          ctx.lineWidth = 2
          ctx.fillRect(lot.x, lot.y, lot.width, lot.height)
          ctx.strokeRect(lot.x, lot.y, lot.width, lot.height)

          // Draw text
          ctx.fillStyle = "#000"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(lot.ownerName, lot.x + lot.width / 2, lot.y + lot.height / 2 - 10)
          ctx.fillText(lot.lotType, lot.x + lot.width / 2, lot.y + lot.height / 2 + 5)
        })
      }

      // Draw current drawing box
      if (currentBox && currentBox.width && currentBox.height) {
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(currentBox.x || 0, currentBox.y || 0, currentBox.width, currentBox.height)
        ctx.setLineDash([])
      }
    }
    img.src = map.imageUrl
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentBox({ x, y, width: 0, height: 0 })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = Math.abs(x - startPos.x)
    const height = Math.abs(y - startPos.y)

    setCurrentBox({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width,
      height,
    })
    drawMap()
  }

  const handleCanvasMouseUp = () => {
    if (currentBox && currentBox.width && currentBox.height && currentBox.width > 20 && currentBox.height > 20) {
      setEditForm({
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.width,
        height: currentBox.height,
        ownerName: "",
        lotType: "Lawn",
        status: "vacant",
      })
      setIsEditDialogOpen(true)
    }
    setIsDrawing(false)
    setCurrentBox(null)
  }

  const handleSaveLot = async () => {
    if (!map || !editForm.x || !editForm.y || !editForm.width || !editForm.height) {
      alert("Please fill in all required lot details")
      return
    }

    const ownerName = editForm.ownerName?.trim() || "[Available]"
    const updatedMap = await mapStoreApi.addLot(map.id, {
      x: editForm.x,
      y: editForm.y,
      width: editForm.width,
      height: editForm.height,
      ownerName,
      lotType: (editForm.lotType as "Lawn" | "Garden" | "Family State") || "Lawn",
      status: (editForm.status as "vacant" | "still_on_payment" | "occupied") || "vacant",
      dimensions: editForm.dimensions,
      price: editForm.price || 75000,
    })

    if (updatedMap) {
      setMap(updatedMap)
      setIsEditDialogOpen(false)
      setEditForm({})

      alert(
        `✓ Lot "${ownerName}" added successfully!\nIt has been automatically synced to the Lots section and client form.`
      )
    } else {
      alert("Failed to create lot. Please try again.")
    }
  }

  const handleDeleteLot = async (lotId: string) => {
    if (map && confirm("Delete this lot?")) {
      const updatedMap = await mapStoreApi.deleteLot(map.id, lotId)
      if (updatedMap) {
        setMap(updatedMap)
        setSelectedLot(null)
      } else {
        alert("Failed to delete lot. Please try again.")
      }
    }
  }

  if (!map) {
    return <div>Map not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 border border-black"></div>
              <span className="text-sm font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-400 border border-black"></div>
              <span className="text-sm font-medium">Still on Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border border-black"></div>
              <span className="text-sm font-medium">Vacant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Map Editor: Draw Lot Boundaries</CardTitle>
          <CardDescription>Click and drag to draw lot boundaries on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full max-h-96 border border-gray-300 rounded-lg cursor-crosshair bg-gray-100"
          />
        </CardContent>
      </Card>

      {/* Lots List */}
      {map.lots && map.lots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Added Lots ({map.lots.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {map.lots.map((lot) => (
                <Card key={lot.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{lot.ownerName}</h4>
                        <p className="text-sm text-gray-600">{lot.lotType}</p>
                      </div>
                      <div
                        className="w-6 h-6 rounded border border-black"
                        style={{
                          backgroundColor:
                            lot.status === "occupied"
                              ? "#4ade80"
                              : lot.status === "still_on_payment"
                                ? "#fbbf24"
                                : "#f3f4f6",
                        }}
                      />
                    </div>
                    {lot.dimensions && <p className="text-xs text-gray-500">{lot.dimensions}</p>}
                    <Badge
                      className={
                        lot.status === "occupied"
                          ? "bg-green-600"
                          : lot.status === "still_on_payment"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                      }
                    >
                      {lot.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDeleteLot(lot.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lot Details</DialogTitle>
            <DialogDescription>Fill in the details for this lot</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <Input
                placeholder="Owner name"
                value={editForm.ownerName || ""}
                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lot Type</label>
              <Select
                value={editForm.lotType || "Lawn"}
                onValueChange={(value) => setEditForm({ ...editForm, lotType: value as any })}
              >
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
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={editForm.status || "vacant"}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="still_on_payment">Still on Payment</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dimensions (Optional)</label>
              <Input
                placeholder="e.g., 2m x 3m"
                value={editForm.dimensions || ""}
                onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLot} className="bg-blue-600 hover:bg-blue-700">
                Save Lot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
