'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AdminActivity } from '@/lib/activity-logger'

interface ActivityLogsTabProps {
  activityLogs: AdminActivity[]
}

export default function ActivityLogsTab({ activityLogs }: ActivityLogsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Logs</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activityLogs.length === 0 ? (
          <Alert>
            <AlertDescription>No activities logged yet</AlertDescription>
          </Alert>
        ) : (
          activityLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-3">
                <div className="flex justify-between items-start text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold">{log.action}</p>
                    <p className="text-gray-600">{log.details}</p>
                    <p className="text-xs text-gray-500">Employee: {log.adminUsername}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
