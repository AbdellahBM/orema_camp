import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const AdminTable = ({ registrations, onViewRegistration, onDeleteRegistration, onRefreshRegistrations }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [registrationToDelete, setRegistrationToDelete] = useState(null)
  const [whatsappSending, setWhatsappSending] = useState({})
  const [whatsappErrors, setWhatsappErrors] = useState({})
  const [dailyLimitReached, setDailyLimitReached] = useState(false)
  const getStatusBadge = (status) => {
    const statusStyles = {
      new: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getAIScoreBadge = (score) => {
    if (!score && score !== 0) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-500">-</span>
        </div>
      )
    }

    // Calculate color based on score (green to blue gradient)
    // Score 0-100: hue from 120 (green) to 240 (blue)
    const hue = 120 + (score / 100) * 120 // 120 to 240
    const backgroundColor = `hsl(${hue}, 70%, 85%)`
    const textColor = `hsl(${hue}, 70%, 30%)`

    return (
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
        style={{ 
          backgroundColor: backgroundColor,
          color: textColor
        }}
      >
        <span className="text-sm font-bold">{score}</span>
      </div>
    )
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteClick = (registration) => {
    setRegistrationToDelete(registration)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (registrationToDelete && onDeleteRegistration) {
      onDeleteRegistration(registrationToDelete.id)
    }
    setShowDeleteModal(false)
    setRegistrationToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setRegistrationToDelete(null)
  }

  const sendWhatsAppApproval = async (registrationId) => {
    // Set sending state
    setWhatsappSending(prev => ({ ...prev, [registrationId]: true }))
    setWhatsappErrors(prev => ({ ...prev, [registrationId]: null }))

    try {
      // Get the current session to send the access token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setWhatsappErrors(prev => ({ 
          ...prev, 
          [registrationId]: 'Authentication required. Please refresh the page.' 
        }))
        return
      }

      const response = await fetch('/api/send-approval-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          registrationId,
          accessToken: session.access_token 
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Success - refresh registrations to update the UI
        setWhatsappErrors(prev => ({ ...prev, [registrationId]: null }))
        if (onRefreshRegistrations) {
          onRefreshRegistrations()
        }
      } else {
        if (result.error === 'limit_reached') {
          setDailyLimitReached(true)
          setWhatsappErrors(prev => ({ 
            ...prev, 
            [registrationId]: 'UltraMsg daily message limit reached. Please try again tomorrow!' 
          }))
        } else {
          setWhatsappErrors(prev => ({ 
            ...prev, 
            [registrationId]: result.error || 'Failed to send WhatsApp message' 
          }))
        }
      }
    } catch (error) {
      setWhatsappErrors(prev => ({ 
        ...prev, 
        [registrationId]: 'Network error. Please try again.' 
      }))
    } finally {
      setWhatsappSending(prev => ({ ...prev, [registrationId]: false }))
    }
  }

  const renderWhatsAppButton = (registration) => {
    if (registration.status !== 'approved') {
      return null
    }

    const isLoading = whatsappSending[registration.id]
    const error = whatsappErrors[registration.id]

    if (registration.approved_notified) {
      return (
        <div className="flex items-center text-green-600">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Approval Sent</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col">
        <button
          onClick={() => sendWhatsAppApproval(registration.id)}
          disabled={isLoading || dailyLimitReached}
          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            dailyLimitReached
              ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
              : isLoading
              ? 'bg-green-100 text-green-600 cursor-not-allowed'
              : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Send WhatsApp Approval
            </>
          )}
        </button>
        {error && (
          <div className="text-xs text-red-600 mt-1 max-w-48">
            {error}
          </div>
        )}
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
          <p className="mt-1 text-sm text-gray-700">Registrations will appear here once users start signing up</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Registrations</h2>
          {dailyLimitReached && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-700">
                  Daily WhatsApp message limit reached. Try again tomorrow.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                AI Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                WhatsApp Notification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {registration.photo_url ? (
                        <img
                          src={registration.photo_url}
                          alt={registration.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {getInitials(registration.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{registration.email}</div>
                  <div className="text-sm text-gray-700">{registration.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(registration.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAIScoreBadge(registration.score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {new Date(registration.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderWhatsAppButton(registration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewRegistration(registration.id)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteClick(registration)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && registrationToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Registration</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete the registration for <strong>{registrationToDelete.name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-4 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-600 text-white text-base font-medium rounded-md w-24 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTable 