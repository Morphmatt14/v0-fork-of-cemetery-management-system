'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { activityStore, ActivityLog } from '@/lib/activity-store'

export function ActivityLogViewer({ limit = 20 }: { limit?: number }) {
  const [logs, setLogs] = useState<ActivityLog[]>([])

  useEffect(() => {
    loadLogs()
    const interval = setInterval(loadLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadLogs = () => {
    const recentLogs = activityStore.getRecentLogs(limit)
    setLogs(recentLogs)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent system activity and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="border-b pb-2 text-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.resourceType}
                    </Badge>
                    <p className="font-medium">{log.action}</p>
                  </div>
                  <p className="text-gray-600 text-xs">{log.details}</p>
                  <p className="text-gray-500 text-xs">By: {log.actor}</p>
                </div>
                <p className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
