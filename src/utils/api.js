/**
 * API Service for Backend Communication
 * Handles all API calls to the backend server
 */

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'http://localhost/bus/api')

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    console.log('API Request:', url, config)
    const response = await fetch(url, config)
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    let data
    let responseText = ''
    
    // Try to parse as JSON first
    try {
      responseText = await response.text()
      console.log('API Response:', responseText)
      if (responseText) {
        data = JSON.parse(responseText)
      } else {
        throw new Error('Empty response from server')
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      // If not JSON, it might be an error page or PHP error
      throw new Error(`Server error: ${response.status} ${response.statusText}. Please check if PHP backend is running. Response: ${responseText?.substring(0, 200) || 'No response text available'}`)
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Server error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API Error Details:', {
      url,
      error: error.message,
      type: error.constructor.name
    })
    
    // Re-throw with more context if needed
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const detailedError = new Error('Network error: Unable to connect to server. Please ensure:\n1. WAMP/Apache is running (green icon)\n2. PHP is enabled\n3. API files are in the correct location (api/ folder)\n4. Try accessing: http://localhost/bus/api/check_api.php in browser')
      detailedError.originalError = error
      throw detailedError
    }
    throw error
  }
}

/**
 * User Signup API
 */
export const signup = async (userData) => {
  return apiRequest('/signup.php', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

/**
 * User Login API
 */
export const login = async (email, password) => {
  return apiRequest('/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

/**
 * Get user's assigned bus (for students/parents)
 */
export const getUserBusAssignment = async () => {
  return apiRequest('/user/bus-assignment.php')
}

/**
 * Get all buses (for admin)
 */
export const getAllBuses = async () => {
  return apiRequest('/admin/buses.php')
}

/**
 * Get bus location
 */
export const getBusLocation = async (busNumber) => {
  return apiRequest(`/bus/${busNumber}/location.php`)
}

/**
 * Get student's bus assignment with live data
 */
export const getStudentBusAssignment = async () => {
  return apiRequest('/student/bus-assignment.php')
}

/**
 * Get student's delays and notifications
 */
export const getStudentDelays = async () => {
  return apiRequest('/student/delays.php')
}

/**
 * Get driver's bus assignment
 */
export const getDriverBusAssignment = async () => {
  return apiRequest('/driver/bus-assignment.php')
}

/**
 * Driver start trip
 */
export const driverStartTrip = async () => {
  return apiRequest('/driver/start-trip.php', {
    method: 'POST',
  })
}

/**
 * Driver end trip
 */
export const driverEndTrip = async () => {
  return apiRequest('/driver/end-trip.php', {
    method: 'POST',
  })
}

/**
 * Driver report delay
 */
export const driverReportDelay = async (delayData) => {
  return apiRequest('/driver/report-delay.php', {
    method: 'POST',
    body: JSON.stringify(delayData),
  })
}

/**
 * Driver update location
 */
export const driverUpdateLocation = async (locationData) => {
  return apiRequest('/driver/update-location.php', {
    method: 'POST',
    body: JSON.stringify(locationData),
  })
}

/**
 * Get parent's delays
 */
export const getParentDelays = async () => {
  return apiRequest('/parent/delays.php')
}

/**
 * Get staff delays (all delays)
 */
export const getStaffDelays = async () => {
  return apiRequest('/staff/delays.php')
}
