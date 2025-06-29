import './admin.css'

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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">🔧 Admin Panel</h1>
            </div>
            <div className="text-sm text-gray-500">
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