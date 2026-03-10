import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:grid-cols-[1.4fr,1fr]">
      {/* Left – hero */}
      <div className="relative hidden overflow-hidden md:block">
        <img
          src="https://campusutility.netlify.app/images/ChatGPT%20Image%20Jan%2013,%202026,%2001_13_02%20PM.png"
          alt="Campus Utility"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-blue-900/60" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] text-blue-100 ring-1 ring-inset ring-blue-300/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Campus Utility Portal</span>
            </div>
            <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-50">
              One place for reusable resources and trusted accommodation around campus.
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-100/85">
              Sign in to manage your listings, discover affordable study materials, and explore
              verified PGs curated for your college.
            </p>
          </div>
          <div className="mt-8 space-y-3 text-xs text-slate-100/80">
            <p className="font-medium">Built for students and admins</p>
            <ul className="space-y-1 text-[11px]">
              <li>• Seniors can post items to sell or donate.</li>
              <li>• Students can browse resources and PGs in one place.</li>
              <li>• Admins control accommodation and listing quality.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right – auth card */}
      <div className="flex items-center justify-center px-4 py-8 md:px-8">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-900/80">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/40 dark:bg-blue-500">
              <span className="text-lg font-semibold">CU</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Campus Utility</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sign in or create an account to continue.
              </p>
            </div>
          </div>

          <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1 text-xs dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
                mode === 'login'
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
                mode === 'register'
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Minimum 6 characters"
              />
            </div>

            {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:disabled:bg-slate-600"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
            {mode === 'login' && (
              <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <Link to="/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400">Forgot password?</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

