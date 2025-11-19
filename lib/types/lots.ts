// ============================================================================
// LOTS TYPES & INTERFACES
// ============================================================================

export type LotType = 'Standard' | 'Premium' | 'Family'
export type LotStatus = 'Available' | 'Reserved' | 'Occupied' | 'Maintenance'

export interface Lot {
  id: string
  lot_number: string
  section_id: string
  lot_type: LotType
  status: LotStatus
  price: number
  dimensions?: string
  owner_id?: string
  occupant_name?: string
  features?: string
  description?: string
  map_id?: string
  map_position?: any
  date_added?: string
  date_reserved?: string
  date_occupied?: string
  created_at: string
  updated_at: string
  created_by?: string
  deleted_at?: string
  deleted_by?: string
  
  // Relations (when joined)
  cemetery_sections?: {
    id: string
    name: string
    description?: string
    location?: string
  }
  clients?: {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
  }
}

export interface CreateLotInput {
  lot_number: string
  section_id: string
  lot_type: LotType
  status?: LotStatus
  price: number
  dimensions?: string
  features?: string
  description?: string
  created_by?: string
}

export interface UpdateLotInput {
  lot_number?: string
  section_id?: string
  lot_type?: LotType
  status?: LotStatus
  price?: number
  dimensions?: string
  owner_id?: string
  occupant_name?: string
  features?: string
  description?: string
  date_reserved?: string
  date_occupied?: string
}

export interface LotFilters {
  status?: LotStatus
  section_id?: string
  lot_type?: LotType
  owner_id?: string
  search?: string // Search by lot_number or occupant_name
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'lot_number' | 'price' | 'status'
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedLotsResponse {
  success: boolean
  data: Lot[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LotResponse {
  success: boolean
  data?: Lot
  error?: string
}
