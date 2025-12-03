export const MAP_LOTS_UPDATED_EVENT = "cemetery-map-lots-updated"

export function emitMapLotsUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(MAP_LOTS_UPDATED_EVENT))
}
