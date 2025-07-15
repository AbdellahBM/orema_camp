import './admin.css'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Admin Panel',
  robots: 'noindex, nofollow'
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <div className="admin-container">
          {/* Admin-specific header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  {/* Return to Home Button */}
                  <Link 
                    href="/" 
                    className="flex items-center space-x-2 text-gray-600 hover:text-[#E19827] transition-colors duration-200 group"
                  >
                    <svg 
                      className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-all duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Return to Home</span>
                  </Link>
                  
                  {/* Separator */}
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  {/* Admin Panel Title */}
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 hidden sm:block">
                  Camp Registration Management System
                </div>
              </div>
            </div>
          </header>
          
          {/* Admin content wrapper */}
          <main className="admin-content max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
  );
} 