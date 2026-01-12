/**
 * Delay Detection and Alert System
 */

/**
 * Calculate delay in minutes
 * @param {Date} expectedTime - Expected arrival time
 * @param {Date} actualTime - Actual/Current time
 * @returns {number} Delay in minutes (negative if early, positive if delayed)
 */
export const calculateDelay = (expectedTime, actualTime = new Date()) => {
  const expected = new Date(expectedTime)
  const actual = new Date(actualTime)
  const diffMs = actual - expected
  return Math.round(diffMs / (1000 * 60)) // Convert to minutes
}

/**
 * Check if bus is delayed
 * @param {Date} expectedTime - Expected arrival time
 * @param {Date} actualTime - Actual/Current time
 * @param {number} thresholdMinutes - Delay threshold in minutes (default: 5)
 * @returns {object} Delay status with isDelayed, delayMinutes, and severity
 */
export const checkDelay = (expectedTime, actualTime = new Date(), thresholdMinutes = 5) => {
  const delayMinutes = calculateDelay(expectedTime, actualTime)
  const isDelayed = delayMinutes > thresholdMinutes

  let severity = 'none'
  if (delayMinutes > 30) {
    severity = 'critical'
  } else if (delayMinutes > 15) {
    severity = 'high'
  } else if (delayMinutes > thresholdMinutes) {
    severity = 'medium'
  } else if (delayMinutes < -5) {
    severity = 'early' // Bus is early
  }

  return {
    isDelayed,
    delayMinutes,
    severity,
    expectedTime: new Date(expectedTime),
    actualTime: new Date(actualTime),
  }
}

/**
 * Generate delay notification
 * @param {object} delayInfo - Delay information from checkDelay
 * @param {string} busNumber - Bus number
 * @param {string} reason - Delay reason (optional)
 * @returns {object} Notification object
 */
export const generateDelayNotification = (delayInfo, busNumber, reason = null) => {
  const { isDelayed, delayMinutes, severity } = delayInfo

  if (!isDelayed && severity !== 'early') {
    return null
  }

  let title = ''
  let message = ''
  let type = 'info'

  if (severity === 'early') {
    title = 'Bus Running Early'
    message = `Bus ${busNumber} is ${Math.abs(delayMinutes)} minutes early.`
    type = 'info'
  } else if (severity === 'critical') {
    title = 'Critical Delay Alert'
    message = `Bus ${busNumber} is delayed by ${delayMinutes} minutes.`
    type = 'alert'
  } else if (severity === 'high') {
    title = 'Significant Delay'
    message = `Bus ${busNumber} is delayed by ${delayMinutes} minutes.`
    type = 'delay'
  } else {
    title = 'Minor Delay'
    message = `Bus ${busNumber} is delayed by ${delayMinutes} minutes.`
    type = 'delay'
  }

  if (reason) {
    message += ` Reason: ${reason}`
  }

  return {
    type,
    title,
    message,
    details: reason || 'No reason provided',
    timestamp: new Date().toISOString(),
    busNumber,
    delayMinutes,
    severity,
  }
}

/**
 * Format time for display
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format delay message
 * @param {number} delayMinutes - Delay in minutes
 * @returns {string} Formatted delay message
 */
export const formatDelay = (delayMinutes) => {
  if (delayMinutes < 0) {
    return `${Math.abs(delayMinutes)} min early`
  } else if (delayMinutes === 0) {
    return 'On time'
  } else {
    return `${delayMinutes} min late`
  }
}

