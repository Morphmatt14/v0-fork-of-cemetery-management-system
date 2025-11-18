'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function GuestModeControls() {
  const [guestContent, setGuestContent] = useState({
    displayComments: true,
    displayPrices: true,
    publicMessage: 'Welcome to Surigao Memorial Park',
    mainPrice: 75000,
  })
  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = () => {
    localStorage.setItem('guestModeContent', JSON.stringify(guestContent))
    setSaveMessage('Guest mode content updated')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <Card className="border-teal-200 bg-teal-50">
      <CardHeader>
        <CardTitle>Guest Mode Controls</CardTitle>
        <CardDescription>Admin can edit content displayed to public guests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {saveMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Public Message</label>
          <Textarea
            value={guestContent.publicMessage}
            onChange={(e) => setGuestContent({ ...guestContent, publicMessage: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Base Lot Price</label>
          <Input
            type="number"
            value={guestContent.mainPrice}
            onChange={(e) => setGuestContent({ ...guestContent, mainPrice: parseInt(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={guestContent.displayComments ? 'default' : 'outline'}
            onClick={() => setGuestContent({ ...guestContent, displayComments: !guestContent.displayComments })}
            className="w-full"
          >
            {guestContent.displayComments ? '✓ Comments Visible' : '✗ Hide Comments'}
          </Button>
          <Button
            variant={guestContent.displayPrices ? 'default' : 'outline'}
            onClick={() => setGuestContent({ ...guestContent, displayPrices: !guestContent.displayPrices })}
            className="w-full"
          >
            {guestContent.displayPrices ? '✓ Prices Visible' : '✗ Hide Prices'}
          </Button>
        </div>

        <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700">
          Save Guest Mode Settings
        </Button>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Editable by Admin only:</strong> Changes apply to all guest-facing content immediately.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
