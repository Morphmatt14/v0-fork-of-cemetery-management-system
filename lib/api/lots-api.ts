// ============================================================================
// LOTS API CLIENT
// ============================================================================
// Client-side utilities for interacting with the Lots API
// ============================================================================

import type { 
  Lot, 
  CreateLotInput, 
  UpdateLotInput, 
  LotFilters, 
  PaginatedLotsResponse,
  LotResponse 
} from '@/lib/types/lots'

/**
 * Fetch lots with filters and pagination
 */
export async function fetchLots(filters?: LotFilters): Promise<PaginatedLotsResponse> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.status) params.append('status', filters.status)
      if (filters.section_id) params.append('section_id', filters.section_id)
      if (filters.lot_type) params.append('lot_type', filters.lot_type)
      if (filters.owner_id) params.append('owner_id', filters.owner_id)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      if (filters.sort_order) params.append('sort_order', filters.sort_order)
    }
    
    const response = await fetch(`/api/lots?${params.toString()}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch lots')
    }
    
    return data
  } catch (error) {
    console.error('[Lots API Client] Fetch error:', error)
    throw error
  }
}

/**
 * Fetch single lot by ID
 */
export async function fetchLotById(id: string): Promise<LotResponse> {
  try {
    const response = await fetch(`/api/lots/${id}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch lot')
    }
    
    return data
  } catch (error) {
    console.error('[Lots API Client] Fetch by ID error:', error)
    throw error
  }
}

/**
 * Create new lot
 */
export async function createLot(lotData: CreateLotInput): Promise<LotResponse> {
  try {
    const response = await fetch('/api/lots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lotData),
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create lot')
    }
    
    return data
  } catch (error) {
    console.error('[Lots API Client] Create error:', error)
    throw error
  }
}

/**
 * Update existing lot
 */
export async function updateLot(
  id: string, 
  updates: UpdateLotInput & { updated_by?: string }
): Promise<LotResponse> {
  try {
    const response = await fetch(`/api/lots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update lot')
    }
    
    return data
  } catch (error) {
    console.error('[Lots API Client] Update error:', error)
    throw error
  }
}

/**
 * Delete lot (soft delete)
 */
export async function deleteLot(id: string, deleted_by?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = deleted_by 
      ? `/api/lots/${id}?deleted_by=${deleted_by}`
      : `/api/lots/${id}`
      
    const response = await fetch(url, {
      method: 'DELETE',
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete lot')
    }
    
    return data
  } catch (error) {
    console.error('[Lots API Client] Delete error:', error)
    throw error
  }
}

/**
 * Fetch available lots only
 */
export async function fetchAvailableLots(filters?: Omit<LotFilters, 'status'>): Promise<PaginatedLotsResponse> {
  return fetchLots({
    ...filters,
    status: 'Available',
  })
}

/**
 * Search lots by keyword
 */
export async function searchLots(keyword: string, filters?: Omit<LotFilters, 'search'>): Promise<PaginatedLotsResponse> {
  return fetchLots({
    ...filters,
    search: keyword,
  })
}

/**
 * Fetch lots by section
 */
export async function fetchLotsBySection(sectionId: string, filters?: Omit<LotFilters, 'section_id'>): Promise<PaginatedLotsResponse> {
  return fetchLots({
    ...filters,
    section_id: sectionId,
  })
}
