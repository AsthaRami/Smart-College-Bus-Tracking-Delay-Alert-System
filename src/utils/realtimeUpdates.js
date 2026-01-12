/**
 * Real-Time Bus Location Updates
 * Uses Fetch API to get live bus locations
 */

/**
 * Fetch bus location from API
 * @param {string} busNumber - Bus number
 * @returns {Promise<object>} Bus location data
 */
export const fetchBusLocation = async (busNumber) => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/bus/${busNumber}/location`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bus location')
    }

    const data = await response.json()
    return {
      busNumber: data.busNumber,
      location: {
        lat: data.latitude,
        lng: data.longitude,
      },
      timestamp: data.timestamp,
      status: data.status,
      speed: data.speed || 0,
    }
  } catch (error) {
    console.error('Error fetching bus location:', error)
    // Return mock data for demo
    return getMockBusLocation(busNumber)
  }
}

/**
 * Mock bus location for demo purposes
 * @param {string} busNumber - Bus number
 * @returns {object} Mock location data
 */
const getMockBusLocation = (busNumber) => {
  // Simulate bus movement with slight random variation
  const baseLat = 22.3081 // KPGU Campus, Varnama, Vadodara
  const baseLng = 73.2190 // KPGU Campus, Varnama, Vadodara
  const variation = 0.01

  return {
    busNumber,
    location: {
      lat: baseLat + (Math.random() - 0.5) * variation,
      lng: baseLng + (Math.random() - 0.5) * variation,
    },
    timestamp: new Date().toISOString(),
    status: 'moving',
    speed: Math.floor(Math.random() * 40) + 20, // 20-60 km/h
  }
}

/**
 * Start real-time location updates
 * @param {string} busNumber - Bus number
 * @param {function} callback - Callback function to handle updates
 * @param {number} interval - Update interval in milliseconds (default: 5000)
 * @returns {function} Function to stop updates
 */
export const startRealTimeUpdates = (busNumber, callback, interval = 5000) => {
  let isActive = true

  const updateLocation = async () => {
    if (!isActive) return

    try {
      const locationData = await fetchBusLocation(busNumber)
      callback(locationData)
    } catch (error) {
      console.error('Error in real-time update:', error)
    }

    if (isActive) {
      setTimeout(updateLocation, interval)
    }
  }

  // Start updates
  updateLocation()

  // Return stop function
  return () => {
    isActive = false
  }
}

/**
 * Fetch all buses locations
 * @returns {Promise<Array>} Array of bus locations
 */
export const fetchAllBusLocations = async () => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/buses/locations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bus locations')
    }

    const data = await response.json()
    return data.buses || []
  } catch (error) {
    console.error('Error fetching all bus locations:', error)
    return []
  }
}

/**
 * Update driver location
 * @param {string} busNumber - Bus number
 * @param {object} location - Location object with lat and lng
 * @returns {Promise<object>} Update result
 */
export const updateDriverLocation = async (busNumber, location) => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/bus/${busNumber}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update location')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating driver location:', error)
    throw error
  }
}

/**
 * Get current GPS location
 * @returns {Promise<object>} GPS location with lat and lng
 */
export const getCurrentGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

