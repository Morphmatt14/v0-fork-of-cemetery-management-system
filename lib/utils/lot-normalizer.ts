export type NormalizedLotType = 'Lawn Lot' | 'Garden Lot' | 'Family State'

const LOT_TYPE_SYNONYMS: Record<string, NormalizedLotType> = {
  lawn: 'Lawn Lot',
  'lawn lot': 'Lawn Lot',
  'lawn_lot': 'Lawn Lot',
  standard: 'Lawn Lot',
  garden: 'Garden Lot',
  'garden lot': 'Garden Lot',
  'garden_lot': 'Garden Lot',
  premium: 'Garden Lot',
  family: 'Family State',
  'family state': 'Family State',
  'family_state': 'Family State',
  'family lot': 'Family State',
}

const DB_TYPE_MAP: Record<NormalizedLotType, 'Standard' | 'Premium' | 'Family'> = {
  'Lawn Lot': 'Standard',
  'Garden Lot': 'Premium',
  'Family State': 'Family',
}

export const NORMALIZED_LOT_TYPES: NormalizedLotType[] = ['Lawn Lot', 'Garden Lot', 'Family State']

export function normalizeLotTypeLabel(input?: string | null): NormalizedLotType {
  if (!input) return 'Lawn Lot'
  const key = input.trim().toLowerCase()
  return LOT_TYPE_SYNONYMS[key] || LOT_TYPE_SYNONYMS[key.replace(/[\s_-]+/g, ' ')] || 'Lawn Lot'
}

export function mapNormalizedLotTypeToDb(lotType: NormalizedLotType): 'Standard' | 'Premium' | 'Family' {
  return DB_TYPE_MAP[lotType]
}

export function deriveSectionLabelFromMap(mapName?: string | null): string | undefined {
  const trimmed = mapName?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

export function deriveBlockId(mapName?: string | null, lotTypeLabel?: string | null): string | undefined {
  if (!mapName || !lotTypeLabel) return undefined
  const trimmedName = mapName.trim()
  if (!trimmedName) return undefined
  const words = trimmedName.split(/\s+/)
  const lastWord = words[words.length - 1] || ''
  if (!lastWord) return undefined
  const mapInitial = lastWord[0]?.toUpperCase()
  const lotInitial = lotTypeLabel.trim()[0]?.toUpperCase()
  if (!mapInitial || !lotInitial) return undefined
  return `${mapInitial}-${lotInitial}`
}
