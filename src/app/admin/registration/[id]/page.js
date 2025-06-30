'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import { 
  niveauScolaireOptions, 
  orgStatusOptions, 
  mapBooleanToArabic,
  getArabicStatusDisplay
} from '../../../../lib/formHelpers'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-700 font-medium">Loading registration details...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdminUser(user.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You are not authorized to access this page.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Registration Not Found</h1>
          <p className="text-slate-600 mb-6">The registration you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Basic Information
                  </h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">البريد الإلكتروني</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.phone || <span className="text-gray-600 italic">غير مقدم</span>}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">العمر</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.age || ''}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.age ? `${registration.age} سنة` : <span className="text-gray-600 italic">غير مقدم</span>}</p>
                  )}
                </div>
              </div>

              {/* Educational Information */}
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Educational Information
                  </h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">المستوى الدراسي</label>
                  {isEditing ? (
                    <select
                      value={editData.niveau_scolaire || ''}
                      onChange={(e) => handleInputChange('niveau_scolaire', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">اختر المستوى</option>
                      {niveauScolaireOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{registration.niveau_scolaire || <span className="text-gray-600 italic">غير مقدم</span>}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">المؤسسة التعليمية</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.school || ''}
                      onChange={(e) => handleInputChange('school', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    />
                  ) : (
                    <p className="text-gray-900">{registration.school || <span className="text-gray-600 italic">غير مقدم</span>}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Organization Information
                  </h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">الحالة التنظيمية</label>
                  {isEditing ? (
                    <select
                      value={editData.org_status || ''}
                      onChange={(e) => handleInputChange('org_status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">اختر الحالة</option>
                      {orgStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{registration.org_status || <span className="text-gray-600 italic">غير مقدم</span>}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">المشاركة في مخيمات سابقة</label>
                  <p className="text-gray-900">
                    {registration.previous_camps !== null && registration.previous_camps !== undefined ? 
                      mapBooleanToArabic(registration.previous_camps) : 
                      <span className="text-gray-600 italic">غير مقدم</span>
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">القدرة على دفع 350 درهم</label>
                  <p className="text-gray-900">
                    {registration.can_pay_350dh !== null && registration.can_pay_350dh !== undefined ? 
                      mapBooleanToArabic(registration.can_pay_350dh) : 
                      <span className="text-gray-600 italic">غير مقدم</span>
                    }
                  </p>
                </div>
              </div>

              {/* Registration System Details */}
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Registration System Details
                  </h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">الحالة</label>
                  <div>{getStatusBadge(registration.status)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">تاريخ التسجيل</label>
                  <p className="text-gray-900">{new Date(registration.created_at).toLocaleString('ar-MA')}</p>
                </div>

                {registration.updated_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">آخر تحديث</label>
                    <p className="text-gray-900">{new Date(registration.updated_at).toLocaleString('ar-MA')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center">
                <span className="mr-2">💬</span>
                المعلومات الإضافية
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camp Expectation */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">توقعات المخيم</label>
                  {isEditing ? (
                    <textarea
                      value={editData.camp_expectation || ''}
                      onChange={(e) => handleInputChange('camp_expectation', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                      placeholder="توقعات المشارك من المخيم..."
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {registration.camp_expectation || <span className="text-gray-600 italic">غير مقدم</span>}
                    </p>
                  )}
                </div>

                {/* Extra Info (Health/Special requests) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">معلومات صحية وطلبات خاصة</label>
                  {isEditing ? (
                    <textarea
                      value={editData.extra_info || ''}
                      onChange={(e) => handleInputChange('extra_info', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900"
                      placeholder="معلومات صحية أو طلبات خاصة..."
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {registration.extra_info || <span className="text-gray-600 italic">غير مقدم</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Scoring Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-white/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Participant Scoring / تقييم الذكاء الاصطناعي
              </h3>
              
              {/* Score Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">النتيجة / Score</label>
                {registration.score ? (
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-3xl shadow-lg ${
                      registration.score >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                      registration.score >= 60 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {registration.score}/100
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl ${
                        registration.score >= 80 ? 'text-green-600' :
                        registration.score >= 60 ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {registration.score >= 80 ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ) : registration.score >= 60 ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-semibold text-lg ${
                        registration.score >= 80 ? 'text-green-700' :
                        registration.score >= 60 ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {registration.score >= 80 ? 'ممتاز (Excellent)' :
                         registration.score >= 60 ? 'جيد (Good)' :
                         'يحتاج مراجعة (Needs Review)'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <span className="text-gray-500 italic flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      لم يتم التقييم بعد / Not scored yet
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar Visualization */}
              {registration.score && (
                <div className="mb-6">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(registration.score, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>ضعيف/Poor (0-40)</span>
                    <span>متوسط/Average (40-70)</span>
                    <span>ممتاز/Excellent (70-100)</span>
                  </div>
                </div>
              )}
              
              {/* Score Explanation */}
              {registration.score_explanation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">شرح التقييم / Score Explanation</label>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {registration.score_explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No Explanation Message */}
              {registration.score && !registration.score_explanation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">شرح التقييم / Score Explanation</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <span className="text-gray-500 italic flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      لا يوجد شرح متاح للتقييم / No explanation available for this score
                    </span>
                  </div>
                </div>
              )}
              
              {/* AI Scoring Criteria */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-blue-900">معايير التقييم / AI Scoring Criteria</div>
                    <div className="text-sm text-blue-700 mt-1">
                      الدافعية والاهتمام (30%) • التعليم والعمر (25%) • القدرة المالية والالتزام (20%) • الخبرة السابقة (15%) • التوقعات الواضحة (10%)
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Motivation (30%) • Education/Age (25%) • Financial Capacity (20%) • Experience (15%) • Expectations (10%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            {registration.photo_url && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  الصورة الشخصية / Profile Photo
                </h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={registration.photo_url}
                    alt={registration.name}
                    className="h-32 w-32 rounded-lg object-cover border border-gray-200 shadow-md"
                  />
                  <a
                    href={registration.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-800 underline flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    عرض الصورة بالحجم الكامل / View full size
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