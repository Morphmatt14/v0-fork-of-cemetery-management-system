"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface GoogleMapsBackgroundProps {
  googleMapsUrl?: string | null
  zoom?: number
  interactive?: boolean
}

declare global {
  interface Window {
    google?: any
  }
}

function extractLatLng(googleMapsUrl?: string | null): { lat: number; lng: number } | null {
  if (!googleMapsUrl) return null

  try {
    const atIndex = googleMapsUrl.indexOf("@")
    if (atIndex !== -1) {
      const afterAt = googleMapsUrl.slice(atIndex + 1)
      const parts = afterAt.split(",")
      const lat = Number(parts[0])
      const lng = Number(parts[1])
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng }
      }
    }

    const match = googleMapsUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    if (match) {
      const lat = Number(match[1])
      const lng = Number(match[2])
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng }
      }
    }
  } catch (error) {
    console.error("Failed to parse Google Maps URL for coordinates", error)
  }

  return null
}

export function GoogleMapsBackground({
  googleMapsUrl,
  zoom = 1,
  interactive = false,
}: GoogleMapsBackgroundProps) {
  const isGoogleEmbed = !!googleMapsUrl && googleMapsUrl.includes("google.com/maps/embed")

  const coordinates = useMemo(() => extractLatLng(googleMapsUrl), [googleMapsUrl])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const [googleReady, setGoogleReady] = useState(false)

  // Load Google Maps JavaScript API once on the client
  useEffect(() => {
    if (typeof window === "undefined" || isGoogleEmbed) return

    let cancelled = false

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for Google Maps background")
      return
    }

    const handleScriptLoaded = () => {
      if (!cancelled) {
        setGoogleReady(true)
      }
    }

    if (window.google && window.google.maps) {
      setGoogleReady(true)
      return
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    ) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener("load", handleScriptLoaded)
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=quarterly`
    script.async = true
    script.addEventListener("load", handleScriptLoaded)
    script.addEventListener("error", (error) => {
      console.error("Failed to load Google Maps JavaScript API", error)
    })
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [isGoogleEmbed])

  // Initialize the Google Map once the API and the container are ready
  useEffect(() => {
    if (isGoogleEmbed) return
    if (!googleReady || !containerRef.current || mapRef.current) return

    const googleObj = window.google
    if (!googleObj || !googleObj.maps) return

    const center = coordinates ?? { lat: 14.5995, lng: 120.9842 }

    const map = new googleObj.maps.Map(containerRef.current, {
      center,
      zoom: 19,
      mapTypeId: googleObj.maps.MapTypeId.SATELLITE,
      disableDefaultUI: true,
      draggable: true,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    })

    if (coordinates) {
      new googleObj.maps.Marker({ position: coordinates, map })
    }

    mapRef.current = map
  }, [googleReady, coordinates, isGoogleEmbed])

  // Keep map center in sync if URL coordinates change
  useEffect(() => {
    if (isGoogleEmbed) return
    if (!mapRef.current || !coordinates) return
    mapRef.current.setCenter(coordinates)
  }, [coordinates, isGoogleEmbed])

  // Sync zoom from editor with Google Maps zoom
  useEffect(() => {
    if (isGoogleEmbed) return
    if (!mapRef.current) return

    const clampedZoom = Math.max(0.5, Math.min(zoom, 3))
    const targetZoom = 19 + (clampedZoom - 1) * 2

    const currentZoom = mapRef.current.getZoom()
    if (typeof currentZoom === "number" && Math.abs(currentZoom - targetZoom) > 0.1) {
      mapRef.current.setZoom(targetZoom)
    }
  }, [zoom, isGoogleEmbed])

  // Clean up the map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(mapRef.current)
        }
        mapRef.current = null
      }
    }
  }, [])

  // If the user pasted an official Google Maps embed URL (from "Share" → "Embed a map"),
  // we can show that directly. This supports Satellite view and is still free to use.
  if (isGoogleEmbed && googleMapsUrl) {
    return (
      <iframe
        src={googleMapsUrl}
        className={`absolute inset-0 w-full h-full border-0 ${interactive ? "" : "pointer-events-none"}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    )
  }

  // Otherwise, fall back to a Google Maps background using the JS API. If we
  // can't parse coordinates from the URL, we still render a map using a
  // default center.
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full bg-gray-200 ${interactive ? "" : "pointer-events-none"}`}
    />
  )
}
