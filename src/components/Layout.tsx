import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/dashboard')
    }
  }

  const showBackButton = location.pathname !== '/dashboard'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="relative flex-1 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ← Back
            </button>
          )}
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

