"use client"

// Map Store - Manages cemetery maps and lot locations using localStorage
export interface CemeteryMap {
  id: string
  name: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
  sections: CemeterySection[]
  lots: LotBox[] // Added lots array to store lot boundaries
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
  lotType: "Lawn" | "Garden" | "Family State"
  status: "vacant" | "still_on_payment" | "occupied"
  price?: number
  rotation?: number
  dimensions?: string
  mapId?: string // Which map this lot belongs to
  section?: string // Section name from admin lot system
  ownerEmail?: string // Email of the owner for linking
  ownerId?: string // Client ID for direct linking
}

export interface LotTemplate {
  count: number
  lotType: "Lawn" | "Garden" | "Family State"
  basePrice: number
}

export interface AvailableLot {
  id: string
  mapId: string
  lotType: "Lawn" | "Garden" | "Family State"
  status: "vacant" | "still_on_payment" | "occupied"
  price: number
  ownerEmail?: string
  ownerName?: string
}

const MAP_STORAGE_KEY = "cemeteryMaps"

export const mapStore = {
  // Get all maps
  getMaps(): CemeteryMap[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(MAP_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  // Get single map by ID
  getMapById(id: string): CemeteryMap | null {
    const maps = this.getMaps()
    return maps.find((m) => m.id === id) || null
  },

  // Add new map
  addMap(map: Omit<CemeteryMap, "id" | "createdAt" | "updatedAt">): CemeteryMap {
    const maps = this.getMaps()
    const newMap: CemeteryMap = {
      ...map,
      id: `map-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lots: [], // Initialize lots array
    }
    maps.push(newMap)
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(maps))
    return newMap
  },

  // Update map
  updateMap(id: string, updates: Partial<CemeteryMap>): CemeteryMap | null {
    const maps = this.getMaps()
    const index = maps.findIndex((m) => m.id === id)
    if (index === -1) return null
    maps[index] = { ...maps[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(maps))
    return maps[index]
  },

  // Delete map
  deleteMap(id: string): boolean {
    const maps = this.getMaps()
    const filtered = maps.filter((m) => m.id !== id)
    if (filtered.length === maps.length) return false
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // Add section to map
  addSection(mapId: string, section: CemeterySection): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map) return null
    map.sections.push(section)
    return this.updateMap(mapId, map)
  },

  // Update section in map
  updateSection(mapId: string, sectionId: string, updates: Partial<CemeterySection>): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map) return null
    const sectionIndex = map.sections.findIndex((s) => s.id === sectionId)
    if (sectionIndex === -1) return null
    map.sections[sectionIndex] = { ...map.sections[sectionIndex], ...updates }
    return this.updateMap(mapId, map)
  },

  // Delete section from map
  deleteSection(mapId: string, sectionId: string): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map) return null
    map.sections = map.sections.filter((s) => s.id !== sectionId)
    return this.updateMap(mapId, map)
  },

  addLot(mapId: string, lot: Omit<LotBox, "id">): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map) return null
    const newLot: LotBox = {
      ...lot,
      id: `lot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mapId: mapId,
    }
    if (!map.lots) map.lots = []
    map.lots.push(newLot)

    // Also add to global lots system
    this.syncLotToGlobalSystem(newLot, map.name)

    return this.updateMap(mapId, map)
  },

  syncLotToGlobalSystem(lot: LotBox, mapName: string): void {
    const globalData = localStorage.getItem("cemeteryData")
    if (globalData) {
      const data = JSON.parse(globalData)

      // Convert map lot to global lot format
      const globalLot = {
        id: lot.id,
        section: lot.section || mapName,
        type: lot.lotType === "Lawn" ? "Standard" : lot.lotType === "Garden" ? "Premium" : "Family",
        status: lot.status === "vacant" ? "Available" : lot.status === "occupied" ? "Occupied" : "Reserved",
        price: lot.price || 75000,
        dimensions: lot.dimensions || "2m x 1m",
        features: "",
        description: `Lot created from map: ${mapName}`,
        dateAdded: new Date().toISOString().split("T")[0],
        owner: lot.ownerName !== "[Available]" ? lot.ownerName : undefined,
        occupant: lot.status === "occupied" ? lot.ownerName : undefined,
        ownerId: lot.ownerId,
        ownerEmail: lot.ownerEmail,
        mapId: lot.mapId,
      }

      // Check if lot already exists
      const existingIndex = data.lots.findIndex((l: any) => l.id === lot.id)
      if (existingIndex === -1) {
        data.lots.push(globalLot)
        data.stats.totalLots += 1
        if (globalLot.status === "Available") data.stats.availableLots += 1
        else if (globalLot.status === "Occupied") data.stats.occupiedLots += 1
      } else {
        // Update existing lot
        const oldLot = data.lots[existingIndex]
        data.lots[existingIndex] = globalLot

        // Update stats if status changed
        if (oldLot.status !== globalLot.status) {
          if (oldLot.status === "Available") data.stats.availableLots -= 1
          else if (oldLot.status === "Occupied") data.stats.occupiedLots -= 1
          if (globalLot.status === "Available") data.stats.availableLots += 1
          else if (globalLot.status === "Occupied") data.stats.occupiedLots += 1
        }
      }

      localStorage.setItem("cemeteryData", JSON.stringify(data))
    }
  },

  updateLot(mapId: string, lotId: string, updates: Partial<LotBox>): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map || !map.lots) return null
    const lotIndex = map.lots.findIndex((l) => l.id === lotId)
    if (lotIndex === -1) return null
    map.lots[lotIndex] = { ...map.lots[lotIndex], ...updates }

    this.syncLotToGlobalSystem(map.lots[lotIndex], map.name)

    return this.updateMap(mapId, map)
  },

  deleteLot(mapId: string, lotId: string): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map || !map.lots) return null
    map.lots = map.lots.filter((l) => l.id !== lotId)

    const globalData = localStorage.getItem("cemeteryData")
    if (globalData) {
      const data = JSON.parse(globalData)
      const lotIndex = data.lots.findIndex((l: any) => l.id === lotId)
      if (lotIndex !== -1) {
        const deletedLot = data.lots[lotIndex]
        data.lots.splice(lotIndex, 1)
        data.stats.totalLots -= 1
        if (deletedLot.status === "Available") data.stats.availableLots -= 1
        else if (deletedLot.status === "Occupied") data.stats.occupiedLots -= 1
        localStorage.setItem("cemeteryData", JSON.stringify(data))
      }
    }

    return this.updateMap(mapId, map)
  },

  // Create multiple lots at once
  createBulkLots(
    mapId: string,
    template: LotTemplate,
    baseX: number,
    baseY: number,
    spacing: number,
  ): CemeteryMap | null {
    const map = this.getMapById(mapId)
    if (!map) return null

    for (let i = 0; i < template.count; i++) {
      const x = baseX + (i % 5) * spacing
      const y = baseY + Math.floor(i / 5) * spacing

      this.addLot(mapId, {
        x,
        y,
        width: 100,
        height: 120,
        ownerName: `[Available]`,
        lotType: template.lotType,
        status: "vacant",
        price: template.basePrice,
      })
    }

    return this.getMapById(mapId)
  },

  linkLotToOwner(
    mapId: string,
    lotId: string,
    ownerName: string,
    ownerEmail: string,
    ownerId?: string,
  ): CemeteryMap | null {
    const updatedLot = this.updateLot(mapId, lotId, {
      ownerName,
      ownerEmail,
      ownerId,
      status: "still_on_payment",
    })

    // Sync to client's lots
    if (updatedLot && ownerId) {
      const authStore = localStorage.getItem("auth_store")
      if (authStore) {
        const auth = JSON.parse(authStore)
        const clientIndex = auth.clientUsers.findIndex((c: any) => c.id === ownerId)
        if (clientIndex !== -1) {
          if (!auth.clientUsers[clientIndex].lots) {
            auth.clientUsers[clientIndex].lots = []
          }
          auth.clientUsers[clientIndex].lots.push(lotId)
          localStorage.setItem("auth_store", JSON.stringify(auth))
        }
      }
    }

    return updatedLot
  },

  getLotsByOwner(ownerId: string): LotBox[] {
    const maps = this.getMaps()
    const ownerLots: LotBox[] = []

    maps.forEach((map) => {
      if (map.lots) {
        const lots = map.lots.filter((lot) => lot.ownerId === ownerId)
        ownerLots.push(...lots)
      }
    })

    return ownerLots
  },

  getAllLots(): LotBox[] {
    const maps = this.getMaps()
    const allLots: LotBox[] = []

    maps.forEach((map) => {
      if (map.lots) {
        allLots.push(...map.lots.map((lot) => ({ ...lot, mapId: map.id, mapName: map.name }) as any))
      }
    })

    return allLots
  },

  getLotsByMapId(mapId: string): LotBox[] {
    const map = this.getMapById(mapId)
    return map?.lots || []
  },

  syncGlobalLotToMap(lot: any): void {
    if (!lot.mapId) return

    const map = this.getMapById(lot.mapId)
    if (!map || !map.lots) return

    const lotIndex = map.lots.findIndex((l) => l.id === lot.id)
    if (lotIndex === -1) return

    // Update the map lot with changes from global lot
    map.lots[lotIndex] = {
      ...map.lots[lotIndex],
      section: lot.section,
      dimensions: lot.dimensions,
      price: lot.price,
      status: lot.status === "Available" ? "vacant" : lot.status === "Occupied" ? "occupied" : "still_on_payment",
      ownerName: lot.owner || lot.occupant || "[Available]",
      ownerId: lot.ownerId,
      ownerEmail: lot.ownerEmail,
    }

    this.updateMap(lot.mapId, map)
  },

  syncAllGlobalLotsToMaps(): void {
    const globalData = localStorage.getItem("cemeteryData")
    if (!globalData) return

    const data = JSON.parse(globalData)
    data.lots.forEach((lot: any) => {
      this.syncGlobalLotToMap(lot)
    })
  },
}
