import { useNavigate } from 'react-router-dom'

/**
 * Header Component with KPGU Logo
 * Reusable header for all pages with logo on the left
 */
const Header = ({ title, subtitle, showBackButton = false, backTo = '/', rightActions = null }) => {
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center gap-4">
            {/* KPGU Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/kpgu-logo.png" 
                alt="KPGU Logo" 
                className="h-14 w-auto object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            
            {/* Title and Subtitle */}
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => navigate(backTo)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Home
              </button>
            )}
            {rightActions}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
