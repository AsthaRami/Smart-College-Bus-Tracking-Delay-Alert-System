import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession, getUserData } from '../utils/auth'
import Header from '../components/Header'
import MapComponent from '../components/MapComponent'
import NotificationPopup from '../components/NotificationPopup'
import { fetchAllBusLocations, startRealTimeUpdates } from '../utils/realtimeUpdates'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [buses, setBuses] = useState([])
  const [selectedBus, setSelectedBus] = useState(null)
  const [showAddBusModal, setShowAddBusModal] = useState(false)
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [newBus, setNewBus] = useState({
    busNumber: '',
    route: '',
    capacity: '',
    type: 'Standard',
  })
  const [driverAssignment, setDriverAssignment] = useState({
    busNumber: '',
    driverId: '',
  })
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    target: 'all', // all, students, parents, drivers
  })

  useEffect(() => {
    // Check authentication
    const user = getUserData()
    if (!user || user.role !== 'Admin') {
      navigate('/login')
      return
    }
    setUserData(user)

    // Load all buses
    loadAllBuses()
  }, [])

  const loadAllBuses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/buses')
      // const data = await response.json()
      // setBuses(data.buses)

      // Mock data
      setBuses([
        {
          id: 1,
          busNumber: 'BUS-001',
          route: 'Route A: College → Station → Downtown',
          driver: { id: 1, name: 'John Doe' },
          status: 'On Route',
          location: { lat: 22.3081, lng: 73.2190 }, // KPGU Campus, Varnama, Vadodara
          capacity: 40,
          currentPassengers: 25,
        },
        {
          id: 2,
          busNumber: 'BUS-002',
          route: 'Route B: College → Mall → Airport',
          driver: { id: 2, name: 'Jane Smith' },
          status: 'Stopped',
          location: { lat: 28.6145, lng: 77.2095 },
          capacity: 40,
          currentPassengers: 0,
        },
        {
          id: 3,
          busNumber: 'BUS-003',
          route: 'Route C: College → Hospital → Park',
          driver: null,
          status: 'Not Assigned',
          location: null,
          capacity: 35,
          currentPassengers: 0,
        },
      ])
    } catch (error) {
      console.error('Error loading buses:', error)
    }
  }

  const handleAddBus = async () => {
    if (!newBus.busNumber || !newBus.route || !newBus.capacity) {
      addNotification({
        type: 'alert',
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
      })
      return
    }

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/admin/buses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newBus),
      // })

      addNotification({
        type: 'success',
        title: 'Bus Added',
        message: `Bus ${newBus.busNumber} has been added successfully.`,
      })

      setNewBus({ busNumber: '', route: '', capacity: '', type: 'Standard' })
      setShowAddBusModal(false)
      loadAllBuses()
    } catch (error) {
      console.error('Error adding bus:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: 'Failed to add bus. Please try again.',
      })
    }
  }

  const handleAssignDriver = async () => {
    if (!driverAssignment.busNumber || !driverAssignment.driverId) {
      addNotification({
        type: 'alert',
        title: 'Validation Error',
        message: 'Please select both bus and driver.',
      })
      return
    }

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/admin/assign-driver', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(driverAssignment),
      // })

      addNotification({
        type: 'success',
        title: 'Driver Assigned',
        message: `Driver has been assigned to ${driverAssignment.busNumber} successfully.`,
      })

      setDriverAssignment({ busNumber: '', driverId: '' })
      setShowAssignDriverModal(false)
      loadAllBuses()
    } catch (error) {
      console.error('Error assigning driver:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: 'Failed to assign driver. Please try again.',
      })
    }
  }

  const handleSendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) {
      addNotification({
        type: 'alert',
        title: 'Validation Error',
        message: 'Please fill in title and message.',
      })
      return
    }

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/admin/announcements', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(announcement),
      // })

      addNotification({
        type: 'success',
        title: 'Announcement Sent',
        message: 'Announcement has been sent successfully.',
      })

      setAnnouncement({ title: '', message: '', target: 'all' })
      setShowAnnouncementModal(false)
    } catch (error) {
      console.error('Error sending announcement:', error)
      addNotification({
        type: 'alert',
        title: 'Error',
        message: 'Failed to send announcement. Please try again.',
      })
    }
  }

  const viewDelayReports = () => {
    // TODO: Implement delay reports view
    alert('Delay Reports Feature - To be implemented with backend integration')
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

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Admin Dashboard"
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
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddBusModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            + Add Bus
          </button>
          <button
            onClick={() => setShowAssignDriverModal(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Assign Driver
          </button>
          <button
            onClick={viewDelayReports}
            className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
          >
            View Delay Reports
          </button>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
          >
            Send Announcement
          </button>
        </div>

        {/* Buses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedBus(bus)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-600">{bus.busNumber}</h3>
                  <p className="text-sm text-gray-600">{bus.route}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Driver:</span>{' '}
                  <span className="font-medium">
                    {bus.driver ? bus.driver.name : 'Not Assigned'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Capacity:</span>{' '}
                  <span className="font-medium">
                    {bus.currentPassengers}/{bus.capacity}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Bus Map View */}
        {selectedBus && selectedBus.location && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Live Location: {selectedBus.busNumber}
              </h2>
              <button
                onClick={() => setSelectedBus(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapComponent
                busLocation={selectedBus.location}
                busNumber={selectedBus.busNumber}
                isLive={selectedBus.status === 'On Route'}
              />
            </div>
          </div>
        )}
      </main>

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Bus</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Number *
                </label>
                <input
                  type="text"
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="BUS-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
                <input
                  type="text"
                  value={newBus.route}
                  onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Route A: College → Station"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={newBus.capacity}
                  onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newBus.type}
                  onChange={(e) => setNewBus({ ...newBus, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="AC">AC</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAddBus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Bus
              </button>
              <button
                onClick={() => setShowAddBusModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Driver to Bus</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bus *
                </label>
                <select
                  value={driverAssignment.busNumber}
                  onChange={(e) =>
                    setDriverAssignment({ ...driverAssignment, busNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.busNumber}>
                      {bus.busNumber} - {bus.route}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Driver *
                </label>
                <select
                  value={driverAssignment.driverId}
                  onChange={(e) =>
                    setDriverAssignment({ ...driverAssignment, driverId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  <option value="1">John Doe</option>
                  <option value="2">Jane Smith</option>
                  <option value="3">Mike Johnson</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAssignDriver}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign
              </button>
              <button
                onClick={() => setShowAssignDriverModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                  placeholder="Announcement message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  value={announcement.target}
                  onChange={(e) => setAnnouncement({ ...announcement, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="drivers">Drivers Only</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSendAnnouncement}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Send
              </button>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

