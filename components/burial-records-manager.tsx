'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const LOT_TYPES_MAX_BURIALS = {
  'Lawn Lot': 1,
  'Garden Lot': 2,
  'Family Estate': 4,
}

interface BurialRecord {
  id: string
  deceasedName: string
  lotId: string
  lotType: string
  dateOfBirth: string
  dateOfDeath: string
  burialDate: string
  status: 'pending' | 'completed'
  createdAt: string
}

export function BurialRecordsManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [records, setRecords] = useState<BurialRecord[]>([])
  const [formData, setFormData] = useState({
    deceasedName: '',
    lotId: '',
    dateOfBirth: '',
    dateOfDeath: '',
    burialDate: '',
  })
  const [availableSlots, setAvailableSlots] = useState(0)
  const [maxSlots, setMaxSlots] = useState(1)

  const handleLotSelect = (lotId: string) => {
    // Simulate checking lot type and available slots
    const lotType = 'Family Estate' // In production, fetch from database
    const maxBurials = LOT_TYPES_MAX_BURIALS[lotType as keyof typeof LOT_TYPES_MAX_BURIALS] || 1
    const usedSlots = records.filter(r => r.lotId === lotId).length
    
    setMaxSlots(maxBurials)
    setAvailableSlots(Math.max(0, maxBurials - usedSlots))
    setFormData(prev => ({ ...prev, lotId }))
  }

  const handleAddRecord = () => {
    if (availableSlots <= 0) {
      alert('This lot has no available slots for more burials')
      return
    }

    const newRecord: BurialRecord = {
      id: `burial-${Date.now()}`,
      deceasedName: formData.deceasedName,
      lotId: formData.lotId,
      lotType: maxSlots === 4 ? 'Family Estate' : maxSlots === 2 ? 'Garden Lot' : 'Lawn Lot',
      dateOfBirth: formData.dateOfBirth,
      dateOfDeath: formData.dateOfDeath,
      burialDate: formData.burialDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    setRecords([...records, newRecord])
    setFormData({
      deceasedName: '',
      lotId: '',
      dateOfBirth: '',
      dateOfDeath: '',
      burialDate: '',
    })
    setAvailableSlots(0)
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecords(records.filter(r => r.id !== recordId))
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        + Add Burial Record
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Burial Record</DialogTitle>
            <DialogDescription>
              Register a new burial with automatic slot checking based on lot type
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deceased Name *</Label>
                <Input
                  value={formData.deceasedName}
                  onChange={(e) => setFormData(prev => ({ ...prev, deceasedName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>Lot ID *</Label>
                <Select value={formData.lotId} onValueChange={handleLotSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lot-001">Lot A-001 (Family Estate)</SelectItem>
                    <SelectItem value="lot-002">Lot B-002 (Garden Lot)</SelectItem>
                    <SelectItem value="lot-003">Lot C-003 (Lawn Lot)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
              </div>
              <div>
                <Label>Date of Death *</Label>
                <Input type="date" value={formData.dateOfDeath} onChange={(e) => setFormData(prev => ({ ...prev, dateOfDeath: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Burial Date *</Label>
                <Input type="date" value={formData.burialDate} onChange={(e) => setFormData(prev => ({ ...prev, burialDate: e.target.value }))} />
              </div>
            </div>

            {formData.lotId && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Available Slots</p>
                      <p className="text-2xl font-bold text-blue-600">{availableSlots} / {maxSlots}</p>
                    </div>
                    <Badge variant={availableSlots > 0 ? 'default' : 'destructive'}>
                      {availableSlots > 0 ? 'Can Add' : 'No Slots'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleAddRecord} className="w-full" disabled={availableSlots <= 0}>
              Add Burial Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Burial Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.length === 0 ? (
              <p className="text-gray-500 text-sm">No burial records yet</p>
            ) : (
              records.map(record => (
                <div key={record.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{record.deceasedName}</p>
                    <p className="text-sm text-gray-600">Lot {record.lotId} • {record.burialDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{record.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
