import CryptoJS from 'crypto-js'

/**
 * Hash password using SHA-256
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString()
}

/**
 * Store user session/token in localStorage
 * @param {string} token - Authentication token
 * @param {object} userData - User data including role
 */
export const setSession = (token, userData) => {
  localStorage.setItem('authToken', token)
  localStorage.setItem('userData', JSON.stringify(userData))
}

/**
 * Get current session token
 * @returns {string|null} Authentication token
 */
export const getToken = () => {
  return localStorage.getItem('authToken')
}

/**
 * Get current user data
 * @returns {object|null} User data
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData')
  return userData ? JSON.parse(userData) : null
}

/**
 * Clear session/token
 */
export const clearSession = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userData')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getToken()
}

/**
 * Get redirect path based on user role
 * @param {string} role - User role (Student/Parent/Driver)
 * @returns {string} Redirect path
 */
export const getRoleRedirect = (role) => {
  const roleRoutes = {
    Student: '/student/dashboard',
    Parent: '/parent/dashboard',
    Driver: '/driver/dashboard',
    Staff: '/staff/dashboard',
    Admin: '/admin/dashboard',
  }
  return roleRoutes[role] || '/'
}

