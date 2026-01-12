import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUserData } from '../utils/auth'
import MapComponent from '../components/MapComponent'
import NotificationPopup from '../components/NotificationPopup'
import BusSearch from '../components/BusSearch'
import Header from '../components/Header'
import { getStudentBusAssignment, getStudentDelays } from '../utils/api'
import { formatTime } from '../utils/delayDetection'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [busData, setBusData] = useState({
    busNumber: 'BUS-001',
    route: 'Route A: College → Station → Downtown',
    assignedDriver: 'John Doe',
    status: 'On Route',
  })
  const [busLocation, setBusLocation] = useState(null)
  const [eta, setEta] = useState({
    expected: new Date(Date.now() + 15 * 60000), // 15 minutes from now
    actual: null,
  })
  const [notifications, setNotifications] = useState([])
  const [isTracking, setIsTracking] = useState(false)
  const [delayInfo, setDelayInfo] = useState(null)

  useEffect(() => {
    // Check authentication
    const user = getUserData()
    if (!user || user.role !== 'Student') {
      navigate('/login')
      return
    }
    setUserData(user)

    // Load student's assigned bus data
    loadBusData()
    loadDelays()

    // Start real-time tracking
    setIsTracking(true)
    
    // Set up polling for updates
    const interval = setInterval(() => {
      loadBusData()
      loadDelays()
    }, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  const handleBusSearchSelect = (bus) => {
    if (bus.location) {
      setBusLocation(bus.location)
    }
    setBusData(prev => ({
      ...prev,
      busNumber: bus.bus_number,
      route: bus.route,
      routeName: bus.route_name,
      stops: bus.stops || [],
      assignedDriver: bus.driver_name || prev.assignedDriver,
    }))
    setIsTracking(bus.status === 'On Route')
  }

  const loadBusData = async () => {
    try {
      const response = await getStudentBusAssignment()
      
      if (response.success && response.bus) {
        const bus = response.bus
        setBusData({
          busNumber: bus.busNumber,
          route: bus.route,
          routeName: bus.routeName,
          routeDescription: bus.routeDescription,
          assignedDriver: bus.assignedDriver || 'Not Assigned',
          status: bus.status,
          stops: bus.stops || [],
        })
        
        if (bus.location) {
          setBusLocation(bus.location)
        }
        
        if (bus.eta) {
          setEta({
            expected: new Date(bus.eta),
            actual: bus.location ? new Date(Date.now() + 15 * 60000) : null,
          })
        }
        
        if (bus.delay) {
          setDelayInfo({
            isDelayed: true,
            delayMinutes: bus.delay.minutes || 0,
            severity: bus.delay.severity || 'Medium',
            reason: bus.delay.reason,
          })
          
          addNotification({
            type: 'delay',
            title: 'Bus Delay Alert',
            message: `Bus ${bus.busNumber} is delayed. ${bus.delay.reason}`,
          })
        }
      }
    } catch (error) {
      console.error('Error loading bus data:', error)
    }
  }
  
  const loadDelays = async () => {
    try {
      const response = await getStudentDelays()
      
      if (response.success) {
        // Add new delay notifications
        if (response.notifications && response.notifications.length > 0) {
          response.notifications.forEach((notif) => {
            addNotification({
              type: 'delay',
              title: notif.title,
              message: notif.message,
            })
          })
        }
        
        // Update delay info from latest delay
        if (response.delays && response.delays.length > 0) {
          const latestDelay = response.delays[0]
          setDelayInfo({
            isDelayed: true,
            delayMinutes: latestDelay.delay_minutes || 0,
            severity: latestDelay.severity || 'Medium',
            reason: latestDelay.delay_reason,
            driverName: latestDelay.driver_name || 'Driver',
          })
        }
      }
    } catch (error) {
      console.error('Error loading delays:', error)
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

  const viewDelayReason = () => {
    if (delayInfo?.reason) {
      const driverName = delayInfo?.driverName ? `From ${delayInfo.driverName}: ` : ''
      alert(`Delay Message:\n\n${driverName}${delayInfo.reason}\n\nDelay Duration: ${delayInfo.delayMinutes || 0} minutes`)
    } else {
      alert('No delay information available')
    }
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Student Dashboard"
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
          {/* Left Column - Bus Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Assigned Bus Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Bus</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Bus Number</p>
                  <p className="text-2xl font-bold text-blue-600">{busData.busNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="text-lg font-medium text-gray-900">{busData.assignedDriver}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-medium text-green-600">{busData.status}</p>
                </div>
              </div>
            </div>

            {/* Route Details Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Details</h2>
              <div className="space-y-2">
                <p className="text-gray-700">{busData.route}</p>
                {busData.stops && busData.stops.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {busData.stops.map((stop, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          index === 0 ? 'bg-blue-500' :
                          index === busData.stops.length - 1 ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}></span>
                        <span>{stop.stop_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ETA Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimated Arrival</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Expected Time</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTime(eta.expected)}
                  </p>
                </div>
                {eta.actual && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Time</p>
                    <p className="text-lg font-medium text-blue-600">
                      {formatTime(eta.actual)}
                    </p>
                  </div>
                )}
                {delayInfo && delayInfo.isDelayed && (
                  <div>
                    <p className="text-sm text-gray-600">Delay Status</p>
                    <p
                      className={`text-lg font-medium ${
                        delayInfo.severity === 'Critical'
                          ? 'text-red-600'
                          : delayInfo.severity === 'High'
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      Delayed by {delayInfo.delayMinutes} minutes
                    </p>
                    <button
                      onClick={viewDelayReason}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View Delay Reason
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Alert Notifications */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Alerts</h2>
              <div className="space-y-2">
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notif, index) => (
                    <div
                      key={index}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-yellow-800">{notif.title}</p>
                      <p className="text-xs text-yellow-600 mt-1">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent alerts</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Live Bus Location</h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  ></span>
                  <span className="text-sm text-gray-600">
                    {isTracking ? 'Live Tracking' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <BusSearch 
                  onBusSelect={(bus) => {
                    if (bus.location) {
                      setBusLocation(bus.location)
                    }
                    setBusData(prev => ({
                      ...prev,
                      busNumber: bus.bus_number,
                      route: bus.route,
                      routeName: bus.route_name,
                      stops: bus.stops || [],
                    }))
                  }}
                  selectedBusNumber={busData.busNumber}
                />
              </div>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <MapComponent
                  busLocation={busLocation}
                  busNumber={busData.busNumber}
                  isLive={isTracking}
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

export default StudentDashboard

