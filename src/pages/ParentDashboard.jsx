import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUserData } from '../utils/auth'
import MapComponent from '../components/MapComponent'
import NotificationPopup from '../components/NotificationPopup'
import BusSearch from '../components/BusSearch'
import ChildSearch from '../components/ChildSearch'
import Header from '../components/Header'
import { formatTime } from '../utils/delayDetection'
import { getParentDelays } from '../utils/api'

const ParentDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [students, setStudents] = useState([]) // Parents can have multiple children
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [busData, setBusData] = useState({
    busNumber: '',
    route: '',
    assignedDriver: '',
    status: '',
  })
  const [busLocation, setBusLocation] = useState(null)
  const [eta, setEta] = useState({
    expected: null,
    actual: null,
  })
  const [notifications, setNotifications] = useState([])
  const [isTracking, setIsTracking] = useState(false)
  const [delayInfo, setDelayInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const user = getUserData()
    if (!user || user.role !== 'Parent') {
      navigate('/login')
      return
    }
    setUserData(user)

    // Load parent's children and their bus assignments
    loadChildrenData()
  }, [])

  useEffect(() => {
    if (selectedStudent && busData.busNumber) {
      // Start real-time location updates for selected student's bus
      setIsTracking(true)
      
      // Load delays when student is selected
      loadDelays()
      
      // Poll for location updates every 10 seconds
      const locationInterval = setInterval(async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/bus/api'
          const token = localStorage.getItem('authToken')
          
          const searchResponse = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(busData.busNumber)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            if (searchData.success && searchData.bus && searchData.bus.location) {
              setBusLocation({
                lat: searchData.bus.location.lat,
                lng: searchData.bus.location.lng,
                speed: searchData.bus.location.speed,
                timestamp: searchData.bus.location.timestamp
              })
            }
          }
        } catch (error) {
          console.error('Error updating location:', error)
        }
      }, 10000) // Update every 10 seconds
      
      // Poll for children and delays updates
      const dataInterval = setInterval(() => {
        loadChildrenData()
        loadDelays()
      }, 15000) // Update every 15 seconds
      
      return () => {
        clearInterval(locationInterval)
        clearInterval(dataInterval)
      }
    } else {
      setIsTracking(false)
    }
  }, [selectedStudent, busData.busNumber])

  const loadChildrenData = async () => {
    setLoading(true)
    try {
      // Call API to get parent's children and their bus assignments
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/bus/api'
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/parent/children.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to load children data')
      }

      const data = await response.json()
      
      if (data.success && data.children && data.children.length > 0) {
        // Fetch route stops for each child's bus
        const childrenData = await Promise.all(data.children.map(async (child) => {
          let stops = []
          if (child.bus_number) {
            try {
              const searchResponse = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(child.bus_number)}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              })
              if (searchResponse.ok) {
                const searchData = await searchResponse.json()
                if (searchData.success && searchData.bus) {
                  stops = searchData.bus.stops || []
                }
              }
            } catch (error) {
              console.error('Error fetching stops:', error)
            }
          }
          return {
            id: child.student_id,
            name: child.student_name,
            studentId: child.student_id,
            busNumber: child.bus_number || '',
            route: child.route_name || '',
            assignedDriver: child.driver_name || '',
            status: child.bus_status || 'Not Assigned',
            stops: stops,
          }
        }))
        setStudents(childrenData)
        // Auto-select first student
        handleStudentSelect(childrenData[0])
      } else {
        // No children linked yet
        setStudents([])
      }
    } catch (error) {
      console.error('Error loading children data:', error)
      // Set default empty state on error
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student)
    setBusData({
      busNumber: student.busNumber || '',
      route: student.route || '',
      assignedDriver: student.assignedDriver || '',
      status: student.status || 'Not Assigned',
      stops: student.stops || [],
    })
    
    // Fetch real bus location if bus number exists
    if (student.busNumber) {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/bus/api'
        const token = localStorage.getItem('authToken')
        
        const searchResponse = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(student.busNumber)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          if (searchData.success && searchData.bus) {
            if (searchData.bus.location) {
              setBusLocation({
                lat: searchData.bus.location.lat,
                lng: searchData.bus.location.lng,
                speed: searchData.bus.location.speed,
                timestamp: searchData.bus.location.timestamp
              })
            } else {
              setBusLocation({ lat: 22.3081, lng: 73.2190 }) // Default: KPGU Campus, Varnama, Vadodara
            }
            
            // Update stops if available
            if (searchData.bus.stops && searchData.bus.stops.length > 0) {
              setBusData(prev => ({
                ...prev,
                stops: searchData.bus.stops,
              }))
            }
            
            // Update status
            if (searchData.bus.status) {
              setBusData(prev => ({
                ...prev,
                status: searchData.bus.status,
              }))
            }
          } else {
            setBusLocation({ lat: 22.3072, lng: 73.1812 }) // Default: Vadodara
          }
        } else {
          setBusLocation({ lat: 22.3072, lng: 73.1812 }) // Default: Vadodara
        }
      } catch (error) {
        console.error('Error fetching bus location:', error)
        setBusLocation({ lat: 22.3072, lng: 73.1812 }) // Default: Vadodara
      }
    } else {
      setBusLocation({ lat: 22.3072, lng: 73.1812 }) // Default: Vadodara
    }
    
    setEta({
      expected: new Date(Date.now() + 15 * 60000), // 15 minutes from now
      actual: null,
    })
  }
  
  const handleBusSearchSelect = (bus) => {
    if (bus.location) {
      setBusLocation(bus.location)
    }
    setBusData(prev => ({
      ...prev,
      busNumber: bus.bus_number,
      route: bus.route,
      stops: bus.stops || [],
      assignedDriver: bus.driver_name || prev.assignedDriver,
      status: bus.status || prev.status,
    }))
  }
  
  const loadDelays = async () => {
    try {
      const response = await getParentDelays()
      
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
        
        // Show latest delay for selected student's bus
        if (response.delays && response.delays.length > 0 && selectedStudent) {
          const studentDelay = response.delays.find(
            d => d.bus_number === selectedStudent.busNumber
          )
          
          if (studentDelay) {
            setDelayInfo({
              isDelayed: true,
              delayMinutes: studentDelay.delay_minutes || 0,
              severity: studentDelay.severity || 'Medium',
              reason: studentDelay.delay_reason,
              driverName: studentDelay.driver_name || 'Driver',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading delays:', error)
    }
  }

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Avoid duplicate notifications
      const exists = prev.some(
        (n) => n.title === notification.title && n.message === notification.message
      )
      if (exists) return prev
      return [notification, ...prev]
    })
  }

  const removeNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const viewDelayReason = () => {
    const driverName = delayInfo?.driverName ? `From ${delayInfo.driverName}: ` : ''
    const reason = delayInfo?.reason || 'No reason provided'
    const minutes = delayInfo?.delayMinutes || 0
    alert(`Delay Message:\n\n${driverName}${reason}\n\nDelay Duration: ${minutes} minutes`)
  }

  const addChild = () => {
    // TODO: Implement add child functionality
    alert('Feature: Add child - This will allow you to link your children\'s accounts to your parent account.')
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
        title="Parent Dashboard"
        subtitle={`Welcome, ${userData.name || userData.email}`}
        rightActions={
          <div className="flex items-center space-x-4">
            <button
              onClick={addChild}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Child
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
            <p className="mt-4 text-gray-600">Loading children data...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Children Linked</h2>
            <p className="text-gray-600 mb-6">
              You haven't linked any children to your account yet. Add a child to start tracking their bus.
            </p>
            <button
              onClick={addChild}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Child
            </button>
          </div>
        ) : (
          <>
            {/* Student Selection with Search */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search & Select Child</h2>
              <ChildSearch
                children={students}
                onChildSelect={handleStudentSelect}
                selectedChildId={selectedStudent?.id}
              />
            </div>

            {selectedStudent && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Bus Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Child & Bus Card */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {selectedStudent.name}'s Bus
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="text-lg font-medium text-gray-900">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bus Number</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {busData.busNumber || 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Driver</p>
                        <p className="text-lg font-medium text-gray-900">
                          {busData.assignedDriver || 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p
                          className={`text-lg font-medium ${
                            busData.status === 'On Route'
                              ? 'text-green-600'
                              : busData.status === 'Not Assigned'
                              ? 'text-gray-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {busData.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Details Card */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Route Details</h2>
                    <div className="space-y-2">
                      <p className="text-gray-700">{busData.route || 'No route assigned'}</p>
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
                      {eta.expected && (
                        <div>
                          <p className="text-sm text-gray-600">Expected Time</p>
                          <p className="text-lg font-medium text-gray-900">
                            {formatTime(eta.expected)}
                          </p>
                        </div>
                      )}
                      {eta.actual && (
                        <div>
                          <p className="text-sm text-gray-600">Estimated Time</p>
                          <p className="text-lg font-medium text-blue-600">
                            {formatTime(eta.actual)}
                          </p>
                        </div>
                      )}
                      {delayInfo && (
                        <div>
                          <p className="text-sm text-gray-600">Delay Status</p>
                          <p
                            className={`text-lg font-medium ${
                              delayInfo.isDelayed
                                ? 'text-red-600'
                                : delayInfo.severity === 'early'
                                ? 'text-green-600'
                                : 'text-green-600'
                            }`}
                          >
                            {formatDelay(delayInfo.delayMinutes)}
                          </p>
                          {delayInfo.isDelayed && (
                            <button
                              onClick={viewDelayReason}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              View Delay Reason
                            </button>
                          )}
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
                      <h2 className="text-xl font-semibold text-gray-900">
                        Live Bus Location - {selectedStudent.name}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isTracking && busData.busNumber
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="text-sm text-gray-600">
                          {isTracking && busData.busNumber ? 'Live Tracking' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <BusSearch 
                        onBusSelect={handleBusSearchSelect}
                        selectedBusNumber={busData.busNumber}
                      />
                    </div>
                    {busData.busNumber ? (
                      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                        <MapComponent
                          busLocation={busLocation}
                          busNumber={busData.busNumber}
                          isLive={isTracking}
                          stops={busData.stops || []}
                        />
                      </div>
                    ) : (
                      <div className="h-96 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-300">
                        <p className="text-gray-500">No bus assigned to track. Use search above to find a bus.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ParentDashboard
