/**
 * Notification System Utilities
 * Handles Push Notifications, SMS, and Email notifications
 */

/**
 * Send push notification (using Web Push API)
 * @param {object} notification - Notification object
 * @returns {Promise<void>}
 */
export const sendPushNotification = async (notification) => {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification')
      return
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/bus-icon.png', // Add your icon path
        badge: '/bus-icon.png',
        tag: notification.busNumber || 'bus-tracking',
        requireInteraction: notification.important || false,
      })
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

/**
 * Send SMS notification (requires backend API)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message
 * @returns {Promise<object>} API response
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        phoneNumber,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send SMS')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending SMS:', error)
    throw error
  }
}

/**
 * Send email notification (requires backend API)
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise<object>} API response
 */
export const sendEmail = async (email, subject, message) => {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        email,
        subject,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

/**
 * Send multi-channel notification
 * @param {object} notification - Notification object
 * @param {Array<string>} channels - Channels to use: ['push', 'sms', 'email']
 * @param {object} recipients - Recipient information
 * @returns {Promise<void>}
 */
export const sendMultiChannelNotification = async (
  notification,
  channels = ['push'],
  recipients = {}
) => {
  const promises = []

  // Push notification
  if (channels.includes('push')) {
    promises.push(sendPushNotification(notification))
  }

  // SMS notification
  if (channels.includes('sms') && recipients.phoneNumber) {
    promises.push(
      sendSMS(recipients.phoneNumber, `${notification.title}: ${notification.message}`)
    )
  }

  // Email notification
  if (channels.includes('email') && recipients.email) {
    promises.push(
      sendEmail(
        recipients.email,
        notification.title,
        notification.message + (notification.details ? `\n\nDetails: ${notification.details}` : '')
      )
    )
  }

  try {
    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error in multi-channel notification:', error)
  }
}

/**
 * Request notification permission
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

