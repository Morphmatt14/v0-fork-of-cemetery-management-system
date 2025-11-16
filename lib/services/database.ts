import { supabase } from '../supabase-client'

// Type definitions for our database entities
export interface AdminUser {
  id: string
  username: string
  full_name: string
  email?: string
  phone?: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface ClientInquiry {
  id: string
  customer_id: string
  lot_id?: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  admin_response?: string
  admin_id?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface AdminMessage {
  id: string
  sender_id: string
  recipient_id: string
  subject?: string
  message: string
  message_type: 'general' | 'issue' | 'report_request' | 'announcement'
  priority: 'normal' | 'high' | 'urgent'
  is_read: boolean
  parent_message_id?: string
  created_at: string
  read_at?: string
}

export interface ActivityLog {
  id: string
  admin_id?: string
  action_type: string
  action_category: 'payment' | 'client' | 'lot' | 'map' | 'password' | 'system' | 'inquiry' | 'message'
  description: string
  affected_record_type?: string
  affected_record_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  created_at: string
}

export interface LotAssignment {
  id: string
  lot_id: string
  customer_id: string
  order_id?: string
  assigned_at: string
  assigned_by?: string
  notes?: string
}

export interface MapData {
  id: string
  map_name: string
  map_type: 'lawn' | 'garden' | 'family'
  lot_id: string
  coordinates: { x: number; y: number; width: number; height: number }
  fabric_object?: Record<string, any>
  created_at: string
  updated_at: string
}

// Admin User Services
export const adminUserService = {
  async getAll() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as AdminUser[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as AdminUser
  },

  async getByUsername(username: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()
    if (error) throw error
    return data as AdminUser
  },

  async create(user: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'> & { password_hash: string }) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([user])
      .select()
      .single()
    if (error) throw error
    return data as AdminUser
  },

  async update(id: string, updates: Partial<AdminUser>) {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as AdminUser
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async updateLastLogin(id: string) {
    const { error } = await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }
}

// Client Inquiry Services
export const inquiryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('client_inquiries')
      .select('*, customers(*), lots(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByCustomer(customerId: string) {
    const { data, error} = await supabase
      .from('client_inquiries')
      .select('*, lots(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('client_inquiries')
      .select('*, customers(*), lots(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(inquiry: Omit<ClientInquiry, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('client_inquiries')
      .insert([inquiry])
      .select()
      .single()
    if (error) throw error
    return data as ClientInquiry
  },

  async update(id: string, updates: Partial<ClientInquiry>) {
    const { data, error } = await supabase
      .from('client_inquiries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as ClientInquiry
  },

  async respondToInquiry(id: string, adminId: string, response: string) {
    const { data, error } = await supabase
      .from('client_inquiries')
      .update({
        admin_response: response,
        admin_id: adminId,
        responded_at: new Date().toISOString(),
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as ClientInquiry
  }
}

// Admin Message Services
export const messageService = {
  async getByRecipient(recipientId: string) {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*, sender:admin_users!sender_id(*)')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getBySender(senderId: string) {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*, recipient:admin_users!recipient_id(*)')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getConversation(user1Id: string, user2Id: string) {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*, sender:admin_users!sender_id(*), recipient:admin_users!recipient_id(*)')
      .or(`and(sender_id.eq.${user1Id},recipient_id.eq.${user2Id}),and(sender_id.eq.${user2Id},recipient_id.eq.${user1Id})`)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async create(message: Omit<AdminMessage, 'id' | 'created_at' | 'is_read'>) {
    const { data, error } = await supabase
      .from('admin_messages')
      .insert([{ ...message, is_read: false }])
      .select()
      .single()
    if (error) throw error
    return data as AdminMessage
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('admin_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as AdminMessage
  },

  async getUnreadCount(recipientId: string) {
    const { count, error } = await supabase
      .from('admin_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false)
    if (error) throw error
    return count || 0
  }
}

// Activity Log Services
export const activityLogService = {
  async getAll(limit: number = 100) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, admin:admin_users(*)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getByAdmin(adminId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as ActivityLog[]
  },

  async getByCategory(category: ActivityLog['action_category'], limit: number = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, admin:admin_users(*)')
      .eq('action_category', category)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async create(log: Omit<ActivityLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([log])
      .select()
      .single()
    if (error) throw error
    return data as ActivityLog
  },

  async log(
    adminId: string | undefined,
    actionType: string,
    category: ActivityLog['action_category'],
    description: string,
    affectedRecordType?: string,
    affectedRecordId?: string,
    metadata?: Record<string, any>
  ) {
    return this.create({
      admin_id: adminId,
      action_type: actionType,
      action_category: category,
      description,
      affected_record_type: affectedRecordType,
      affected_record_id: affectedRecordId,
      metadata
    })
  }
}

// Lot Assignment Services
export const lotAssignmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lot_assignments')
      .select('*, lot:lots(*), customer:customers(*)')
      .order('assigned_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('lot_assignments')
      .select('*, lot:lots(*)')
      .eq('customer_id', customerId)
      .order('assigned_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from('lot_assignments')
      .select('*, customer:customers(*)')
      .eq('lot_id', lotId)
      .single()
    if (error) throw error
    return data
  },

  async create(assignment: Omit<LotAssignment, 'id' | 'assigned_at'>) {
    const { data, error } = await supabase
      .from('lot_assignments')
      .insert([assignment])
      .select()
      .single()
    if (error) throw error
    return data as LotAssignment
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lot_assignments')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Map Data Services
export const mapDataService = {
  async getAll() {
    const { data, error } = await supabase
      .from('map_data')
      .select('*, lot:lots(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByMapType(mapType: MapData['map_type']) {
    const { data, error } = await supabase
      .from('map_data')
      .select('*, lot:lots(*)')
      .eq('map_type', mapType)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from('map_data')
      .select('*')
      .eq('lot_id', lotId)
      .single()
    if (error) throw error
    return data as MapData
  },

  async create(mapData: Omit<MapData, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('map_data')
      .insert([mapData])
      .select()
      .single()
    if (error) throw error
    return data as MapData
  },

  async update(id: string, updates: Partial<MapData>) {
    const { data, error } = await supabase
      .from('map_data')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as MapData
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('map_data')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Customer Services (extended from existing customers table)
export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()
    if (error) throw error
    return data
  },

  async create(customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// Lot Services (extended from existing lots table)
export const lotService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async getAvailable() {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .eq('available', true)
      .order('name')
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(lot: any) {
    const { data, error } = await supabase
      .from('lots')
      .insert([lot])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('lots')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lots')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Payment Services (extended from existing payments table)
export const paymentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select('*, order:lot_orders(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(payment: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()
    if (error) throw error
    return data
  }
}
