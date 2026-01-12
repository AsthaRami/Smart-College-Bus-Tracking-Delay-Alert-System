import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUserData } from '../utils/auth'
import MapComponent from '../components/MapComponent'
import NotificationPopup from '../components/NotificationPopup'
import BusSearch from '../components/BusSearch'
import Header from '../components/Header'
import { getStaffDelays } from '../utils/api'

const StaffDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [buses, setBuses] = useState([])
  const [selectedBus, setSelectedBus] = useState(null)
  const [busLocation, setBusLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalStudents: 0,
    onTime: 0,
  })

  useEffect(() => {
    // Check authentication
    const user = getUserData()
    if (!user || user.role !== 'Staff') {
      navigate('/login')
      return
    }
    setUserData(user)

    // Load buses and statistics
    loadDashboardData()
    
    // Set up live updates every 15 seconds
    const updateInterval = setInterval(() => {
      loadDashboardData()
    }, 15000) // Update every 15 seconds
    
    return () => clearInterval(updateInterval)
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load all buses
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/bus/api'
      const token = localStorage.getItem('authToken')
      
      const busesResponse = await fetch(`${API_BASE_URL}/staff/buses.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (busesResponse.ok) {
        const busesData = await busesResponse.json()
        if (busesData.success) {
          // Fetch location and stops for each bus
          const busesWithDetails = await Promise.all(
            (busesData.buses || []).map(async (bus) => {
              try {
                const searchResponse = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(bus.bus_number)}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                })
                if (searchResponse.ok) {
                  const searchData = await searchResponse.json()
                  if (searchData.success && searchData.bus) {
                    return {
                      ...bus,
                      location: searchData.bus.location,
                      stops: searchData.bus.stops || [],
                    }
                  }
                }
              } catch (error) {
                console.error('Error fetching bus details:', error)
              }
              return bus
            })
          )
          
          setBuses(busesWithDetails)
          
          // Calculate statistics
          const activeBuses = busesWithDetails.filter((b) => b.status === 'On Route').length
          setStats({
            totalBuses: busesWithDetails.length,
            activeBuses: activeBuses,
            totalStudents: busesData.totalStudents || 0,
            onTime: busesData.onTimeBuses || 0,
          })
        }
      }

      // Load statistics
      const statsResponse = await fetch(`${API_BASE_URL}/staff/statistics.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats((prev) => ({
            ...prev,
            ...statsData.statistics,
          }))
        }
      }
      
      // Load delays
      loadDelays()
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const loadDelays = async () => {
    try {
      const response = await getStaffDelays()
      
      if (response.success && response.delays && response.delays.length > 0) {
        // Show latest critical/high severity delays as notifications
        const criticalDelays = response.delays
          .filter(d => d.severity === 'Critical' || d.severity === 'High')
          .slice(0, 3)
        
        criticalDelays.forEach((delay) => {
          const driverName = delay.driver_name ? `Driver ${delay.driver_name}: ` : ''
          addNotification({
            type: 'delay',
            title: `Bus ${delay.bus_number} Delay - ${delay.severity}`,
            message: `${driverName}${delay.delay_reason} (${delay.delay_minutes} min delay)`,
          })
        })
      }
    } catch (error) {
      console.error('Error loading delays:', error)
    }
  }

  const handleBusSelect = (bus) => {
    setSelectedBus(bus)
    if (bus.location) {
      setBusLocation({ lat: bus.location.lat, lng: bus.location.lng })
    } else {
      setBusLocation(null)
    }
  }
  
  const handleBusSearchSelect = async (bus) => {
    // Fetch full bus details including location and stops
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
    const token = localStorage.getItem('authToken')
    
    try {
      const response = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(bus.bus_number)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.bus) {
          const fullBusData = {
            ...bus,
            location: data.bus.location,
            stops: data.bus.stops || [],
          }
          handleBusSelect(fullBusData)
        }
      }
    } catch (error) {
      console.error('Error fetching bus details:', error)
    }
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
  }

  const removeNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const refreshData = () => {
    loadDashboardData()
    addNotification({
      type: 'success',
      title: 'Refreshed',
      message: 'Dashboard data has been refreshed.',
    })
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Staff Dashboard"
        subtitle={`Welcome, ${userData.name || userData.email}`}
        rightActions={
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Buses</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalBuses}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Active Buses</h3>
                <p className="text-3xl font-bold text-green-600">{stats.activeBuses}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">On Time</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.onTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Bus List */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">All Buses</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {buses.length > 0 ? (
                      buses.map((bus) => (
                        <button
                          key={bus.id}
                          onClick={() => handleBusSelect(bus)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition ${
                            selectedBus?.id === bus.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{bus.bus_number}</h3>
                              <p className="text-sm text-gray-600 mt-1">{bus.route_name || 'No Route'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Driver: {bus.driver_name || 'Not Assigned'}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                bus.status === 'On Route'
                                  ? 'bg-green-100 text-green-800'
                                  : bus.status === 'Stopped'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {bus.status}
                            </span>
                          </div>
                          {bus.current_passengers !== undefined && (
                            <div className="mt-2 text-xs text-gray-600">
                              Passengers: {bus.current_passengers}/{bus.capacity}
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No buses available</p>
                    )}
                  </div>
                </div>

                {/* Selected Bus Details */}
                {selectedBus && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Bus Details</h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Bus Number</p>
                        <p className="text-lg font-medium text-gray-900">{selectedBus.bus_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Route</p>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedBus.route_name || 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Driver</p>
                        <p className="text-lg font-medium text-gray-900">
                          {selectedBus.driver_name || 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p
                          className={`text-lg font-medium ${
                            selectedBus.status === 'On Route'
                              ? 'text-green-600'
                              : selectedBus.status === 'Stopped'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {selectedBus.status}
                        </p>
                      </div>
                      {selectedBus.capacity && (
                        <div>
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="text-lg font-medium text-gray-900">
                            {selectedBus.current_passengers || 0} / {selectedBus.capacity}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedBus ? `${selectedBus.bus_number} Location` : 'Select a Bus to View Location'}
                    </h2>
                  </div>
                  <div className="mb-4">
                    <BusSearch 
                      onBusSelect={handleBusSearchSelect}
                      selectedBusNumber={selectedBus?.bus_number}
                    />
                  </div>
                  {selectedBus && busLocation ? (
                    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                      <MapComponent
                        busLocation={busLocation}
                        busNumber={selectedBus.bus_number}
                        isLive={selectedBus.status === 'On Route'}
                        stops={selectedBus.stops || []}
                      />
                    </div>
                  ) : (
                    <div className="h-96 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-300">
                      <p className="text-gray-500">
                        {selectedBus ? 'Location data not available. Use search to find bus location.' : 'Select a bus from the list or search above to view its location'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default StaffDashboard
