'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAutomatedRecords, clearAutomatedRecords } from '@/lib/automated-data-utils'

const Trash = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12H5.067L4 7m2 0h12m-3 0a3 3 0 00-6 0m0 0H7m12 0a3 3 0 013 3v3a3 3 0 01-3 3H3a3 3 0 01-3-3v-3a3 3 0 013-3h12z" />
  </svg>
)

export function AdminToolsClearData() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [automatedCount, setAutomatedCount] = useState(0)
  const [isClearing, setIsClearing] = useState(false)
  const [result, setResult] = useState<{ deleted: number; manualRecordsPreserved: number } | null>(null)

  const handleOpenDialog = () => {
    const records = getAutomatedRecords()
    setAutomatedCount(records.length)
    setShowConfirm(true)
  }

  const handleClearData = async () => {
    setIsClearing(true)
    try {
      const clearResult = clearAutomatedRecords()
      setResult(clearResult)
      setTimeout(() => {
        setShowConfirm(false)
        setIsClearing(false)
        setResult(null)
      }, 2000)
    } catch (error) {
      console.error('[v0] Error clearing data:', error)
      setIsClearing(false)
    }
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash />
            Automated Data Management
          </CardTitle>
          <CardDescription>
            Remove auto-generated logs, reminders, and notifications while preserving manual records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Automated records found:</p>
              <p className="text-2xl font-bold text-amber-600">{automatedCount}</p>
            </div>
            <Badge variant="secondary">System-Generated</Badge>
          </div>
          <Button
            onClick={handleOpenDialog}
            variant="destructive"
            className="w-full"
          >
            <Trash />
            Clear Automated Records
          </Button>
          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ Cleared {result.deleted} automated record(s). {result.manualRecordsPreserved} manual record(s) preserved.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Automated Records?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {automatedCount} auto-generated records including logs, reminders, and notifications. Manual records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? 'Clearing...' : 'Clear Records'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
