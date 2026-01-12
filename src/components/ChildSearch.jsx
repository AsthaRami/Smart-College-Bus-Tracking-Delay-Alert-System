import { useState, useEffect } from 'react'

/**
 * Child Search Component for Parent Dashboard
 * Allows parents to search for children by name or bus number
 */
const ChildSearch = ({ children = [], onChildSelect, selectedChildId = null }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChildren, setFilteredChildren] = useState(children)

  useEffect(() => {
    // Update filtered children when children list changes
    if (searchTerm.trim() === '') {
      setFilteredChildren(children)
    } else {
      const searchLower = searchTerm.toLowerCase().trim()
      const filtered = children.filter(child => {
        const nameMatch = child.name?.toLowerCase().includes(searchLower)
        const busMatch = child.busNumber?.toLowerCase().includes(searchLower)
        return nameMatch || busMatch
      })
      setFilteredChildren(filtered)
    }
  }, [searchTerm, children])

  const handleSelect = (child) => {
    if (onChildSelect) {
      onChildSelect(child)
    }
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by child name or bus number..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results List */}
      {filteredChildren.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              onClick={() => handleSelect(child)}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                selectedChildId === child.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{child.name}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    {child.busNumber && (
                      <span>Bus: <span className="font-medium">{child.busNumber}</span></span>
                    )}
                    {child.route && (
                      <span>Route: <span className="font-medium">{child.route}</span></span>
                    )}
                    {child.status && (
                      <span className={`font-medium ${
                        child.status === 'On Route' ? 'text-green-600' :
                        child.status === 'Stopped' ? 'text-gray-600' :
                        'text-yellow-600'
                      }`}>
                        {child.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <button className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchTerm.trim() !== '' ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No children found matching "{searchTerm}"
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          No children available
        </div>
      )}

      {/* Selected Child Info */}
      {selectedChildId && filteredChildren.find(c => c.id === selectedChildId) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Selected: {filteredChildren.find(c => c.id === selectedChildId)?.name}
          </p>
        </div>
      )}
    </div>
  )
}

export default ChildSearch
