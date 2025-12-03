"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mapStoreApi, type CemeteryMap } from "@/lib/map-store-api"
import { supabase } from "@/lib/supabase-client"
import { MapPin, Navigation, Eye, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LotViewerMapProps {
  userLots?: string[]
  onAppointmentRequest?: (lot: any) => void
}

export default function LotViewerMap({ userLots = [], onAppointmentRequest }: LotViewerMapProps) {
  const [maps, setMaps] = useState<CemeteryMap[]>([])
  const [selectedMap, setSelectedMap] = useState<CemeteryMap | null>(null)
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [showLotDetails, setShowLotDetails] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadMaps = async () => {
    const fetchedMaps = await mapStoreApi.getMaps()
    setMaps(fetchedMaps)
  }

  useEffect(() => {
    let isMounted = true

    loadMaps().then(() => {
      if (!isMounted) return
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    // Subscribe to realtime changes on maps and lots so the viewer stays in sync
    const channel = supabase
      .channel("lot-viewer-map-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cemetery_maps" },
        () => {
          loadMaps()
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "map_lot_positions" },
        () => {
          loadMaps()
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lots" },
        () => {
          loadMaps()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!selectedMap && maps.length > 0) {
      setSelectedMap(maps[0])
    }
  }, [maps, selectedMap])

  useEffect(() => {
    if (selectedMap) {
      drawMap()
    }
  }, [selectedMap, userLots, selectedLot])

  const drawMap = () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedMap) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw lot boxes
      if (selectedMap.lots) {
        const lotsToDraw = selectedMap.lots.filter(
          (lot) => lot.status === "vacant" || userLots.includes(lot.id),
        )

        lotsToDraw.forEach((lot) => {
          const statusColors = {
            occupied: "#4ade80",
            still_on_payment: "#fbbf24",
            vacant: "#f3f4f6",
          }

          const isSelected = selectedLot?.id === lot.id
          const isUserLot = userLots.includes(lot.id)

          ctx.fillStyle = statusColors[lot.status]
          ctx.strokeStyle = isSelected ? "#3b82f6" : isUserLot ? "#0ea5e9" : "#000"
          ctx.lineWidth = isSelected ? 4 : isUserLot ? 3 : 2
          ctx.fillRect(lot.x, lot.y, lot.width, lot.height)
          ctx.strokeRect(lot.x, lot.y, lot.width, lot.height)

          if (isUserLot) {
            ctx.fillStyle = "#0ea5e9"
            ctx.font = "bold 12px Arial"
            ctx.textAlign = "center"
            ctx.fillText("YOUR LOT", lot.x + lot.width / 2, lot.y - 5)
          }

          ctx.fillStyle = "#000"
          ctx.font = "bold 14px Arial"
          ctx.textAlign = "center"
          ctx.fillText(lot.ownerName, lot.x + lot.width / 2, lot.y + lot.height / 2 - 10)
          ctx.font = "12px Arial"
          ctx.fillText(lot.lotType, lot.x + lot.width / 2, lot.y + lot.height / 2 + 5)
        })
      }
    }
    img.src = selectedMap.imageUrl
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !selectedMap || !selectedMap.lots) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const clickableLots = selectedMap.lots.filter(
      (lot) => lot.status === "vacant" || userLots.includes(lot.id),
    )

    const clickedLot = clickableLots.find(
      (lot) => x >= lot.x && x <= lot.x + lot.width && y >= lot.y && y <= lot.y + lot.height,
    )

    if (clickedLot) {
      setSelectedLot(clickedLot)
      setShowLotDetails(true)
    }
  }

  const viewLotOnMap = (lotId: string) => {
    const lot = selectedMap?.lots?.find((l) => l.id === lotId)
    if (lot) {
      setSelectedLot(lot)
      canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  if (maps.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No cemetery maps available yet.</p>
        </CardContent>
      </Card>
    )
  }

  const myLots = selectedMap?.lots?.filter((lot) => userLots.includes(lot.id)) || []
  const availableLots = selectedMap?.lots?.filter((lot) => lot.status === "vacant") || []

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {maps.map((map) => (
          <Button
            key={map.id}
            variant={selectedMap?.id === map.id ? "default" : "outline"}
            onClick={() => setSelectedMap(map)}
            className="whitespace-nowrap"
          >
            {map.name}
          </Button>
        ))}
      </div>

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

      {myLots.length > 0 && (
        <Card className="bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              Your Lots
            </CardTitle>
            <CardDescription>Lots you have purchased in {selectedMap?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myLots.map((lot) => (
                <Card key={lot.id} className="p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium">{lot.ownerName}</h5>
                      <p className="text-sm text-gray-600">{lot.lotType}</p>
                      {lot.dimensions && <p className="text-xs text-gray-500 mt-1">{lot.dimensions}</p>}
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => viewLotOnMap(lot.id)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View on Map
                  </Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMap && (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {selectedMap.name}
                </CardTitle>
                <CardDescription>Click on any lot to view details</CardDescription>
              </div>
              {selectedMap.googleMapsUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={selectedMap.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4 mr-1" />
                    Open in Google Maps
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full border border-gray-300 rounded-lg bg-gray-100 cursor-pointer hover:border-teal-500 transition-colors"
              />

              {availableLots.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">All Lots</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableLots.map((lot) => (
                      <Card
                        key={lot.id}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedLot(lot)
                          setShowLotDetails(true)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{lot.ownerName}</h5>
                            <p className="text-sm text-gray-600">{lot.lotType}</p>
                            {lot.dimensions && <p className="text-xs text-gray-500 mt-1">{lot.dimensions}</p>}
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
                        <Badge
                          className={
                            lot.status === "occupied"
                              ? "bg-green-600 mt-2"
                              : lot.status === "still_on_payment"
                                ? "bg-yellow-600 mt-2"
                                : "bg-gray-600 mt-2"
                          }
                        >
                          {lot.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showLotDetails} onOpenChange={setShowLotDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Lot Details
            </DialogTitle>
            <DialogDescription>Information about the selected lot</DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{selectedLot.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    className={
                      selectedLot.status === "occupied"
                        ? "bg-green-600"
                        : selectedLot.status === "still_on_payment"
                          ? "bg-yellow-600"
                          : "bg-gray-600"
                    }
                  >
                    {selectedLot.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lot Type</p>
                  <p className="font-medium">{selectedLot.lotType}</p>
                </div>
                {selectedLot.dimensions && (
                  <div>
                    <p className="text-sm text-gray-500">Dimensions</p>
                    <p className="font-medium">{selectedLot.dimensions}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t">
                {selectedLot.status === "vacant" ? (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (onAppointmentRequest) {
                        onAppointmentRequest(selectedLot)
                        setShowLotDetails(false)
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment to View This Lot
                  </Button>
                ) : userLots.includes(selectedLot.id) ? (
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      if (onAppointmentRequest) {
                        onAppointmentRequest(selectedLot)
                        setShowLotDetails(false)
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment for Your Lot
                  </Button>
                ) : (
                  <Button className="w-full bg-gray-400" disabled>
                    Lot Not Available
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
