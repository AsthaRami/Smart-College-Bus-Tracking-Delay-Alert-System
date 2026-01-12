import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import TrackBusPage from './pages/TrackBusPage'
import StudentDashboard from './pages/StudentDashboard'
import ParentDashboard from './pages/ParentDashboard'
import DriverDashboard from './pages/DriverDashboard'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track-bus" element={<TrackBusPage />} />

        {/* Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute requiredRole="Driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent Dashboard */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute requiredRole="Parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        {/* Staff Dashboard */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute requiredRole="Staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

