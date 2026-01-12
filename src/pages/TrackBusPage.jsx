import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapComponent from '../components/MapComponent'
import BusSearch from '../components/BusSearch'
import Header from '../components/Header'

const TrackBusPage = () => {
  const navigate = useNavigate()
  const [selectedBus, setSelectedBus] = useState(null)
  const [busLocation, setBusLocation] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleBusSearch = (bus) => {
    setSelectedBus(bus)
    if (bus.location) {
      setBusLocation(bus.location)
    } else {
      setBusLocation(null)
    }
  }

  useEffect(() => {
    // Auto-update location if bus is selected and location exists
    if (selectedBus && selectedBus.status === 'On Route') {
      const interval = setInterval(async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
          const response = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(selectedBus.bus_number)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.bus && data.bus.location) {
              setBusLocation(data.bus.location)
              setSelectedBus(prev => ({ ...prev, ...data.bus }))
            }
          }
        } catch (error) {
          console.error('Error updating bus location:', error)
        }
      }, 10000) // Update every 10 seconds

      return () => clearInterval(interval)
    }
  }, [selectedBus])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <Header 
        title="Track Bus"
        showBackButton={true}
        backTo="/"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🚌</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Track KPGU Bus
            </h2>
            <p className="text-gray-600">
              Search for a KPGU college bus by number to view its real-time location
            </p>
          </div>

          {/* Bus Search */}
          <div className="mb-6">
            <BusSearch onBusSelect={handleBusSearch} />
          </div>

          {/* Map */}
          <div className="mb-6">
            {selectedBus ? (
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
                <div className="text-center p-4">
                  <p className="text-gray-600 mb-2">Search for a bus to view its location</p>
                  <p className="text-sm text-gray-500">Enter a bus number in the search box above</p>
                </div>
              </div>
            )}
          </div>

          {/* Bus Info Cards */}
          {selectedBus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bus Number</p>
                <p className="text-xl font-bold text-gray-900">{selectedBus.bus_number}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-xl font-bold ${
                  selectedBus.status === 'On Route' ? 'text-green-600' :
                  selectedBus.status === 'Stopped' ? 'text-gray-600' :
                  'text-yellow-600'
                }`}>
                  {selectedBus.status || 'Unknown'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Driver</p>
                <p className="text-xl font-bold text-gray-900">{selectedBus.driver_name || 'Not Assigned'}</p>
              </div>
            </div>
          )}

          {/* Route Info */}
          {selectedBus && selectedBus.route && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Route</h3>
              <p className="text-gray-700">{selectedBus.route}</p>
            </div>
          )}

          {/* Delay Info */}
          {selectedBus && selectedBus.delay && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Delay Alert</h3>
              <p className="text-yellow-800">{selectedBus.delay.reason}</p>
              {selectedBus.delay.minutes > 0 && (
                <p className="text-sm text-yellow-700 mt-1">
                  Estimated delay: {selectedBus.delay.minutes} minutes
                </p>
              )}
            </div>
          )}

          {/* Sign up / Login Prompt */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-gray-600 mb-4">
              Want to track your assigned bus automatically?{' '}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TrackBusPage
