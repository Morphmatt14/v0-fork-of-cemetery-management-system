'use client'

export interface ActivityLog {
  id: string
  timestamp: number
  actor: string
  action: string
  details: string
  resourceType: string
  resourceId?: string
  status: 'success' | 'error'
}

class ActivityStore {
  private storageKey = 'activity_logs'

  log(actor: string, action: string, details: string, resourceType: string, resourceId?: string, status: 'success' | 'error' = 'success') {
    const logs = this.getAllLogs()
    const logEntry: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      actor,
      action,
      details,
      resourceType,
      resourceId,
      status,
    }
    
    logs.push(logEntry)
    // Keep only last 1000 logs to prevent localStorage bloat
    if (logs.length > 1000) logs.shift()
    
    localStorage.setItem(this.storageKey, JSON.stringify(logs))
  }

  getAllLogs(): ActivityLog[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : []
  }

  getLogsByActor(actor: string): ActivityLog[] {
    return this.getAllLogs().filter(log => log.actor === actor)
  }

  getRecentLogs(count: number = 50): ActivityLog[] {
    return this.getAllLogs().slice(-count).reverse()
  }
}

export const activityStore = new ActivityStore()
