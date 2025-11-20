"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NotificationsTabProps {
  notifications: any[]
  onMarkAsRead?: (id: number) => void
}

const Bell = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

export function NotificationsTab({ notifications, onMarkAsRead }: NotificationsTabProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return (
          <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H5a3 3 0 00-3 3v11a3 3 0 003 3z"
            />
          </svg>
        )
      case "maintenance":
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case "announcement":
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
        )
      case "map":
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        )
      default:
        return <Bell />
    }
  }

  const getNotificationBgColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50"
    switch (type) {
      case "payment":
        return "bg-orange-50 border-l-4 border-orange-500"
      case "maintenance":
        return "bg-blue-50 border-l-4 border-blue-500"
      case "announcement":
        return "bg-purple-50 border-l-4 border-purple-500"
      case "map":
        return "bg-green-50 border-l-4 border-green-500"
      default:
        return "bg-gray-50 border-l-4 border-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">
            Stay updated with important announcements and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell />
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {filter === "unread" ? "No Unread Notifications" : "No Notifications"}
                </h3>
                <p className="text-sm text-gray-500">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "Notifications will appear here when you receive updates"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${getNotificationBgColor(notification.type, notification.read)} ${
                !notification.read ? "shadow-md" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${notification.read ? "bg-gray-100" : "bg-white"}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            notification.read ? "text-gray-700" : "text-gray-900 font-medium"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        {onMarkAsRead && !notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Notification Type Badge */}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
              <p className="text-sm text-blue-800">
                You'll receive notifications for important updates including payment reminders, scheduled
                maintenance, new map uploads, and general announcements from cemetery administration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
