import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)

  // Load Google Identity Services script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        console.log('Google script already loaded')
        setGoogleScriptLoaded(true)
        return
      }

      console.log('Loading Google Identity Services script...')
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google Identity Services script loaded successfully')
        setGoogleScriptLoaded(true)
      }
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services script:', error)
        setError('Failed to load Google authentication. Please try again later.')
      }
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    loadGoogleScript()
  }, [])

  const handleGoogleSignIn = async () => {
    alert('Google sign-in clicked!')
    console.log('=== Google OAuth Debug ===')
    console.log('Client ID:', GOOGLE_CLIENT_ID)
    console.log('Script loaded:', googleScriptLoaded)
    console.log('Window object:', typeof window)
    console.log('Window.google:', !!window.google)
    
    if (GOOGLE_CLIENT_ID === 'your-google-client-id') {
      alert('Using mock Google sign-in (no real Client ID)')
      setError(null)
      setLoading(true)
      try {
        const mockGoogleUser = {
          id: 999,
          name: 'Google User',
          email: 'google.user@gmail.com',
          role: 'user'
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        localStorage.setItem('campus-utility-user', JSON.stringify(mockGoogleUser))
        
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError('Google sign-in failed. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }
    
    if (!googleScriptLoaded) {
      alert('Google script still loading...')
      setError('Google authentication is loading. Please wait...')
      return
    }

    if (!window.google) {
      alert('window.google not available')
      setError('Google authentication is not available. Please try again later.')
      return
    }
    
    alert('Initializing real Google OAuth...')
    console.log('Initializing real Google OAuth')

    try {
      setError(null)
      setLoading(true)
      
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          console.log('Google OAuth response:', response)
          alert('Google OAuth successful!')
          
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]))
            
            const googleUser = {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              role: 'user',
              avatar: payload.picture
            }

            localStorage.setItem('campus-utility-user', JSON.stringify(googleUser))
            
            navigate('/dashboard', { replace: true })
          } catch (error) {
            console.error('Google auth callback error:', error)
            setError('Failed to authenticate with Google. Please try again.')
          } finally {
            setLoading(false)
          }
        }
      })

      window.google.accounts.id.prompt()
      
    } catch (error) {
      console.error('Google sign-in error:', error)
      alert('Google OAuth error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setError('Google sign-in failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/dashboard', { replace: true })
      } else {
        await register(name, email, password)
        // Registration successful - switch to login mode
        setMode('login')
        setSuccess('Registration successful! Please login with your credentials.')
        // Show success message and clear form
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex fade-in">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-100 via-emerald-50 to-indigo-100 items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
              <span className="text-3xl font-bold text-blue-600">CU</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Campus Utility</h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-700 mb-8">Your all-in-one portal for SVCE students.</p>

          {/* Description */}
          <p className="text-slate-600 mb-12 leading-relaxed">
            Connect, share, and thrive with your campus community. Access resources, find verified accommodations, 
            join study groups, and get emergency medical support — all in one place.
          </p>

          {/* Feature List */}
          <div className="grid gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                📚
              </div>
              <span className="text-slate-800 font-medium">Resource Sharing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                🏠
              </div>
              <span className="text-slate-800 font-medium">Verified Accommodation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white">
                👥
              </div>
              <span className="text-slate-800 font-medium">Study Groups</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                🔍
              </div>
              <span className="text-slate-800 font-medium">Lost & Found</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                🏥
              </div>
              <span className="text-slate-800 font-medium">Medical Help (Blood Donors)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Login using your SVCE email address.</p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1 text-sm w-full">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="scale-in">
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="modern-input w-full"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div className={mode === 'register' ? 'scale-in' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="modern-input w-full"
                placeholder="your.email@svce.edu.in"
              />
            </div>
            
            <div className={mode === 'register' ? 'scale-in' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="modern-input w-full"
                placeholder="Minimum 6 characters"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 fade-in">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:scale-105 active:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Please wait…
                </span>
              ) : (
                mode === 'login' ? 'Sign In to Campus Utility' : 'Create Your Account'
              )}
            </button>

            {mode === 'login' && (
              <div className="text-center">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !googleScriptLoaded}
            className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={!googleScriptLoaded ? 'Loading Google authentication...' : 'Continue with Google'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-slate-700 font-medium">
              {loading ? 'Signing in...' : (!googleScriptLoaded ? 'Loading...' : 'Continue with Google')}
            </span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-slate-600">
              {mode === 'login' ? 'New to Campus Utility?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

