/**
 * Maps API Client
 * 
 * Client-side functions for interacting with the Maps API endpoints
 */

export interface CemeteryMap {
  id: string
  name: string
  description?: string
  section_id?: string
  image_url: string
  image_public_id?: string
  width?: number
  height?: number
  status: 'active' | 'inactive' | 'draft'
  is_published: boolean
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  deleted_at?: string
  deleted_by?: string
  cemetery_sections?: {
    id: string
    name: string
    description?: string
  }
  lot_positions?: LotPosition[]
  lots?: any[]
}

export interface LotPosition {
  id: string
  map_id: string
  lot_id: string
  x_position: number
  y_position: number
  width: number
  height: number
  rotation?: number
  color?: string
  label?: string
  created_at: string
  updated_at: string
  lots?: {
    id: string
    lot_number: string
    lot_type: string
    status: string
    price: number
    dimensions?: string
    occupant_name?: string
    owner_id?: string
  }
}

export interface CreateMapInput {
  name: string
  description?: string
  section_id?: string
  image_url: string
  image_public_id?: string
  width?: number
  height?: number
  status?: 'active' | 'inactive' | 'draft'
  is_published?: boolean
  notes?: string
  created_by?: string
}

export interface UpdateMapInput {
  name?: string
  description?: string
  section_id?: string
  image_url?: string
  image_public_id?: string
  width?: number
  height?: number
  status?: 'active' | 'inactive' | 'draft'
  is_published?: boolean
  notes?: string
}

export interface SavePositionInput {
  lot_id: string
  x_position: number
  y_position: number
  width?: number
  height?: number
  rotation?: number
  color?: string
  label?: string
}

// ============================================================================
// Fetch all maps
// ============================================================================
export async function fetchMaps(filters?: {
  status?: string
  section_id?: string
}): Promise<{ success: boolean; data: CemeteryMap[]; error?: string }> {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.section_id) params.append('section_id', filters.section_id)

    const url = `/api/maps${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch maps')
    }

    return await response.json()
  } catch (error: any) {
    console.error('fetchMaps error:', error)
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch maps',
    }
  }
}

// ============================================================================
// Fetch single map with lot positions
// ============================================================================
export async function fetchMapById(id: string): Promise<{
  success: boolean
  data?: CemeteryMap
  error?: string
}> {
  try {
    const response = await fetch(`/api/maps/${id}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch map')
    }

    return await response.json()
  } catch (error: any) {
    console.error('fetchMapById error:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch map',
    }
  }
}

// ============================================================================
// Create new map
// ============================================================================
export async function createMap(input: CreateMapInput): Promise<{
  success: boolean
  data?: CemeteryMap
  error?: string
}> {
  try {
    const response = await fetch('/api/maps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create map')
    }

    return await response.json()
  } catch (error: any) {
    console.error('createMap error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create map',
    }
  }
}

// ============================================================================
// Update map
// ============================================================================
export async function updateMap(
  id: string,
  input: UpdateMapInput
): Promise<{
  success: boolean
  data?: CemeteryMap
  error?: string
}> {
  try {
    const response = await fetch(`/api/maps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update map')
    }

    return await response.json()
  } catch (error: any) {
    console.error('updateMap error:', error)
    return {
      success: false,
      error: error.message || 'Failed to update map',
    }
  }
}

// ============================================================================
// Delete map
// ============================================================================
export async function deleteMap(id: string): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const response = await fetch(`/api/maps/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete map')
    }

    return await response.json()
  } catch (error: any) {
    console.error('deleteMap error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete map',
    }
  }
}

// ============================================================================
// Save lot position on map
// ============================================================================
export async function saveLotPosition(
  mapId: string,
  input: SavePositionInput
): Promise<{
  success: boolean
  data?: LotPosition
  error?: string
}> {
  try {
    const response = await fetch(`/api/maps/${mapId}/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save lot position')
    }

    return await response.json()
  } catch (error: any) {
    console.error('saveLotPosition error:', error)
    return {
      success: false,
      error: error.message || 'Failed to save lot position',
    }
  }
}

// ============================================================================
// Remove lot position from map
// ============================================================================
export async function removeLotPosition(
  mapId: string,
  lotId: string
): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const response = await fetch(`/api/maps/${mapId}/positions?lot_id=${lotId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to remove lot position')
    }

    return await response.json()
  } catch (error: any) {
    console.error('removeLotPosition error:', error)
    return {
      success: false,
      error: error.message || 'Failed to remove lot position',
    }
  }
}
