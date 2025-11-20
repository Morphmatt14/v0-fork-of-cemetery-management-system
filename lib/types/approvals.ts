// ============================================================================
// APPROVAL WORKFLOW TYPES
// ============================================================================
// TypeScript interfaces for the approval workflow system
// Date: 2024-11-20
// ============================================================================

/**
 * Action types that can be submitted for approval
 */
export type ActionType = 
  | 'lot_create' 
  | 'lot_update' 
  | 'lot_delete'
  | 'burial_create' 
  | 'burial_update' 
  | 'burial_delete'
  | 'payment_update'
  | 'client_create' 
  | 'client_update' 
  | 'client_delete'
  | 'map_create'

/**
 * Entity types that actions can target
 */
export type TargetEntity = 
  | 'lot' 
  | 'burial' 
  | 'payment' 
  | 'client' 
  | 'map' 
  | 'section'

/**
 * Approval status states
 */
export type ApprovalStatus = 
  | 'pending'     // Awaiting admin review
  | 'approved'    // Approved by admin
  | 'rejected'    // Rejected by admin
  | 'cancelled'   // Cancelled by employee
  | 'expired'     // Auto-expired after timeout

/**
 * Priority levels for pending actions
 */
export type ApprovalPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent'

/**
 * Actor information for requests and reviews
 */
export interface Actor {
  id: string
  username: string
  name?: string
}

/**
 * Core pending action interface
 */
export interface PendingAction {
  // Identification
  id: string
  
  // Action details
  action_type: ActionType
  target_entity: TargetEntity
  target_id?: string  // null for create operations
  
  // Data payload (flexible JSONB)
  change_data: any    // New/updated data to apply
  previous_data?: any // Original data (for updates/deletes)
  
  // Status and metadata
  status: ApprovalStatus
  priority: ApprovalPriority
  category?: string
  notes?: string
  
  // Actor information
  requested_by: Actor
  reviewed_by?: Actor
  
  // Approval details
  reviewed_at?: string
  rejection_reason?: string
  admin_notes?: string
  
  // Execution status
  is_executed: boolean
  executed_at?: string
  execution_result?: any
  execution_error?: string
  
  // Related records (for quick lookups)
  related_client_id?: string
  related_lot_id?: string
  related_payment_id?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  expires_at?: string
}

/**
 * Approval workflow configuration
 */
export interface ApprovalConfig {
  id: string
  action_type: ActionType
  requires_approval: boolean
  description?: string
  
  // Approval requirements
  min_approvers: number
  allowed_approver_roles: string[]
  
  // Auto-approval rules (future use)
  auto_approve_conditions?: any
  
  // Expiration settings
  expiration_days: number
  
  // Notification settings
  notify_on_submit: boolean
  notify_on_approve: boolean
  notify_on_reject: boolean
  notify_on_expire: boolean
  
  // Status
  is_active: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Payload for submitting a new pending action
 */
export interface SubmitApprovalRequest {
  action_type: ActionType
  target_entity: TargetEntity
  target_id?: string
  change_data: any
  previous_data?: any
  priority?: ApprovalPriority
  category?: string
  notes?: string
  related_client_id?: string
  related_lot_id?: string
  related_payment_id?: string
}

/**
 * Payload for reviewing a pending action
 */
export interface ReviewApprovalRequest {
  action: 'approve' | 'reject'
  rejection_reason?: string
  admin_notes?: string
}

/**
 * Response when submitting a pending action
 */
export interface SubmitApprovalResponse {
  success: boolean
  data?: PendingAction
  error?: string
  message?: string
}

/**
 * Response when reviewing a pending action
 */
export interface ReviewApprovalResponse {
  success: boolean
  data?: PendingAction
  executed?: boolean
  error?: string
  message?: string
}

/**
 * Filters for listing pending actions
 */
export interface ApprovalFilters {
  status?: ApprovalStatus | ApprovalStatus[]
  action_type?: ActionType | ActionType[]
  target_entity?: TargetEntity | TargetEntity[]
  priority?: ApprovalPriority | ApprovalPriority[]
  requested_by_id?: string
  reviewed_by_id?: string
  category?: string
  
  // Date filters
  created_after?: string
  created_before?: string
  expires_after?: string
  expires_before?: string
  
  // Related records
  related_client_id?: string
  related_lot_id?: string
  related_payment_id?: string
  
  // Pagination
  page?: number
  limit?: number
  sort_by?: keyof PendingAction
  sort_order?: 'asc' | 'desc'
  
  // Search
  search?: string
}

/**
 * Paginated response for pending actions
 */
export interface ApprovalListResponse {
  success: boolean
  data: PendingAction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  error?: string
}

/**
 * Approval statistics for dashboard
 */
export interface ApprovalStats {
  // Current status counts
  pending_count: number
  approved_today: number
  rejected_today: number
  cancelled_today: number
  expired_today: number
  
  // Performance metrics
  avg_approval_time_hours: number
  approval_rate: number      // approved / (approved + rejected)
  rejection_rate: number     // rejected / (approved + rejected)
  
  // Breakdown by action type
  by_action_type: Record<ActionType, {
    pending: number
    approved: number
    rejected: number
    cancelled: number
    expired: number
  }>
  
  // Breakdown by employee
  by_employee: Record<string, {
    pending: number
    approved: number
    rejected: number
    avg_approval_time_hours: number
  }>
  
  // Breakdown by priority
  by_priority: Record<ApprovalPriority, {
    pending: number
    avg_approval_time_hours: number
  }>
}

/**
 * Response for approval statistics
 */
export interface ApprovalStatsResponse {
  success: boolean
  data?: ApprovalStats
  error?: string
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Error types for approval workflow
 */
export type ApprovalError = 
  | 'UNAUTHORIZED'           // User not authenticated
  | 'FORBIDDEN'             // User lacks permissions
  | 'NOT_FOUND'             // Pending action not found
  | 'ALREADY_REVIEWED'      // Action already approved/rejected
  | 'ALREADY_EXPIRED'       // Action has expired
  | 'INVALID_STATUS'        // Invalid status transition
  | 'EXECUTION_FAILED'      // Failed to execute approved action
  | 'VALIDATION_ERROR'      // Invalid request data
  | 'CONFIG_NOT_FOUND'      // Approval config not found
  | 'APPROVAL_NOT_REQUIRED' // Action doesn't require approval

/**
 * Detailed error response
 */
export interface ApprovalErrorResponse {
  success: false
  error: ApprovalError
  message: string
  details?: any
  code?: number
}

/**
 * Utility type for action-specific change data
 */
export interface ActionChangeData {
  lot_create: {
    lot_number: string
    section_id: string
    lot_type: 'Standard' | 'Premium'
    status: string
    price: number
    map_position?: any
  }
  
  lot_update: Partial<{
    lot_number: string
    section_id: string
    lot_type: 'Standard' | 'Premium'
    status: string
    price: number
    owner_id: string
    occupant_name: string
    map_position: any
  }>
  
  lot_delete: {
    reason: string
    backup_data: any
  }
  
  payment_update: {
    status: 'Paid' | 'Under Payment' | 'Overdue'
    amount?: number
    payment_method?: string
    reference?: string
    notes?: string
  }
  
  client_create: {
    name: string
    email: string
    phone?: string
    address?: string
    username: string
    password: string
    emergency_contact?: string
    emergency_phone?: string
    notes?: string
  }
  
  client_update: Partial<{
    name: string
    email: string
    phone: string
    address: string
    status: string
    emergency_contact: string
    emergency_phone: string
    notes: string
  }>
  
  client_delete: {
    reason: string
    backup_data: any
  }
  
  burial_create: {
    lot_id: string
    deceased_name: string
    burial_date: string
    family_name?: string
    funeral_home?: string
    attendees_count?: number
  }
  
  burial_update: Partial<{
    deceased_name: string
    burial_date: string
    family_name: string
    funeral_home: string
    attendees_count: number
  }>
  
  burial_delete: {
    reason: string
    backup_data: any
  }
  
  map_create: {
    name: string
    section_id: string
    image_url?: string
    width?: number
    height?: number
  }
}

/**
 * Helper type to get change data for specific action type
 */
export type ChangeDataFor<T extends ActionType> = ActionChangeData[T]

/**
 * Execution result types for different actions
 */
export interface ExecutionResult {
  success: boolean
  action_type: ActionType
  target_id?: string
  records_affected?: number
  timestamp: string
  error?: string
  details?: any
}

// Re-export common types for convenience
export type { ActionType as ApprovalActionType }
export type { TargetEntity as ApprovalTargetEntity }
export type { ApprovalStatus as ApprovalState }
