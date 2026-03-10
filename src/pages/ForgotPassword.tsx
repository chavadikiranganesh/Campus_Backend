import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../api'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; demoLink?: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage({ text: data.message, demoLink: data.demoResetLink })
    } catch {
      setMessage({ text: 'Request failed. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your email to get a reset link.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="you@college.edu"
            />
          </div>
          {message && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message.text}
              {message.demoLink && (
                <Link to={message.demoLink} className="ml-1 text-blue-600 underline dark:text-blue-400">
                  Open reset link
                </Link>
              )}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 dark:bg-blue-500"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/auth" className="text-blue-600 hover:underline dark:text-blue-400">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
