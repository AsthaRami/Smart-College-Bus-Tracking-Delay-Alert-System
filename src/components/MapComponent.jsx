import { useEffect, useRef, useState } from 'react'

/**
 * Map Component for displaying bus locations using Leaflet (OpenStreetMap)
 */
const MapComponent = ({ busLocation, busNumber, isLive = false, stops = [], routePath = null }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const stopsMarkersRef = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Wait for Leaflet to load
    if (typeof window !== 'undefined' && window.L && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    } else if (typeof window !== 'undefined' && !window.L) {
      // Retry after a delay if Leaflet isn't loaded yet
      const timer = setTimeout(() => {
        if (window.L && mapRef.current && !mapInstanceRef.current) {
          initializeMap()
        } else {
          setError('Map library is loading. Please wait...')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Update map when bus location changes
    if (mapInstanceRef.current && busLocation) {
      updateBusMarker(busLocation)
    }
  }, [busLocation, busNumber, isLive])

  useEffect(() => {
    // Update stops when they change
    if (mapInstanceRef.current && stops && stops.length > 0) {
      updateRouteStops()
    }
  }, [stops])

  const initializeMap = () => {
    try {
      const defaultLocation = busLocation 
        ? [busLocation.lat || busLocation[0], busLocation.lng || busLocation[1]]
        : [22.3081, 73.2190] // Default: KPGU Campus, Krishna Education Campus, Varnama, Vadodara

      // Create map instance
      const map = window.L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
      }).setView(defaultLocation, 13)

      // Add OpenStreetMap tiles (colored, standard map tiles)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
      setError(null)

      // Add bus marker if location provided
      if (busLocation) {
        updateBusMarker(busLocation)
      }

      // Add route stops if provided
      if (stops && stops.length > 0) {
        updateRouteStops()
      }

      // Fit bounds to show all markers if multiple stops exist
      if (stops && stops.length > 0) {
        const bounds = stops.map(stop => [stop.latitude, stop.longitude])
        if (busLocation) {
          bounds.push([busLocation.lat || busLocation[0], busLocation.lng || busLocation[1]])
        }
        map.fitBounds(bounds, { padding: [50, 50] })
      }

    } catch (err) {
      console.error('Map initialization error:', err)
      setError('Failed to initialize map. Please refresh the page.')
    }
  }

  const updateBusMarker = (location) => {
    if (!mapInstanceRef.current) return

    const lat = location.lat || location[0]
    const lng = location.lng || location[1]

    // Create custom bus icon
    const busIcon = window.L.divIcon({
      className: 'custom-bus-marker',
      html: `<div style="background-color: #3B82F6; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 14px;">🚌</span>
              </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    })

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
    }

    // Create new marker
    const marker = window.L.marker([lat, lng], { icon: busIcon }).addTo(mapInstanceRef.current)

    // Add popup
    const popupContent = `
      <div style="padding: 8px; min-width: 150px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${busNumber || 'Bus Location'}</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;">
          <strong>Status:</strong> <span style="color: ${isLive ? '#10B981' : '#6B7280'};">${isLive ? '🟢 Live' : '⚫ Stopped'}</span>
        </p>
        <p style="margin: 4px 0; font-size: 13px; color: #4B5563;">
          <strong>Updated:</strong> ${new Date().toLocaleTimeString()}
        </p>
        ${location.speed ? `<p style="margin: 4px 0; font-size: 13px; color: #4B5563;"><strong>Speed:</strong> ${Math.round(location.speed)} km/h</p>` : ''}
      </div>
    `
    marker.bindPopup(popupContent)

    // If live, add animation
    if (isLive) {
      marker.setOpacity(0.9)
    }

    markerRef.current = marker

    // Pan to marker
    mapInstanceRef.current.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 14))
  }

  const updateRouteStops = () => {
    if (!mapInstanceRef.current || !stops || stops.length === 0) return

    // Remove existing stop markers
    stopsMarkersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    stopsMarkersRef.current = []

    // Add markers for each stop
    stops.forEach((stop, index) => {
      const isFirst = index === 0
      const isLast = index === stops.length - 1
      
      const stopIcon = window.L.divIcon({
        className: 'custom-stop-marker',
        html: `<div style="background-color: ${isFirst ? '#10B981' : isLast ? '#EF4444' : '#F59E0B'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      })

      const marker = window.L.marker(
        [stop.latitude, stop.longitude],
        { icon: stopIcon }
      ).addTo(mapInstanceRef.current)

      marker.bindPopup(`
        <div style="padding: 5px;">
          <strong>${stop.stop_name}</strong><br/>
          Stop #${stop.stop_order}
        </div>
      `)

      stopsMarkersRef.current.push(marker)
    })

    // Draw route line if multiple stops
    if (stops.length > 1) {
      const routeCoordinates = stops.map(stop => [stop.latitude, stop.longitude])
      
      // Check if route line already exists and remove it
      if (mapInstanceRef.current.routeLine) {
        mapInstanceRef.current.removeLayer(mapInstanceRef.current.routeLine)
      }
      
      const polyline = window.L.polyline(routeCoordinates, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 5'
      }).addTo(mapInstanceRef.current)
      
      mapInstanceRef.current.routeLine = polyline

      // Fit bounds to show all stops
      const bounds = routeCoordinates.slice()
      if (busLocation) {
        bounds.push([busLocation.lat || busLocation[0], busLocation.lng || busLocation[1]])
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  return (
    <div className="w-full h-full relative">
      {error && (
        <div className="absolute top-2 left-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-[1000] shadow-lg">
          {error}
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px', zIndex: 1 }}
      />
      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <style>{`
        .custom-bus-marker {
          background: transparent;
          border: none;
        }
        .custom-stop-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}

export default MapComponent
