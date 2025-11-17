'use client'

export interface AutomatedRecord {
  id: string
  type: 'log' | 'reminder' | 'notification'
  isAutomated: boolean
  createdAt: number
  source: 'system' | 'manual'
}

export function getAutomatedRecords(): AutomatedRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]')
    const reminders = JSON.parse(localStorage.getItem('client_reminders') || '[]')
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')

    return [
      ...logs.filter((log: any) => log.isAutomated).map((log: any) => ({ ...log, type: 'log' })),
      ...reminders.filter((r: any) => r.isAutomated).map((r: any) => ({ ...r, type: 'reminder' })),
      ...notifications.filter((n: any) => n.isAutomated).map((n: any) => ({ ...n, type: 'notification' })),
    ]
  } catch (error) {
    console.error('[v0] Error getting automated records:', error)
    return []
  }
}

export function clearAutomatedRecords(): { deleted: number; manualRecordsPreserved: number } {
  if (typeof window === 'undefined') return { deleted: 0, manualRecordsPreserved: 0 }

  try {
    let deleted = 0
    let preserved = 0

    // Clear automated logs
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]')
    const filteredLogs = logs.filter((log: any) => !log.isAutomated)
    deleted += logs.length - filteredLogs.length
    preserved += filteredLogs.length
    localStorage.setItem('activity_logs', JSON.stringify(filteredLogs))

    // Clear automated reminders
    const reminders = JSON.parse(localStorage.getItem('client_reminders') || '[]')
    const filteredReminders = reminders.filter((r: any) => !r.isAutomated)
    deleted += reminders.length - filteredReminders.length
    preserved += filteredReminders.length
    localStorage.setItem('client_reminders', JSON.stringify(filteredReminders))

    // Clear automated notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    const filteredNotifications = notifications.filter((n: any) => !n.isAutomated)
    deleted += notifications.length - filteredNotifications.length
    preserved += filteredNotifications.length
    localStorage.setItem('notifications', JSON.stringify(filteredNotifications))

    return { deleted, manualRecordsPreserved: preserved }
  } catch (error) {
    console.error('[v0] Error clearing automated records:', error)
    return { deleted: 0, manualRecordsPreserved: 0 }
  }
}
