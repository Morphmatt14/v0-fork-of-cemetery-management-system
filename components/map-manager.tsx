"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { mapStoreApi, type CemeteryMap } from "@/lib/map-store-api"
import { Plus, Trash2, Edit, MapPin, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import AdvancedMapEditor from "./advanced-map-editor"
import { useToast } from "@/hooks/use-toast"

export default function MapManager() {
  const { toast } = useToast()
  const [maps, setMaps] = useState<CemeteryMap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedMapForEdit, setSelectedMapForEdit] = useState<CemeteryMap | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    googleMapsUrl: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")

  // Load maps on component mount
  useEffect(() => {
    loadMaps()
  }, [])

  const loadMaps = async () => {
    setIsLoading(true)
    try {
      const fetchedMaps = await mapStoreApi.getMaps()
      setMaps(fetchedMaps)
    } catch (error) {
      console.error('Failed to load maps:', error)
      toast({
        title: "Error",
        description: "Failed to load cemetery maps",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImagePreview(imageUrl)
        setFormData({ ...formData, imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMap = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a map name.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const newMap = await mapStoreApi.addMap({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        googleMapsUrl: formData.googleMapsUrl,
        sections: [],
        lots: [],
      })

      if (newMap) {
        await loadMaps()
        setFormData({ name: "", description: "", imageUrl: "", googleMapsUrl: "" })
        setImagePreview("")
        setIsAddOpen(false)
        toast({
          title: "Success",
          description: "Cemetery map created successfully",
        })
      }
    } catch (error) {
      console.error('Failed to create map:', error)
      toast({
        title: "Error",
        description: "Failed to create cemetery map",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMap = async (mapId: string) => {
    if (!confirm("Are you sure you want to delete this map?")) return

    try {
      const success = await mapStoreApi.deleteMap(mapId)
      if (success) {
        await loadMaps()
        toast({
          title: "Success",
          description: "Cemetery map deleted successfully",
        })
      }
    } catch (error) {
      console.error('Failed to delete map:', error)
      toast({
        title: "Error",
        description: "Failed to delete cemetery map",
        variant: "destructive",
      })
    }
  }

  if (selectedMapForEdit) {
    return (
      <div>
        <Button variant="outline" onClick={() => setSelectedMapForEdit(null)} className="mb-4">
          ← Back to Maps
        </Button>
        <AdvancedMapEditor mapId={selectedMapForEdit.id} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Cemetery Maps</h3>
          <p className="text-gray-600">Manage cemetery maps and lot locations</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cemetery Map</DialogTitle>
              <DialogDescription>Upload a cemetery aerial image to add lot boundaries</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="map-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Map Name
                </label>
                <Input
                  id="map-name"
                  placeholder="e.g., Garden of Peace Map"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="map-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  id="map-description"
                  placeholder="Describe the cemetery section..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="map-google-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Link (optional)
                </label>
                <Input
                  id="map-google-url"
                  placeholder="Paste Google Maps URL for this cemetery section"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="map-image" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Cemetery Map Image
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="map-image-upload"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {imagePreview ? "Change Image" : "Click to upload aerial photo"}
                      </span>
                    </label>
                    <input
                      id="map-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false)
                    setImagePreview("")
                  }}
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMap} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Map"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Loading cemetery maps...</p>
          </CardContent>
        </Card>
      ) : maps.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No maps added yet. Create your first cemetery map.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {maps.map((map) => (
            <Card key={map.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {map.imageUrl ? (
                  <Image src={map.imageUrl || "/placeholder.svg"} alt={map.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{map.name}</CardTitle>
                    <CardDescription className="mt-2">{map.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{map.lots?.length || 0} lots</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedMapForEdit(map)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Lots
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDeleteMap(map.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                {map.googleMapsUrl && (
                  <div className="mt-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <a href={map.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
