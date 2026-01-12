import { useState } from 'react'

/**
 * Bus Search Component
 * Allows users to search for a bus by number and display its location
 */
const BusSearch = ({ onBusSelect, selectedBusNumber = '' }) => {
  const [searchTerm, setSearchTerm] = useState(selectedBusNumber)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/bus/search.php?bus_number=${encodeURIComponent(searchTerm.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.bus) {
          setSearchResults([data.bus])
          if (onBusSelect) {
            onBusSelect(data.bus)
          }
        } else {
          setSearchResults([])
          // Show error message if bus not found
          if (data.message) {
            alert(`Bus not found: ${data.message}`)
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setSearchResults([])
        alert(errorData.message || 'Bus not found. Please check the bus number.')
      }
    } catch (error) {
      console.error('Error searching bus:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter bus number (e.g., BUS-001)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSearching || !searchTerm.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {searchResults.length > 0 && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Found: {searchResults[0].bus_number} - {searchResults[0].status || 'Status Unknown'}
          </p>
        </div>
      )}
    </div>
  )
}

export default BusSearch
