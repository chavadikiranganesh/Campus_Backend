import { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '../context/AuthContext'
import { Chatbot } from './chatbot/Chatbot'

export function Layout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)

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

        {/* Floating chatbot launcher */}
        <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
          {chatOpen && (
            <div className="pointer-events-auto mb-2 w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/80">
              <Chatbot />
            </div>
          )}
          <button
            type="button"
            onClick={() => setChatOpen((prev) => !prev)}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg shadow-blue-500/40 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
            aria-label="Open chatbot"
          >
            💬
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

