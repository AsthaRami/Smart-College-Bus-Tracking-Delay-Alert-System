import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUserData } from '../utils/auth'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated or doesn't have required role
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuth = isAuthenticated()
  const userData = getUserData()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userData?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const roleRoutes = {
      Student: '/student/dashboard',
      Parent: '/parent/dashboard',
      Driver: '/driver/dashboard',
      Staff: '/staff/dashboard',
      Admin: '/admin/dashboard',
    }
    const redirectPath = roleRoutes[userData?.role] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute

