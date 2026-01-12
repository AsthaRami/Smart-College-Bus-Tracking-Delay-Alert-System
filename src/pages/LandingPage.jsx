import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const LandingPage = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  const handleTrackBus = () => {
    navigate('/track-bus')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <Header 
        title="KPGU Smart Bus Tracking System"
        subtitle="Drs. Kiran & Pallavi Patel Global University, Vadodara"
      />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Project Name */}
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Smart College Bus Tracking & Delay Alert System
          </h1>
          
          {/* KPGU Badge */}
          <div className="mb-6 inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold">
            For KPGU College Bus
          </div>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Track your KPGU college bus in real-time, get live updates on bus location,
            arrival times, and never miss your ride again. Available for Students,
            Parents, and Drivers at Drs. Kiran & Pallavi Patel Global University, Vadodara.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleLogin}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Login
            </button>

            <button
              onClick={handleSignup}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
            >
              Sign Up
            </button>

            <button
              onClick={handleTrackBus}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Track Bus (Demo)
            </button>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600">
                Get live location updates of your bus on the map
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Arrival Times
              </h3>
              <p className="text-gray-600">
                Know exactly when your bus will arrive at your stop
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Notifications
              </h3>
              <p className="text-gray-600">
                Receive alerts about delays and route changes
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-400">
            © 2026 KPGU Smart Bus Tracking System. All rights reserved.
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            Drs. Kiran & Pallavi Patel Global University (KPGU), Vadodara
          </p>
          <p className="text-center text-gray-500 text-xs mt-1">
            Krishna Education Campus, Varnama, Vadodara-Mumbai NH8, Gujarat 391243
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

