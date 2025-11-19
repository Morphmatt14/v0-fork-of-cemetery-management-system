"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mapStoreApi, type CemeteryMap, type LotBox } from "@/lib/map-store-api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const ZoomIn = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
    />
  </svg>
)

const ZoomOut = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6"
    />
  </svg>
)

const ResetZoom = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

declare global {
  interface Window {
    fabric: any
  }
}

interface DrawingLot extends LotBox {
  fabricObject?: any
  rotation?: number
}

export default function AdvancedMapEditor({ mapId }: { mapId: string }) {
  const { toast } = useToast()
  const [map, setMap] = useState<CemeteryMap | null>(null)
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [mapImage, setMapImage] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<Partial<DrawingLot>>({})
  const [editingLotId, setEditingLotId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [bulkCreateForm, setBulkCreateForm] = useState({
    count: 10,
    lotType: "Lawn" as const,
    basePrice: 75000,
    spacing: 150,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [editMode, setEditMode] = useState<"draw" | "edit" | "bulk">("draw")
  const [fabricLoaded, setFabricLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Load map data
  useEffect(() => {
    loadMap()
  }, [mapId])

  const loadMap = async () => {
    setIsLoadingMap(true)
    try {
      const fetchedMap = await mapStoreApi.getMapById(mapId)
      if (fetchedMap) {
        setMap(fetchedMap)
        setMapImage(fetchedMap.imageUrl)
      }
    } catch (error) {
      console.error('Failed to load map:', error)
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMap(false)
    }
  }

  const handleEditLot = (lot: DrawingLot) => {
    setEditForm(lot)
    setEditingLotId(lot.id)
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="fabric.min.js"]')
    if (existingScript) {
      if (window.fabric) {
        setFabricLoaded(true)
      }
      return
    }

    if (!window.fabric) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"
      script.async = true
      script.onload = () => {
        console.log('Fabric.js loaded successfully')
        setFabricLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load Fabric.js')
        toast({
          title: "Error",
          description: "Failed to load map editor library",
          variant: "destructive",
        })
      }
      document.head.appendChild(script)
    } else {
      setFabricLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current || !map || isLoadingMap) return
    
    // Clear existing canvas if it exists
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
      fabricCanvasRef.current = null
    }

    const fabric = window.fabric
    if (!fabric) {
      console.error('Fabric.js not available')
      return
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#f3f4f6",
    })

    fabricCanvasRef.current = canvas

    if (mapImage) {
      loadBackgroundImage(mapImage)
    }

    if (map.lots && map.lots.length > 0) {
      map.lots.forEach((lot) => {
        addLotToCanvas(lot)
      })
    }

    canvas.on("object:modified", handleObjectModified)
    canvas.on("selection:created", handleSelection)
    canvas.on("selection:updated", handleSelection)

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [fabricLoaded, map, mapImage, isLoadingMap])

  const loadBackgroundImage = (imageUrl: string) => {
    if (!fabricCanvasRef.current || !window.fabric) return

    const fabric = window.fabric
    
    fabric.Image.fromURL(
      imageUrl, 
      (img: any) => {
        if (!img) {
          console.error('Failed to load image')
          return
        }
        img.set({
          selectable: false,
          evented: false,
        })
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.setBackgroundImage(
            img, 
            fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current), 
            {
              scaleX: fabricCanvasRef.current.width / img.width,
              scaleY: fabricCanvasRef.current.height / img.height,
            }
          )
        }
      },
      {
        crossOrigin: 'anonymous'
      }
    )
  }

  const addLotToCanvas = (lot: DrawingLot) => {
    if (!fabricCanvasRef.current || !window.fabric) return

    const fabric = window.fabric
    const statusColors: Record<string, string> = {
      occupied: "#4ade80",
      still_on_payment: "#fbbf24",
      vacant: "#e5e7eb",
    }

    const rect = new fabric.Rect({
      width: lot.width,
      height: lot.height,
      fill: statusColors[lot.status],
      stroke: "#000",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
    })

    const text = new fabric.Text(`${lot.ownerName}\n${lot.lotType}`, {
      fontSize: 10,
      fontWeight: "bold",
      fill: "#000",
      originX: "center",
      originY: "top",
      textAlign: "center",
      top: lot.height / 2 + 5,
    })

    const group = new fabric.Group([rect, text], {
      left: lot.x,
      top: lot.y,
      angle: lot.rotation || 0,
      lockScalingFlip: true,
      objectCaching: false,
      minScaleLimit: 0.1,
    })

    group.lotId = lot.id
    group.lotData = lot

    fabricCanvasRef.current.add(group)
    fabricCanvasRef.current.renderAll()
  }

  const handleObjectModified = (e: any) => {
    const obj = e.target
    if (!obj.lotId || !map) return

    const actualWidth = Math.round(obj.width * obj.scaleX)
    const actualHeight = Math.round(obj.height * obj.scaleY)

    const updatedLot: Partial<LotBox> = {
      x: Math.round(obj.left),
      y: Math.round(obj.top),
      width: actualWidth,
      height: actualHeight,
      rotation: Math.round(obj.angle),
    }

    // This must be done AFTER calculating the new dimensions
    const items = obj._objects
    if (items && items.length > 0) {
      const rect = items[0] // The rectangle is the first item
      const text = items[1] // The text is the second item

      rect.set({
        width: actualWidth,
        height: actualHeight,
      })

      text.set({
        top: actualHeight / 2 + 5, // Keep text below the box
      })
    }

    obj.set({
      scaleX: 1,
      scaleY: 1,
      width: actualWidth,
      height: actualHeight,
    })

    obj.setCoords()
    fabricCanvasRef.current.renderAll()

    // Update lot position in database
    mapStoreApi.updateLot(map.id, obj.lotId, updatedLot).then((newMap) => {
      if (newMap) setMap(newMap)
    }).catch(error => {
      console.error('Failed to update lot position:', error)
    })
  }

  const handleSelection = (e: any) => {
    // Handle selection events if needed
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && fabricCanvasRef.current) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string
        setMapImage(imageUrl)
        loadBackgroundImage(imageUrl)

        if (map) {
          const updated = await mapStoreApi.updateMap(map.id, { ...map, imageUrl })
          if (updated) setMap(updated)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCanvasClick = (e: any) => {
    if (editMode !== "draw" || !fabricCanvasRef.current) return

    const pointer = fabricCanvasRef.current.getPointer(e.e)
    setEditForm({
      x: Math.round(pointer.x - 50),
      y: Math.round(pointer.y - 60),
      width: 100,
      height: 120,
      ownerName: "[Available]",
      lotType: "Lawn",
      status: "vacant",
      rotation: 0,
    })
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    if (!fabricCanvasRef.current) return

    fabricCanvasRef.current.off("mouse:down")

    if (editMode === "draw") {
      fabricCanvasRef.current.selection = false
      fabricCanvasRef.current.forEachObject((obj: any) => {
        obj.selectable = false
        obj.hasControls = false
        obj.hasBorders = false
      })
      fabricCanvasRef.current.on("mouse:down", handleCanvasClick)
    } else if (editMode === "edit") {
      fabricCanvasRef.current.selection = true
      fabricCanvasRef.current.forEachObject((obj: any) => {
        if (obj.lotId) {
          obj.selectable = true
          obj.hasControls = true
          obj.hasBorders = true
          obj.lockRotation = false
        }
      })
    } else {
      fabricCanvasRef.current.selection = false
      fabricCanvasRef.current.forEachObject((obj: any) => {
        obj.selectable = false
        obj.hasControls = false
        obj.hasBorders = false
      })
    }

    fabricCanvasRef.current.renderAll()
  }, [editMode])

  const handleZoomIn = () => {
    if (!fabricCanvasRef.current) return
    const newZoom = Math.min(zoom + 0.2, 3)
    setZoom(newZoom)
    fabricCanvasRef.current.setZoom(newZoom)
    fabricCanvasRef.current.renderAll()
  }

  const handleZoomOut = () => {
    if (!fabricCanvasRef.current) return
    const newZoom = Math.max(zoom - 0.2, 0.5)
    setZoom(newZoom)
    fabricCanvasRef.current.setZoom(newZoom)
    fabricCanvasRef.current.renderAll()
  }

  const handleResetZoom = () => {
    if (!fabricCanvasRef.current) return
    setZoom(1)
    fabricCanvasRef.current.setZoom(1)
    fabricCanvasRef.current.renderAll()
  }

  const handleSaveLot = async () => {
    if (!map || !editForm.ownerName) return

    setIsSaving(true)
    try {
      if (editingLotId) {
        const newMap = await mapStoreApi.updateLot(map.id, editingLotId, {
          x: editForm.x,
          y: editForm.y,
          width: editForm.width,
          height: editForm.height,
          ownerName: editForm.ownerName,
          lotType: editForm.lotType as "Lawn" | "Garden" | "Family State",
          status: editForm.status as "vacant" | "still_on_payment" | "occupied",
          price: editForm.price,
          rotation: editForm.rotation || 0,
        })

        if (newMap && fabricCanvasRef.current) {
          setMap(newMap)

          fabricCanvasRef.current.getObjects().forEach((obj: any) => {
            if (obj.lotId === editingLotId) {
              fabricCanvasRef.current.remove(obj)
            }
          })
          newMap.lots?.forEach((lot: any) => addLotToCanvas(lot))
          toast({ title: "Success", description: "Lot updated successfully" })
        }
      } else {
        const newMap = await mapStoreApi.addLot(map.id, {
          x: editForm.x || 0,
          y: editForm.y || 0,
          width: editForm.width || 100,
          height: editForm.height || 120,
          ownerName: editForm.ownerName || "[Available]",
          lotType: editForm.lotType as "Lawn" | "Garden" | "Family State" || "Lawn",
          status: editForm.status as "vacant" | "still_on_payment" | "occupied" || "vacant",
          price: editForm.price || 75000,
          rotation: editForm.rotation || 0,
        })

        if (newMap && fabricCanvasRef.current) {
          setMap(newMap)
          const newLot = newMap.lots?.[newMap.lots.length - 1]
          if (newLot) addLotToCanvas(newLot)
          toast({ title: "Success", description: "Lot created successfully" })
        }
      }

      setEditForm({})
      setEditingLotId(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Failed to save lot:', error)
      toast({ title: "Error", description: "Failed to save lot", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkCreate = async () => {
    if (!map) return

    setIsSaving(true)
    try {
      const newMap = await mapStoreApi.createBulkLots(
        map.id,
        {
          count: bulkCreateForm.count,
          lotType: bulkCreateForm.lotType,
          basePrice: bulkCreateForm.basePrice,
        },
        100,
        100,
        bulkCreateForm.spacing,
      )

      if (newMap && fabricCanvasRef.current) {
        setMap(newMap)
        fabricCanvasRef.current.getObjects().forEach((obj: any) => {
          if (obj.lotId) {
            fabricCanvasRef.current.remove(obj)
          }
        })
        newMap.lots?.forEach((lot: any) => addLotToCanvas(lot))
        toast({ 
          title: "Success", 
          description: `Created ${bulkCreateForm.count} ${bulkCreateForm.lotType} lots!` 
        })
      }
    } catch (error) {
      console.error('Failed to create bulk lots:', error)
      toast({ title: "Error", description: "Failed to create lots", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!fabricCanvasRef.current || !map) return

    const activeObjects = fabricCanvasRef.current.getActiveObjects()
    if (activeObjects.length === 0) return

    if (!confirm(`Delete ${activeObjects.length} selected lot(s)?`)) return

    setIsSaving(true)
    try {
      let updatedMap = map
      for (const obj of activeObjects) {
        if (obj.lotId) {
          updatedMap = await mapStoreApi.deleteLot(updatedMap.id, obj.lotId) || updatedMap
          fabricCanvasRef.current.remove(obj)
        }
      }
      setMap(updatedMap)
      fabricCanvasRef.current.discardActiveObject()
      fabricCanvasRef.current.renderAll()
      toast({ title: "Success", description: "Lots deleted successfully" })
    } catch (error) {
      console.error('Failed to delete lots:', error)
      toast({ title: "Error", description: "Failed to delete lots", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingMap) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Loading map data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!map) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Map not found. Please go back and try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!fabricLoaded) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Loading map editor...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-blue-50">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border border-black"></div>
              <span className="text-xs sm:text-sm font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 border border-black"></div>
              <span className="text-xs sm:text-sm font-medium">Still on Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 border border-black"></div>
              <span className="text-xs sm:text-sm font-medium">Vacant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Cemetery Map Editor</CardTitle>
          <CardDescription className="text-sm">
            {editMode === "draw" && "Click on the map to add a new lot"}
            {editMode === "edit" && "Click to select, drag to move, use handles to resize and rotate"}
            {editMode === "bulk" && "Use the form below to create multiple lots at once"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleZoomIn} variant="outline" size="sm" title="Zoom In">
              <ZoomIn />
            </Button>
            <Button onClick={handleZoomOut} variant="outline" size="sm" title="Zoom Out">
              <ZoomOut />
            </Button>
            <Button onClick={handleResetZoom} variant="outline" size="sm" title="Reset Zoom">
              <ResetZoom />
            </Button>
            <span className="text-sm text-gray-600 flex items-center ml-2">Zoom: {Math.round(zoom * 100)}%</span>
          </div>

          <div className="relative w-full overflow-auto">
            <canvas ref={canvasRef} className="w-full max-w-full border-2 border-gray-300 rounded-lg" />
            {!fabricLoaded && <p className="text-sm text-gray-500 mt-2">Loading editor...</p>}
          </div>
        </CardContent>
      </Card>

      <Tabs value={editMode} onValueChange={(v: any) => setEditMode(v)}>
        <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
          <TabsTrigger value="draw">Draw Lots</TabsTrigger>
          <TabsTrigger value="edit">Edit/Move</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Create</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Cemetery Map Image</CardTitle>
              <CardDescription>Upload your aerial cemetery map image</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {mapImage && <p className="text-sm text-green-600 mt-2">✓ Map image loaded</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit & Move Instructions</CardTitle>
              <CardDescription>
                Click lots to select them, drag to move, use corner handles to resize, use the top circular handle to
                rotate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" onClick={handleDeleteSelected}>
                Delete Selected
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Create Lots</CardTitle>
              <CardDescription>Create multiple lots of the same type at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Lots</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkCreateForm.count}
                    onChange={(e) => setBulkCreateForm({ ...bulkCreateForm, count: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lot Type</label>
                  <Select
                    value={bulkCreateForm.lotType}
                    onValueChange={(value: any) => setBulkCreateForm({ ...bulkCreateForm, lotType: value })}
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
                  <label className="block text-sm font-medium mb-1">Base Price (₱)</label>
                  <Input
                    type="number"
                    value={bulkCreateForm.basePrice}
                    onChange={(e) =>
                      setBulkCreateForm({ ...bulkCreateForm, basePrice: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Spacing (px)</label>
                  <Input
                    type="number"
                    value={bulkCreateForm.spacing}
                    onChange={(e) => setBulkCreateForm({ ...bulkCreateForm, spacing: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={handleBulkCreate} className="bg-blue-600 hover:bg-blue-700 w-full">
                Create {bulkCreateForm.count} Lots
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {map.lots && map.lots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Lots ({map.lots.length})</CardTitle>
            <CardDescription className="text-sm">Click on any lot to edit details manually</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {map.lots.map((lot) => (
                <Card
                  key={lot.id}
                  className="p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEditLot(lot)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{lot.ownerName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{lot.lotType}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
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
                    <p className="text-xs text-gray-500">₱{(lot.price || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">
                      Position: ({Math.round(lot.x)}, {Math.round(lot.y)}) | Size: {Math.round(lot.width)}x
                      {Math.round(lot.height)}
                      {lot.rotation ? ` | Rotation: ${Math.round(lot.rotation)}°` : ""}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLotId ? "Edit Lot Details" : "New Lot Details"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <Input
                placeholder="Owner name or [Available]"
                value={editForm.ownerName || ""}
                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lot Type</label>
              <Select
                value={editForm.lotType || "Lawn"}
                onValueChange={(value: any) => setEditForm({ ...editForm, lotType: value })}
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
                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
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
              <label className="block text-sm font-medium mb-1">Price (₱)</label>
              <Input
                type="number"
                value={Math.round(editForm.price || 75000)}
                onChange={(e) => setEditForm({ ...editForm, price: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">X Position</label>
                <Input
                  type="number"
                  value={Math.round(editForm.x || 0)}
                  onChange={(e) => setEditForm({ ...editForm, x: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Y Position</label>
                <Input
                  type="number"
                  value={Math.round(editForm.y || 0)}
                  onChange={(e) => setEditForm({ ...editForm, y: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <Input
                  type="number"
                  value={Math.round(editForm.width || 100)}
                  onChange={(e) => setEditForm({ ...editForm, width: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <Input
                  type="number"
                  value={Math.round(editForm.height || 120)}
                  onChange={(e) => setEditForm({ ...editForm, height: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Rotation (degrees)</label>
                <Input
                  type="number"
                  value={Math.round(editForm.rotation || 0)}
                  onChange={(e) => setEditForm({ ...editForm, rotation: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingLotId(null)
                  setEditForm({})
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveLot} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
