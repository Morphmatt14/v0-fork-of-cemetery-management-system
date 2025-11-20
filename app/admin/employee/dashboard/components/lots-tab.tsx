'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MapPin, Edit, Eye, Trash2, Loader2, Search } from 'lucide-react'
import { fetchLots, updateLot, deleteLot } from '@/lib/api/lots-api'
import type { Lot } from '@/lib/types/lots'
import { useToast } from '@/hooks/use-toast'

export default function LotsTab() {
  const { toast } = useToast()
  
  // Data state
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  // isAddLotOpen removed - Add New Lot feature disabled
  const [isEditLotOpen, setIsEditLotOpen] = useState(false)
  const [isViewLotOpen, setIsViewLotOpen] = useState(false)
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  
  // Form state
  const [lotFormData, setLotFormData] = useState({
    lot_number: '',
    section_id: '',
    lot_type: '',
    status: '',
    price: '',
    dimensions: '',
    features: '',
    description: '',
  })

  // Load lots on mount
  useEffect(() => {
    loadLots()
  }, [])

  const loadLots = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchLots()
      setLots(response.data || [])
    } catch (err: any) {
      console.error('Error loading lots:', err)
      setError(err.message || 'Failed to load lots')
      toast({
        title: 'Error',
        description: 'Failed to load lots. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // handleAddLot function removed - Add New Lot feature disabled per employee.md
  // Lots are now only created through the map drawing tool

  const handleEditLot = async () => {
    if (!selectedLot) return

    try {
      await updateLot(selectedLot.id, {
        lot_number: lotFormData.lot_number,
        section_id: lotFormData.section_id,
        lot_type: lotFormData.lot_type as any,
        status: lotFormData.status as any,
        price: parseFloat(lotFormData.price),
        dimensions: lotFormData.dimensions,
        features: lotFormData.features,
        description: lotFormData.description,
      })

      toast({
        title: 'Lot Updated Successfully',
        description: `Lot ${lotFormData.lot_number} has been updated.`,
      })

      setIsEditLotOpen(false)
      resetFormData()
      setSelectedLot(null)
      await loadLots() // Reload lots
    } catch (err: any) {
      console.error('Error updating lot:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update lot. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteLot = async (lot: Lot) => {
    try {
      await deleteLot(lot.id)

      toast({
        title: 'Lot Deleted',
        description: `Lot ${lot.lot_number} has been deleted.`,
      })

      await loadLots() // Reload lots
    } catch (err: any) {
      console.error('Error deleting lot:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete lot. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const openEditLot = (lot: Lot) => {
    setSelectedLot(lot)
    setLotFormData({
      lot_number: lot.lot_number,
      section_id: lot.section_id || '',
      lot_type: lot.lot_type,
      status: lot.status,
      price: lot.price?.toString() || '',
      dimensions: lot.dimensions || '',
      features: lot.features || '',
      description: lot.description || '',
    })
    setIsEditLotOpen(true)
  }

  const openViewLot = (lot: Lot) => {
    setSelectedLot(lot)
    setIsViewLotOpen(true)
  }

  const resetFormData = () => {
    setLotFormData({
      lot_number: '',
      section_id: '',
      lot_type: '',
      status: '',
      price: '',
      dimensions: '',
      features: '',
      description: '',
    })
  }

  const formatCurrency = (value: number | null | undefined): string => {
    return value != null ? value.toLocaleString() : '0'
  }

  // Filter lots based on search
  const filteredLots = lots.filter((lot) =>
    lot.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lot.section_id && lot.section_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    lot.lot_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-col justify-between items-center mb-4 sm:mb-0">
        <div>
          <h3 className="text-lg font-semibold">Lot Management</h3>
          <p className="text-gray-600">Manage cemetery lots and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsAssignOwnerOpen(true)}
            disabled={filteredLots.length === 0}
            title="Select a lot to assign to an client"
          >
            Assign Lot to Owner
          </Button>
          {/* Add New Lot button removed - lots are created through map drawing only */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Cemetery Lots</CardTitle>
              <CardDescription>Manage lot availability and assignments</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadLots} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            )}

            {filteredLots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No lots found. Lots can only be created through the map editor.</p>
              </div>
            ) : (
              filteredLots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin />
                    </div>
                    <div>
                      <p className="font-medium">Lot {lot.lot_number}</p>
                      <p className="text-sm text-gray-600">
                        {lot.section_id} • {lot.lot_type}
                      </p>
                      <p className="text-sm text-gray-600">₱{formatCurrency(lot.price)}</p>
                      {lot.occupant_name && (
                        <p className="text-xs text-gray-500">Occupant: {lot.occupant_name}</p>
                      )}
                      {lot.owner_id && (
                        <p className="text-xs text-gray-500">Owner ID: {lot.owner_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        lot.status === 'Available'
                          ? 'default'
                          : lot.status === 'Occupied'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {lot.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditLot(lot)}
                        title="Edit this lot"
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewLot(lot)}
                        title="View lot details"
                      >
                        <Eye />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            title="Delete this lot"
                          >
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Lot</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete Lot {lot.lot_number}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteLot(lot)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Lot Dialog - REMOVED per employee.md requirements */}
      {/* Lots are now only created through the map drawing tool */}
      {/* 
      <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>Create a new cemetery lot in the system.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lot-number">Lot Number</Label>
              <Input
                id="lot-number"
                placeholder="e.g., A-001"
                value={lotFormData.lot_number}
                onChange={(e) => setLotFormData({ ...lotFormData, lot_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section ID</Label>
              <Input
                id="section"
                placeholder="e.g., garden-of-peace"
                value={lotFormData.section_id}
                onChange={(e) => setLotFormData({ ...lotFormData, section_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Lot Type</Label>
              <Select
                value={lotFormData.lot_type}
                onValueChange={(value) => setLotFormData({ ...lotFormData, lot_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard (Lawn Lot)</SelectItem>
                  <SelectItem value="Premium">Premium (Garden Lot)</SelectItem>
                  <SelectItem value="Family">Family (Estate)</SelectItem>
                  <SelectItem value="Mausoleum">Mausoleum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={lotFormData.status}
                onValueChange={(value) => setLotFormData({ ...lotFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱)</Label>
              <Input
                id="price"
                type="number"
                placeholder="75000"
                value={lotFormData.price}
                onChange={(e) => setLotFormData({ ...lotFormData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                placeholder="2m x 1m"
                value={lotFormData.dimensions}
                onChange={(e) => setLotFormData({ ...lotFormData, dimensions: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="features">Features</Label>
              <Input
                id="features"
                placeholder="Concrete headstone, garden border"
                value={lotFormData.features}
                onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Beautiful standard lot with garden view"
                value={lotFormData.description}
                onChange={(e) => setLotFormData({ ...lotFormData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddLotOpen(false)}
              type="button"
              title="Cancel adding a new lot"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLot}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={
                !lotFormData.lot_number ||
                !lotFormData.section_id ||
                !lotFormData.lot_type ||
                !lotFormData.status
              }
              type="button"
              title="Add the lot to the system"
            >
              Add Lot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      */}

      {/* Edit Lot Dialog */}
      <Dialog open={isEditLotOpen} onOpenChange={setIsEditLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lot {selectedLot?.lot_number}</DialogTitle>
            <DialogDescription>Update lot information and settings.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lot-number">Lot Number</Label>
              <Input
                id="edit-lot-number"
                value={lotFormData.lot_number}
                onChange={(e) => setLotFormData({ ...lotFormData, lot_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section ID</Label>
              <Input
                id="edit-section"
                value={lotFormData.section_id}
                onChange={(e) => setLotFormData({ ...lotFormData, section_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Lot Type</Label>
              <Select
                value={lotFormData.lot_type}
                onValueChange={(value) => setLotFormData({ ...lotFormData, lot_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Family">Family (Estate)</SelectItem>
                  <SelectItem value="Mausoleum">Mausoleum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={lotFormData.status}
                onValueChange={(value) => setLotFormData({ ...lotFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₱)</Label>
              <Input
                id="edit-price"
                type="number"
                value={lotFormData.price}
                onChange={(e) => setLotFormData({ ...lotFormData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dimensions">Dimensions</Label>
              <Input
                id="edit-dimensions"
                value={lotFormData.dimensions}
                onChange={(e) => setLotFormData({ ...lotFormData, dimensions: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-features">Features</Label>
              <Input
                id="edit-features"
                value={lotFormData.features}
                onChange={(e) => setLotFormData({ ...lotFormData, features: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={lotFormData.description}
                onChange={(e) => setLotFormData({ ...lotFormData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditLotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLot} className="bg-blue-600 hover:bg-blue-700">
              Update Lot
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Lot Dialog */}
      <Dialog open={isViewLotOpen} onOpenChange={setIsViewLotOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lot Details: {selectedLot?.lot_number}</DialogTitle>
            <DialogDescription>Complete information about this lot</DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Lot Number</Label>
                <p className="text-base">{selectedLot.lot_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Section</Label>
                <p className="text-base">{selectedLot.section_id || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Type</Label>
                <p className="text-base">{selectedLot.lot_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge
                  variant={
                    selectedLot.status === 'Available'
                      ? 'default'
                      : selectedLot.status === 'Occupied'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {selectedLot.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Price</Label>
                <p className="text-base">₱{formatCurrency(selectedLot.price)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Dimensions</Label>
                <p className="text-base">{selectedLot.dimensions || 'N/A'}</p>
              </div>
              {selectedLot.occupant_name && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Occupant</Label>
                  <p className="text-base">{selectedLot.occupant_name}</p>
                </div>
              )}
              {selectedLot.owner_id && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Owner ID</Label>
                  <p className="text-base">{selectedLot.owner_id}</p>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-500">Features</Label>
                <p className="text-base">{selectedLot.features || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-base">{selectedLot.description || 'N/A'}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsViewLotOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewLotOpen(false)
                if (selectedLot) openEditLot(selectedLot)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Lot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
