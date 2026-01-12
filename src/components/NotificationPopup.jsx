import { useEffect, useState } from 'react'

const NotificationPopup = ({ notification, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose && notification) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(), 300) // Wait for fade out animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [notification, autoClose, duration, onClose])

  if (!notification || !isVisible) return null

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'delay':
        return '⏰'
      case 'alert':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'success':
        return '✅'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'delay':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800'
      case 'alert':
        return 'bg-red-50 border-red-400 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800'
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800'
      default:
        return 'bg-gray-50 border-gray-400 text-gray-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`max-w-md w-full rounded-lg shadow-lg border-l-4 p-4 ${getNotificationColor()}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 text-2xl">{getNotificationIcon()}</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium mb-1">{notification.title}</h3>
            <p className="text-sm">{notification.message}</p>
            {notification.details && (
              <p className="text-xs mt-2 opacity-75">{notification.details}</p>
            )}
            {notification.timestamp && (
              <p className="text-xs mt-1 opacity-60">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(), 300)
            }}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPopup

