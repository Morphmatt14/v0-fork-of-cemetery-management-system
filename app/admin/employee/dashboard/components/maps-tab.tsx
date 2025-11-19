'use client'

import MapManager from "@/components/map-manager"

export default function MapsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Map header content */}
        </div>
      </div>
      <MapManager />
    </div>
  )
}
