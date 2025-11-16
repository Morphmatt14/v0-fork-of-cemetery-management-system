'use client'

import { useEffect, useState } from 'react'
import { getUnreadCount } from '@/lib/messaging-store'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Props {
  adminUsername: string
  onOpenMessages: () => void
}

export function AdminNotificationBadge({ adminUsername, onOpenMessages }: Props) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount(adminUsername))
    }
    
    updateCount()
    const interval = setInterval(updateCount, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [adminUsername])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onOpenMessages}
      title="Messages and Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  )
}
