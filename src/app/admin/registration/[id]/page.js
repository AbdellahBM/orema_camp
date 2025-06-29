'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'

const ADMIN_EMAILS = [
  "khouloud@orema.com",
  "youssef@orema.com",
  "salman@orema.com"
]

export default function RegistrationDetailPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editData, setEditData] = useState({})

  const router = useRouter()
  const params = useParams()
  const registrationId = params.id

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && isAdminUser(user.email) && registrationId) {
      fetchRegistration()
    }
  }, [user, registrationId])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setError('Error checking authentication')
    } finally {
      setLoading(false)
    }
  }

  const isAdminUser = (email) => {
    return ADMIN_EMAILS.includes(email)
  }

  const fetchRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (error) throw error
      
      setRegistration(data)
      setEditData(data)
    } catch (error) {
      setError('Error fetching registration: ' + error.message)
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('registrations')
        .update(editData)
        .eq('id', registrationId)

      if (error) throw error

      setRegistration(editData)
      setIsEditing(false)
      setError('')
    } catch (error) {
      setError('Error saving changes: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId)

      if (error) throw error

      router.push('/admin')
    } catch (error) {
      setError('Error deleting registration: ' + error.message)
      setShowDeleteModal(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus })
        .eq('id', registrationId)

      if (error) throw error

      setRegistration(prev => ({ ...prev, status: newStatus }))
      setEditData(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      setError('Error updating status: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdminUser(user.email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You are not authorized to access this page.</p>
          <button
            onClick={() => router.push('/admin')}
            className="text-brand-600 hover:text-brand-800"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Found</h1>
          <p className="text-gray-600 mb-4">The registration you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      new: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Registration Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditData(registration)
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="relative px-6 py-8 overflow-hidden">
            {/* Background Image with Blur */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/poster.jpg)',
                filter: 'blur(0.5px)',
                transform: 'scale(1.1)' // Prevent blur edges
              }}
            ></div>
            {/* Glassy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/70 via-secondary-600/60 to-brand-700/70 backdrop-blur-sm"></div>
            {/* Content */}
            <div className="relative z-10">
            <div className="flex items-center space-x-6">
              {/* Profile Photo or Avatar */}
              <div className="flex-shrink-0">
                {registration.photo_url ? (
                  <img
                    src={registration.photo_url}
                    alt={registration.name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-2xl font-bold text-brand-600">
                      {getInitials(registration.name)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 font-bold"
                    />
                  ) : (
                    <span className="text-white drop-shadow-lg">{registration.name}</span>
                  )}
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={registration.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="new" className="text-gray-900">New</option>
                    <option value="pending" className="text-gray-900">Pending</option>
                    <option value="approved" className="text-gray-900">Approved</option>
                    <option value="declined" className="text-gray-900">Declined</option>
                  </select>
                  <span className="text-white/80 text-sm">
                    Registered: {new Date(registration.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-600"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-600"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.phone || <span className="text-gray-600 italic">Not provided</span>}</p>
                  )}
                </div>
              </div>

              {/* Registration Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Registration Details
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                  <div>{getStatusBadge(registration.status)}</div>
                </div>

                <div>
                                      <label className="block text-sm font-medium text-gray-900 mb-1">Registration Date</label>
                  <p className="text-gray-900">{new Date(registration.created_at).toLocaleString()}</p>
                </div>

                {registration.updated_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Last Updated</label>
                    <p className="text-gray-900">{new Date(registration.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Additional Information
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.extra_info || ''}
                  onChange={(e) => handleInputChange('extra_info', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-600"
                  placeholder="Additional information..."
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {registration.extra_info || <span className="text-gray-600 italic">No additional information provided.</span>}
                </p>
              )}
            </div>

            {/* Photo Section */}
            {registration.photo_url && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Profile Photo
                </h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={registration.photo_url}
                    alt={registration.name}
                    className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                  />
                  <a
                    href={registration.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-800 underline"
                  >
                    View Full Size Photo
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
} 