import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUserData } from '../utils/auth'
import MapComponent from '../components/MapComponent'
import NotificationPopup from '../components/NotificationPopup'
import BusSearch from '../components/BusSearch'
import Header from '../components/Header'
import { getDriverBusAssignment, driverStartTrip, driverEndTrip, driverReportDelay, driverUpdateLocation } from '../utils/api'
import { getCurrentGPSLocation } from '../utils/realtimeUpdates'

const DriverDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [busData, setBusData] = useState({
    busNumber: '',
    route: '',
    routeName: '',
    routeDescription: '',
    routeId: null,
    stops: [],
    status: 'Not Started',
  })
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isTripStarted, setIsTripStarted] = useState(false)
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null)
  const [delayReason, setDelayReason] = useState('')
  const [notifications, setNotifications] = useState([])
  const locationIntervalRef = useRef(null)

  useEffect(() => {
    // Check authentication
    const user = getUserData()
    if (!user || user.role !== 'Driver') {
      navigate('/login')
      return
    }
    setUserData(user)

    // Load driver's assigned bus
    loadBusData()

    // Get initial location
    getCurrentLocation()
  }, [])

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [])

  const loadBusData = async () => {
    try {
      const response = await getDriverBusAssignment()
      
      if (response.success && response.bus) {
        const bus = response.bus
        setBusData({
          busNumber: bus.busNumber,
          route: bus.route,
          routeName: bus.routeName,
          routeDescription: bus.routeDescription,
          routeId: bus.routeId,
          stops: bus.stops || [],
          status: bus.status || 'Not Started',
        })
        
        // Check if there's an active trip
        if (bus.status === 'On Route') {
          setIsTripStarted(true)
          setIsLocationSharing(true)
          startLocationSharing()
        }
      }
    } catch (error) {
      console.error('Error loading bus data:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: 'Failed to load bus assignment. Please try again.',
      })
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await getCurrentGPSLocation()
      setCurrentLocation(location)
    } catch (error) {
      console.error('Error getting location:', error)
      // Fallback to mock location
      setCurrentLocation({ lat: 22.3081, lng: 73.2190 }) // Default: KPGU Campus, Varnama, Vadodara
      addNotification({
        type: 'alert',
        title: 'Location Error',
        message: 'Using approximate location. Please enable GPS for accurate tracking.',
      })
    }
  }

  const handleStartTrip = async () => {
    try {
      const response = await driverStartTrip()
      
      if (response.success) {
        setIsTripStarted(true)
        setBusData((prev) => ({ ...prev, status: 'On Route' }))
        setIsLocationSharing(true)

        // Start auto-updating location
        startLocationSharing()

        addNotification({
          type: 'success',
          title: 'Trip Started',
          message: 'Your trip has been started. Location sharing is now active.',
        })
      }
    } catch (error) {
      console.error('Error starting trip:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: error.message || 'Failed to start trip. Please try again.',
      })
    }
  }

  const handleEndTrip = async () => {
    try {
      const response = await driverEndTrip()
      
      if (response.success) {
        setIsTripStarted(false)
        setBusData((prev) => ({ ...prev, status: 'Completed' }))
        setIsLocationSharing(false)

        // Stop location updates
        stopLocationSharing()

        addNotification({
          type: 'success',
          title: 'Trip Ended',
          message: 'Your trip has been completed successfully.',
        })
      }
    } catch (error) {
      console.error('Error ending trip:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: error.message || 'Failed to end trip. Please try again.',
      })
    }
  }

  const startLocationSharing = () => {
    // Update location every 10 seconds
    locationIntervalRef.current = setInterval(async () => {
      try {
        const location = await getCurrentLocation()
        if (location && isTripStarted) {
          await driverUpdateLocation({
            latitude: location.lat,
            longitude: location.lng,
            accuracy: location.accuracy,
            speed: 0, // Can be enhanced with speed calculation
          })
          setCurrentLocation(location)
        }
      } catch (error) {
        console.error('Error updating location:', error)
      }
    }, 10000) // Update every 10 seconds

    setLocationUpdateInterval(locationIntervalRef.current)
  }

  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
      setLocationUpdateInterval(null)
    }
  }

  const handleShareLocation = async () => {
    try {
      const location = await getCurrentLocation()
      if (location) {
        await driverUpdateLocation({
          latitude: location.lat,
          longitude: location.lng,
          accuracy: location.accuracy,
        })
        setCurrentLocation(location)
        addNotification({
          type: 'success',
          title: 'Location Updated',
          message: 'Your current location has been shared successfully.',
        })
      }
    } catch (error) {
      console.error('Error sharing location:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: error.message || 'Failed to share location. Please try again.',
      })
    }
  }

  const handleReportDelay = async () => {
    if (!delayReason.trim()) {
      addNotification({
        type: 'alert',
        title: 'Validation Error',
        message: 'Please provide a reason for the delay.',
      })
      return
    }

    try {
      console.log('Reporting delay:', delayReason.trim())
      const response = await driverReportDelay({
        delay_reason: delayReason.trim(),
        delay_minutes: 0, // Driver can specify or we can calculate
      })
      
      console.log('Delay response:', response)
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Delay Reported Successfully',
          message: `Your delay message has been sent to all passengers. Message: "${delayReason.trim()}"`,
        })
        setDelayReason('')
      } else {
        throw new Error(response.message || 'Failed to report delay')
      }
    } catch (error) {
      console.error('Error reporting delay:', error)
      addNotification({
        type: 'alert',
        title: 'Error Reporting Delay',
        message: error.message || 'Failed to report delay. Please check your connection and try again.',
      })
    }
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
  }

  const removeNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleLogout = () => {
    stopLocationSharing()
    clearSession()
    navigate('/')
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Driver Dashboard"
        subtitle={`Welcome, ${userData.name || userData.email}`}
        rightActions={
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        }
      />

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <NotificationPopup
          key={index}
          notification={notification}
          onClose={() => removeNotification(index)}
        />
      ))}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bus Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Bus</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Bus Number</p>
                  <p className="text-2xl font-bold text-blue-600">{busData.busNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="text-lg font-medium text-gray-900">{busData.route || 'No Route Assigned'}</p>
                  {busData.routeDescription && (
                    <p className="text-sm text-gray-500 mt-1">{busData.routeDescription}</p>
                  )}
                </div>
                {busData.stops && busData.stops.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Route Stops</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {busData.stops.map((stop, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            index === 0 ? 'bg-blue-500' :
                            index === busData.stops.length - 1 ? 'bg-green-500' :
                            'bg-yellow-500'
                          }`}></span>
                          <span className="text-gray-700">{stop.stop_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p
                    className={`text-lg font-medium ${
                      busData.status === 'On Route'
                        ? 'text-green-600'
                        : busData.status === 'Completed'
                        ? 'text-gray-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {busData.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Trip Controls */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Controls</h2>
              <div className="space-y-4">
                {!isTripStarted ? (
                  <button
                    onClick={handleStartTrip}
                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                  >
                    Start Trip
                  </button>
                ) : (
                  <button
                    onClick={handleEndTrip}
                    className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                  >
                    End Trip
                  </button>
                )}

                <button
                  onClick={handleShareLocation}
                  disabled={!isTripStarted}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share GPS Location
                </button>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Location Sharing</span>
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isLocationSharing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isLocationSharing
                      ? 'Auto-updating every 10 seconds'
                      : 'Start trip to enable location sharing'}
                  </p>
                </div>
              </div>
            </div>

            {/* Report Delay */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Delay</h2>
              <div className="space-y-4">
                <textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="Enter delay reason (e.g., Traffic jam, Accident, Mechanical issue...)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                />
                <button
                  onClick={handleReportDelay}
                  className="w-full px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
                >
                  Report Delay
                </button>
              </div>
            </div>

            {/* Current Location Info */}
            {currentLocation && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Location</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Latitude:</span>{' '}
                    <span className="font-mono">{currentLocation.lat.toFixed(6)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Longitude:</span>{' '}
                    <span className="font-mono">{currentLocation.lng.toFixed(6)}</span>
                  </p>
                  {currentLocation.accuracy && (
                    <p>
                      <span className="text-gray-600">Accuracy:</span>{' '}
                      <span>{Math.round(currentLocation.accuracy)}m</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Location</h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isLocationSharing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  ></span>
                  <span className="text-sm text-gray-600">
                    {isLocationSharing ? 'Sharing Active' : 'Not Sharing'}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <BusSearch 
                  onBusSelect={(bus) => {
                    if (bus.location) {
                      setCurrentLocation(bus.location)
                    }
                    setBusData(prev => ({
                      ...prev,
                      busNumber: bus.bus_number,
                      route: bus.route,
                      stops: bus.stops || [],
                    }))
                  }}
                  selectedBusNumber={busData.busNumber}
                />
              </div>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <MapComponent
                  busLocation={currentLocation}
                  busNumber={busData.busNumber}
                  isLive={isLocationSharing}
                  stops={busData.stops || []}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DriverDashboard

