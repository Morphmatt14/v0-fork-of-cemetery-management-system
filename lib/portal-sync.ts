'use client'

import { logActivity } from './activity-logger'

export interface PortalSyncData {
  clients: any[]
  lots: any[]
  payments: any[]
  inquiries: any[]
  appointments: any[]
  lastUpdated: number
}

const PORTAL_SYNC_KEY = 'portal_sync_data'
const SYNC_UPDATE_EVENT = 'portal_sync_update'

export function initializePortalSync() {
  if (typeof window === 'undefined') return
  
  const existing = localStorage.getItem(PORTAL_SYNC_KEY)
  if (!existing) {
    const syncData: PortalSyncData = {
      clients: [],
      lots: [],
      payments: [],
      inquiries: [],
      appointments: [],
      lastUpdated: Date.now()
    }
    localStorage.setItem(PORTAL_SYNC_KEY, JSON.stringify(syncData))
  }
}

export function syncDataAcrossPortals(
  dataType: keyof Omit<PortalSyncData, 'lastUpdated'>,
  data: any,
  adminUsername?: string
) {
  if (typeof window === 'undefined') return
  
  initializePortalSync()
  const syncData = JSON.parse(localStorage.getItem(PORTAL_SYNC_KEY) || '{}') as PortalSyncData
  syncData[dataType] = data
  syncData.lastUpdated = Date.now()
  localStorage.setItem(PORTAL_SYNC_KEY, JSON.stringify(syncData))
  
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent(SYNC_UPDATE_EVENT, { detail: { dataType, data } }))
  
  // Log the sync
  if (adminUsername) {
    logActivity(adminUsername, `SYNC_${dataType.toUpperCase()}`, `Synced ${dataType} data across portals`, 'success', 'system')
  }
}

export function getPortalData(): PortalSyncData {
  if (typeof window === 'undefined') return {
    clients: [],
    lots: [],
    payments: [],
    inquiries: [],
    appointments: [],
    lastUpdated: Date.now()
  }
  
  initializePortalSync()
  return JSON.parse(localStorage.getItem(PORTAL_SYNC_KEY) || '{}') as PortalSyncData
}

export function addClientInquiry(
  clientId: string,
  clientName: string,
  subject: string,
  message: string,
  lotId?: string
) {
  if (typeof window === 'undefined') return
  
  const inquiry = {
    id: Date.now().toString(),
    clientId,
    clientName,
    subject,
    message,
    lotId,
    timestamp: Date.now(),
    status: 'new',
    adminReplies: []
  }
  
  const syncData = getPortalData()
  syncData.inquiries.push(inquiry)
  syncDataAcrossPortals('inquiries', syncData.inquiries)
  
  logActivity('client_system', 'INQUIRY_CREATED', `New inquiry from ${clientName}: ${subject}`, 'success', 'system')
  
  return inquiry
}

export function replyToInquiry(inquiryId: string, adminUsername: string, reply: string) {
  if (typeof window === 'undefined') return
  
  const syncData = getPortalData()
  const inquiry = syncData.inquiries.find((i: any) => i.id === inquiryId)
  
  if (inquiry) {
    inquiry.adminReplies.push({
      id: Date.now().toString(),
      from: adminUsername,
      message: reply,
      timestamp: Date.now()
    })
    inquiry.status = 'replied'
    syncDataAcrossPortals('inquiries', syncData.inquiries, adminUsername)
  }
}

export function getClientInquiries(clientId?: string) {
  const syncData = getPortalData()
  if (clientId) {
    return syncData.inquiries.filter((i: any) => i.clientId === clientId)
  }
  return syncData.inquiries
}

export function syncLotData(lots: any[], adminUsername: string) {
  syncDataAcrossPortals('lots', lots, adminUsername)
}

export function syncPaymentData(payments: any[], adminUsername: string) {
  syncDataAcrossPortals('payments', payments, adminUsername)
}

export function onPortalSyncUpdate(callback: (detail: any) => void) {
  if (typeof window === 'undefined') return
  
  const handler = (event: any) => callback(event.detail)
  window.addEventListener(SYNC_UPDATE_EVENT, handler)
  
  return () => window.removeEventListener(SYNC_UPDATE_EVENT, handler)
}
