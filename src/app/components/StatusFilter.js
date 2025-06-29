import React from 'react'

const StatusFilter = ({ statusFilter, onStatusChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status', count: null },
    { value: 'new', label: 'New', count: null },
    { value: 'pending', label: 'Pending', count: null },
    { value: 'approved', label: 'Approved', count: null },
    { value: 'declined', label: 'Declined', count: null }
  ]

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="status-filter" className="text-sm font-medium text-gray-900 whitespace-nowrap">
        Filter by status:
      </label>
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="block pl-3 pr-10 py-2 text-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default StatusFilter 