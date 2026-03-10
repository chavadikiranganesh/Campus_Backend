import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../api'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setMessage('Password updated. You can log in now.')
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Invalid or missing reset link.</p>
          <Link to="/auth" className="mt-2 inline-block text-blue-600 dark:text-blue-400">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Set new password</h1>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700 dark:text-slate-300">Confirm</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {message && <p className={`text-sm ${message.includes('updated') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 dark:bg-blue-500"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/auth" className="text-blue-600 hover:underline dark:text-blue-400">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
