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
      new: 'bg-amber-100/70 text-amber-800 border-amber-200',
      pending: 'bg-blue-100/70 text-blue-800 border-blue-200',
      approved: 'bg-emerald-100/70 text-emerald-800 border-emerald-200',
      declined: 'bg-red-100/70 text-red-800 border-red-200'
    }

    const statusIcons = {
      new: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      pending: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      approved: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      declined: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm ${statusStyles[status] || 'bg-slate-100/70 text-slate-800 border-slate-200'}`}>
        <span className="mr-1.5">{statusIcons[status] || (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}</span>
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
        <div className="flex items-center text-emerald-600 bg-emerald-50/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200">
          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Sent</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col">
        <button
          onClick={() => sendWhatsAppApproval(registration.id)}
          disabled={isLoading || dailyLimitReached}
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md border ${
            dailyLimitReached
              ? 'bg-slate-100/70 text-slate-600 cursor-not-allowed border-slate-200'
              : isLoading
              ? 'bg-emerald-100/70 text-emerald-600 cursor-not-allowed border-emerald-200'
              : 'bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/70 border-emerald-200 backdrop-blur-sm'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
              Send WhatsApp
            </>
          )}
        </button>
        {error && (
          <div className="text-xs text-red-600 mt-1 max-w-48 bg-red-50/70 backdrop-blur-sm p-2 rounded border border-red-200">
            {error}
          </div>
        )}
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/50 overflow-hidden">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No registrations found</h3>
          <p className="text-slate-600">Registrations will appear here once users start signing up</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/50 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200/70">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Registrations</h2>
          </div>
          {dailyLimitReached && (
            <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 rounded-lg px-4 py-2">
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
        <table className="min-w-full divide-y divide-slate-200/50">
          <thead className="bg-slate-50/50 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                AI Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                WhatsApp Notification
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-slate-200/30">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-white/50 transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {registration.photo_url ? (
                        <img
                          src={registration.photo_url}
                          alt={registration.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(registration.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-slate-800">
                        {registration.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-800 font-medium">{registration.email}</div>
                  <div className="text-sm text-slate-600">{registration.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(registration.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAIScoreBadge(registration.score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                  {new Date(registration.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderWhatsAppButton(registration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewRegistration(registration.id)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(registration)}
                      className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-sm border-white/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Registration</h3>
              <div className="mb-6">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete the registration for <strong className="text-slate-800">{registrationToDelete.name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-all duration-200 shadow-md hover:shadow-lg"
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