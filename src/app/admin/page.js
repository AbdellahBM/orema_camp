'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import AdminTable from '../components/AdminTable'
import SearchBar from '../components/SearchBar'
import StatusFilter from '../components/StatusFilter'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ADMIN_EMAILS = [
  "khouloud@orema.com",
  "youssef@orema.com",
  "salman@orema.com"
]

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [error, setError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        if (isAdminUser(session.user.email)) {
          fetchRegistrations()
        }
      } else {
        setUser(null)
        setRegistrations([])
        setFilteredRegistrations([])
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        if (isAdminUser(session.user.email)) {
          await fetchRegistrations()
        }
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error

      if (!isAdminUser(loginData.email)) {
        await supabase.auth.signOut()
        throw new Error('Access denied. You are not authorized to access this admin panel.')
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setRegistrations([])
      setFilteredRegistrations([])
    } catch (error) {
      setError('Error signing out')
    }
  }

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      setError('Error fetching registrations: ' + error.message)
    }
  }

  const filterRegistrations = () => {
    let filtered = registrations

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const exportApprovedToPDF = async () => {
    setIsExporting(true)
    try {
      const approvedRegistrations = registrations.filter(reg => reg.status === 'approved')
      
      if (approvedRegistrations.length === 0) {
        setError('No approved registrations to export')
        return
      }

      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Approved Camp Registrations', 20, 20)
      
      // Add date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      
      // Prepare table data
      const tableData = approvedRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone || 'N/A',
        reg.extra_info || 'N/A',
        new Date(reg.created_at).toLocaleDateString()
      ])

      // Add table
      autoTable(doc, {
        startY: 45,
        head: [['Name', 'Email', 'Phone', 'Additional Info', 'Registration Date']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 50 },
          4: { cellWidth: 25 }
        }
      })

      // Save the PDF
      doc.save(`approved-registrations-${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      setError('Error exporting PDF: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleViewRegistration = (id) => {
    router.push(`/admin/registration/${id}`)
  }

  const handleDeleteRegistration = async (id) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setRegistrations(prev => prev.filter(reg => reg.id !== id))
      setError('')
    } catch (error) {
      setError('Error deleting registration: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    )
  }

  // Login Form
  if (!user || !isAdminUser(user.email)) {
    return (
      <div className="admin-container flex items-center justify-center">
        <div className="max-w-md w-full admin-form">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🏕️ Admin Panel</h1>
            <p className="text-gray-800 mt-2">Sign in to access the dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="admin-form-group">
              <label htmlFor="email" className="admin-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="admin-form-input"
                placeholder="Enter your admin email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password" className="admin-form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="admin-form-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full admin-btn admin-btn-primary py-3"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏕️ Camp Admin Dashboard</h1>
              <p className="text-gray-800">Welcome, {user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportApprovedToPDF}
                disabled={isExporting}
                className="admin-btn admin-btn-success flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    📄 Export Approved (PDF)
                  </>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="admin-btn admin-btn-danger"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Registrations</h3>
            <p className="text-3xl font-bold text-blue-600">{registrations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">New</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {registrations.filter(r => r.status === 'new').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Approved</h3>
            <p className="text-3xl font-bold text-green-600">
              {registrations.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Declined</h3>
            <p className="text-3xl font-bold text-red-600">
              {registrations.filter(r => r.status === 'declined').length}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <StatusFilter 
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Registrations Table */}
        <AdminTable 
          registrations={currentItems}
          onViewRegistration={handleViewRegistration}
          onDeleteRegistration={handleDeleteRegistration}
          onRefreshRegistrations={fetchRegistrations}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow mt-8">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-900">
                  Showing{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredRegistrations.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{filteredRegistrations.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 