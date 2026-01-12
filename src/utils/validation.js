/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate mobile number (10 digits)
 * @param {string} mobile - Mobile number
 * @returns {boolean} True if valid
 */
export const validateMobile = (mobile) => {
  const mobileRegex = /^[0-9]{10}$/
  return mobileRegex.test(mobile.replace(/\D/g, ''))
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    }
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    }
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    }
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    }
  }
  
  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate name (at least 2 characters, letters only)
 * @param {string} name - Name
 * @returns {boolean} True if valid
 */
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/
  return nameRegex.test(name.trim())
}

/**
 * Check if passwords match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {boolean} True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

