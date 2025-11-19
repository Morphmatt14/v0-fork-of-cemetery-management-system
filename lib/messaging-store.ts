'use client'

export interface Message {
  id: string
  from: string
  to: string
  subject: string
  body: string
  timestamp: number
  read: boolean
  priority: 'normal' | 'high' | 'urgent'
  type: 'report_request' | 'issue' | 'general' | 'reply'
  relatedTo?: string
}

const MESSAGES_KEY = 'system_messages'

export function sendMessage(
  from: string,
  to: string,
  subject: string,
  body: string,
  priority: 'normal' | 'high' | 'urgent' = 'normal',
  type: 'report_request' | 'issue' | 'general' | 'reply' = 'general',
  relatedTo?: string
): Message {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  
  const message: Message = {
    id: Date.now().toString(),
    from,
    to,
    subject,
    body,
    timestamp: Date.now(),
    read: false,
    priority,
    type,
    relatedTo
  }
  
  messages.push(message)
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  
  return message
}

export function getMessagesForUser(username: string): Message[] {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  return messages
    .filter((m: Message) => m.to === username)
    .sort((a: Message, b: Message) => b.timestamp - a.timestamp)
}

export function markMessageAsRead(messageId: string): void {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  const messageIndex = messages.findIndex((m: Message) => m.id === messageId)
  
  if (messageIndex !== -1) {
    messages[messageIndex].read = true
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  }
}

export function getUnreadCount(username: string): number {
  const messages = getMessagesForUser(username)
  return messages.filter(m => !m.read).length
}

export function deleteMessage(messageId: string): void {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  const filtered = messages.filter((m: Message) => m.id !== messageId)
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered))
}

export function getSentMessages(username: string): Message[] {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  return messages
    .filter((m: Message) => m.from === username)
    .sort((a: Message, b: Message) => b.timestamp - a.timestamp)
}

export function getAllMessages(): Message[] {
  const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]')
  return messages.sort((a: Message, b: Message) => b.timestamp - a.timestamp)
}
