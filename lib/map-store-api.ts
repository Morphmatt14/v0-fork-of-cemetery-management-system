"use client"

/**
 * Map Store - API Version
 * Uses Supabase database instead of localStorage
 * Maintains compatibility with existing UI components
 */

import { 
  fetchMaps, 
  fetchMapById, 
  createMap, 
  updateMap as apiUpdateMap,
  deleteMap as apiDeleteMap,
  saveLotPosition,
  removeLotPosition,
  type CemeteryMap as ApiCemeteryMap 
} from '@/lib/api/maps-api'
import { createLot, updateLot, deleteLot as apiDeleteLot } from '@/lib/api/lots-api'
import {
  deriveBlockId,
  deriveSectionLabelFromMap,
  mapNormalizedLotTypeToDb,
  normalizeLotTypeLabel,
  type NormalizedLotType,
} from '@/lib/utils/lot-normalizer'
import { emitMapLotsUpdated } from '@/lib/map-events'

type UILotType = NormalizedLotType | 'Lawn' | 'Garden'

// Re-export types for compatibility
export interface CemeteryMap {
  id: string
  name: string
  description: string
  imageUrl: string
  googleMapsUrl?: string
  createdAt: string
  updatedAt: string
  sections: CemeterySection[]
  lots: LotBox[]
}

export interface CemeterySection {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  lotsCount: number
  color: string
}

export interface LotBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  ownerName: string
  lotType: UILotType
  status: "vacant" | "still_on_payment" | "occupied"
  price?: number
  rotation?: number
  dimensions?: string
  mapId?: string
  section?: string
  ownerEmail?: string
  ownerId?: string
}

export interface LotTemplate {
  count: number
  lotType: UILotType
  basePrice: number
}

// Helper function to convert API map to UI format
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

function convertApiMapToUI(apiMap: ApiCemeteryMap): CemeteryMap {
  // API may return map_lot_positions (list view) or lot_positions (detail view)
  const lotPositions = (apiMap as any).map_lot_positions || apiMap.lot_positions || []

  // Convert lot positions to LotBox format (skip positions without a real DB lot)
  const lots: LotBox[] = lotPositions.flatMap((pos: any) => {
    const dbLot = pos.lots
    const lotId = typeof pos.lot_id === 'string' ? pos.lot_id.trim() : ''

    if (!dbLot || !lotId || !UUID_REGEX.test(lotId)) {
      return []
    }

    return [{
      id: lotId,
      x: pos.x_position,
      y: pos.y_position,
      width: pos.width,
      height: pos.height,
      rotation: pos.rotation || 0,
      ownerName: dbLot.occupant_name || "[Available]",
      lotType: convertLotTypeToUI(dbLot.lot_type),
      status: convertStatusToUI(dbLot.status),
      price: dbLot.price,
      dimensions: dbLot.dimensions,
      mapId: apiMap.id,
      section: apiMap.cemetery_sections?.name,
      ownerId: dbLot.owner_id,
    }]
  })

  return {
    id: apiMap.id,
    name: apiMap.name,
    description: apiMap.description || "",
    imageUrl: apiMap.image_url,
    googleMapsUrl: (apiMap as any).google_maps_url || "",
    createdAt: apiMap.created_at,
    updatedAt: apiMap.updated_at,
    sections: [], // Sections not used in current UI
    lots,
  }
}

function convertLotTypeToUI(apiType?: string): UILotType {
  return normalizeLotTypeLabel(apiType)
}

function convertStatusToUI(apiStatus?: string): "vacant" | "still_on_payment" | "occupied" {
  if (apiStatus === "Available") return "vacant"
  if (apiStatus === "Occupied") return "occupied"
  if (apiStatus === "Reserved") return "still_on_payment"
  return "vacant"
}

function convertLotTypeToAPI(uiType?: string): 'Standard' | 'Premium' | 'Family' {
  return mapNormalizedLotTypeToDb(normalizeLotTypeLabel(uiType))
}

function convertStatusToAPI(uiStatus: string): string {
  if (uiStatus === "vacant") return "Available"
  if (uiStatus === "occupied") return "Occupied"
  if (uiStatus === "still_on_payment") return "Reserved"
  return "Available"
}

export const mapStoreApi = {
  // Get all maps
  async getMaps(): Promise<CemeteryMap[]> {
    try {
      const result = await fetchMaps({ status: 'active' })
      if (result.success && result.data) {
        return result.data.map(convertApiMapToUI)
      }
      return []
    } catch (error) {
      console.error('getMaps error:', error)
      return []
    }
  },

  // Get single map by ID
  async getMapById(id: string): Promise<CemeteryMap | null> {
    try {
      const result = await fetchMapById(id)
      if (result.success && result.data) {
        return convertApiMapToUI(result.data)
      }
      return null
    } catch (error) {
      console.error('getMapById error:', error)
      return null
    }
  },

  // Add new map
  async addMap(map: Omit<CemeteryMap, "id" | "createdAt" | "updatedAt">): Promise<CemeteryMap | null> {
    try {
      const result = await createMap({
        name: map.name,
        description: map.description,
        image_url: map.imageUrl,
        google_maps_url: map.googleMapsUrl,
        width: 1200,
        height: 800,
        status: 'active',
        is_published: false,
      })

      if (result.success && result.data) {
        return convertApiMapToUI(result.data)
      }
      return null
    } catch (error) {
      console.error('addMap error:', error)
      return null
    }
  },

  // Update map
  async updateMap(id: string, updates: Partial<CemeteryMap>): Promise<CemeteryMap | null> {
    try {
      const updateData: any = {}
      if (updates.name) updateData.name = updates.name
      if (updates.description) updateData.description = updates.description
      if (updates.imageUrl) updateData.image_url = updates.imageUrl
      if (updates.googleMapsUrl !== undefined) updateData.google_maps_url = updates.googleMapsUrl

      const result = await apiUpdateMap(id, updateData)
      
      if (result.success && result.data) {
        return convertApiMapToUI(result.data)
      }
      return null
    } catch (error) {
      console.error('updateMap error:', error)
      return null
    }
  },

  // Delete map
  async deleteMap(id: string): Promise<boolean> {
    try {
      const result = await apiDeleteMap(id)
      return result.success
    } catch (error) {
      console.error('deleteMap error:', error)
      return false
    }
  },

  // Add lot with visual position
  async addLot(mapId: string, lot: Omit<LotBox, "id">): Promise<CemeteryMap | null> {
    try {
      // First, create the lot in the lots table. For lots created from the map editor
      // we don't require a cemetery section_id – they are linked to the map via map_id.
      const currentMap = await this.getMapById(mapId)
      const mapName = currentMap?.name
      const normalizedLotType = normalizeLotTypeLabel(lot.lotType)
      const lotResult = await createLot({
        lot_number: `LOT-${Date.now()}`,
        lot_type: mapNormalizedLotTypeToDb(normalizedLotType),
        status: convertStatusToAPI(lot.status) as any,
        price: lot.price || 75000,
        dimensions: lot.dimensions || "2m x 1m",
        description: `Lot created from map${mapName ? `: ${mapName}` : ''}`,
        map_id: mapId,
      })

      if (!lotResult.success || !lotResult.data) {
        throw new Error('Failed to create lot')
      }

      const newLotId = lotResult.data.id

      // Then save the visual position on the map
      await saveLotPosition(mapId, {
        lot_id: newLotId,
        x_position: lot.x,
        y_position: lot.y,
        width: lot.width,
        height: lot.height,
        rotation: lot.rotation || 0,
      })

      // Return updated map
      const updatedMap = await this.getMapById(mapId)
      emitMapLotsUpdated()
      return updatedMap
    } catch (error) {
      console.error('addLot error:', error)
      return null
    }
  },

  // Update lot
  async updateLot(mapId: string, lotId: string, updates: Partial<LotBox>): Promise<CemeteryMap | null> {
    try {
      // Update lot data if status/type/price changed
      if (updates.status || updates.lotType || updates.price || updates.ownerName) {
        const lotUpdates: any = {}
        if (updates.status) lotUpdates.status = convertStatusToAPI(updates.status) as any
        if (updates.lotType) {
          const normalizedLotType = normalizeLotTypeLabel(updates.lotType)
          lotUpdates.lot_type = mapNormalizedLotTypeToDb(normalizedLotType)
        }
        if (updates.price) lotUpdates.price = updates.price
        if (updates.ownerName && updates.ownerName !== "[Available]") {
          lotUpdates.occupant_name = updates.ownerName
        }

        await updateLot(lotId, lotUpdates)
      }

      // Update visual position if x/y/width/height/rotation changed
      if (updates.x !== undefined || updates.y !== undefined || 
          updates.width !== undefined || updates.height !== undefined ||
          updates.rotation !== undefined) {
        
        // Get current position first
        const map = await this.getMapById(mapId)
        const currentLot = map?.lots.find(l => l.id === lotId)
        
        await saveLotPosition(mapId, {
          lot_id: lotId,
          x_position: updates.x !== undefined ? updates.x : (currentLot?.x || 0),
          y_position: updates.y !== undefined ? updates.y : (currentLot?.y || 0),
          width: updates.width || currentLot?.width || 50,
          height: updates.height || currentLot?.height || 50,
          rotation: updates.rotation !== undefined ? updates.rotation : (currentLot?.rotation || 0),
        })
      }

      const updatedMap = await this.getMapById(mapId)
      emitMapLotsUpdated()
      return updatedMap
    } catch (error) {
      console.error('updateLot error:', error)
      return null
    }
  },

  // Delete lot
  async deleteLot(mapId: string, lotId: string): Promise<CemeteryMap | null> {
    try {
      // Remove position from map
      await removeLotPosition(mapId, lotId)

      // Soft delete the lot
      await apiDeleteLot(lotId)

      const updatedMap = await this.getMapById(mapId)
      emitMapLotsUpdated()
      return updatedMap
    } catch (error) {
      console.error('deleteLot error:', error)
      return null
    }
  },

  // Create bulk lots
  async createBulkLots(
    mapId: string,
    template: LotTemplate,
    baseX: number,
    baseY: number,
    spacing: number,
  ): Promise<CemeteryMap | null> {
    try {
      const promises: Promise<any>[] = []

      for (let i = 0; i < template.count; i++) {
        const x = baseX + (i % 5) * spacing
        const y = baseY + Math.floor(i / 5) * spacing

        promises.push(
          this.addLot(mapId, {
            x,
            y,
            width: 100,
            height: 120,
            ownerName: "[Available]",
            lotType: template.lotType,
            status: "vacant",
            price: template.basePrice,
          })
        )
      }

      await Promise.all(promises)
      return await this.getMapById(mapId)
    } catch (error) {
      console.error('createBulkLots error:', error)
      return null
    }
  },

  // Link lot to owner
  async linkLotToOwner(
    mapId: string,
    lotId: string,
    ownerName: string,
    ownerEmail: string,
    ownerId?: string,
  ): Promise<CemeteryMap | null> {
    try {
      await updateLot(lotId, {
        occupant_name: ownerName,
        owner_id: ownerId,
        status: 'Reserved',
      })

      return await this.getMapById(mapId)
    } catch (error) {
      console.error('linkLotToOwner error:', error)
      return null
    }
  },

  // Get lots by owner
  async getLotsByOwner(ownerId: string): Promise<LotBox[]> {
    try {
      // This would need a new API endpoint or filter
      // For now, return empty array
      return []
    } catch (error) {
      console.error('getLotsByOwner error:', error)
      return []
    }
  },

  // Get all lots across all maps
  async getAllLots(): Promise<LotBox[]> {
    try {
      const maps = await this.getMaps()
      const allLots: LotBox[] = []
      
      maps.forEach(map => {
        if (map.lots) {
          allLots.push(...map.lots)
        }
      })

      return allLots
    } catch (error) {
      console.error('getAllLots error:', error)
      return []
    }
  },

  // Get lots by map ID
  async getLotsByMapId(mapId: string): Promise<LotBox[]> {
    try {
      const map = await this.getMapById(mapId)
      return map?.lots || []
    } catch (error) {
      console.error('getLotsByMapId error:', error)
      return []
    }
  },

  // Legacy function stubs (for compatibility)
  addSection(mapId: string, section: CemeterySection): Promise<CemeteryMap | null> {
    console.warn('addSection not implemented in API version')
    return Promise.resolve(null)
  },

  updateSection(mapId: string, sectionId: string, updates: Partial<CemeterySection>): Promise<CemeteryMap | null> {
    console.warn('updateSection not implemented in API version')
    return Promise.resolve(null)
  },

  deleteSection(mapId: string, sectionId: string): Promise<CemeteryMap | null> {
    console.warn('deleteSection not implemented in API version')
    return Promise.resolve(null)
  },
}
