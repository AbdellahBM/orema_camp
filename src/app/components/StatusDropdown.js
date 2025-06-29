import React from 'react'

const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' }
  ]

  const currentOption = statusOptions.find(option => option.value === currentStatus)

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentOption?.color || 'bg-gray-100 text-gray-800'}`}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default StatusDropdown 