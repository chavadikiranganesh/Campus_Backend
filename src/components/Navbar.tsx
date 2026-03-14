import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { API_BASE } from '../api'

const linkBase =
  'inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4'

interface SearchResult {
  materials: { id: number; title: string; course?: string }[]
  accommodations: { id: number; name: string }[]
  lostFound: { id: number; title: string; type: string }[]
  events: { id: number; title: string; date: string }[]
  studyGroups: { id: number; subject: string; course?: string }[]
}

export function Navbar() {
  const { user, logout } = useAuth()
  const { resolved, setTheme } = useTheme()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(0)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setSearchOpen(false)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
          setSearchOpen(true)
        }
      } catch {
        setSearchResults(null)
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const totalResults =
    searchResults
      ? searchResults.materials.length +
        searchResults.accommodations.length +
        searchResults.lostFound.length +
        searchResults.events.length +
        searchResults.studyGroups.length
      : 0

  const [notifications, setNotifications] = useState<{ id: number; title: string; body: string; at: string }[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.id) return
    const f = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notifications`, { headers: { 'X-User-Id': String(user.id) } })
        if (res.ok) {
          const data = await res.json()
          setNotifications(Array.isArray(data) ? data : [])
        }
      } catch {
        setNotifications([])
      }
    }
    f()
    const t = setInterval(f, 60000)
    return () => clearInterval(t)
  }, [user?.id])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials =
    user?.name
      ?.split(' ')
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'

  const navLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/chat', label: 'AI Chat' },
  ]

  const servicesLinks = [
    { to: '/resources', label: 'Resources' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/accommodation', label: 'Accommodation' },
    { to: '/lost-found', label: 'Lost & Found' },
    { to: '/events', label: 'Events' },
    { to: '/study-groups', label: 'Study Groups' },
    { to: '/medical-help', label: 'Medical Help' },
    { to: '/chat', label: 'AI Chat' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/40 dark:bg-blue-500">
              <span className="text-lg font-bold">CU</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Campus Utility</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Smart campus solutions</div>
            </div>
          </NavLink>
        </div>

        {/* Desktop: search */}
        <div
          className="relative hidden flex-1 px-2 md:flex md:min-w-[13rem] md:max-w-sm lg:max-w-md"
          ref={searchRef}
        >
          <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            🔎
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials, events, PGs..."
            className="search-bar w-full pl-12"
          />
          {searching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">Searching…</span>
          )}
          {searchOpen && searchResults && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
              {totalResults === 0 ? (
                <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No results</p>
              ) : (
                <div className="p-2">
                  {searchResults.materials.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Materials
                      </p>
                      {searchResults.materials.slice(0, 3).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            navigate('/marketplace')
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {m.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.accommodations.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Accommodation
                      </p>
                      {searchResults.accommodations.slice(0, 2).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            navigate('/accommodation')
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.events.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Events
                      </p>
                      {searchResults.events.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => {
                            navigate('/events')
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {e.title} · {e.date}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.lostFound.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Lost &amp; Found
                      </p>
                      {searchResults.lostFound.slice(0, 2).map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            navigate('/lost-found')
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {l.title} ({l.type})
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.studyGroups.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Study Groups
                      </p>
                      {searchResults.studyGroups.slice(0, 2).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            navigate('/study-groups')
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          {g.subject} {g.course && `· ${g.course}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200"
            title={resolved === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {resolved === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Notifications */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label="Notifications"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <p className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Notifications</p>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto">
                      {notifications.slice().reverse().slice(0, 10).map((n, index) => (
                        <li key={n.id || `notif-${index}`} className="border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-700">
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-50">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{n.body || new Date(n.at).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          {user && (
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Shopping cart"
            >
              🛒
              {cart.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                  {cart.length > 9 ? '9+' : cart.length}
                </span>
              )}
            </button>
          )}

          {/* Profile */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="profile-button"
                aria-label="User menu"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white dark:bg-blue-500">
                  {initials}
                </span>
                <span className="hidden max-w-[10rem] truncate text-xs font-medium sm:inline">
                  {user.name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile')
                        setProfileOpen(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Profile
                    </button>
                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/admin')
                          setProfileOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-slate-700"
                      >
                        Admin
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setProfileOpen(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          
          {/* Services Dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              onClick={() => setServicesOpen((o) => !o)}
              className={`${linkBase} flex items-center gap-1 ${
                servicesOpen
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              Services
              <svg className="h-3 w-3 transition-transform duration-200" style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {servicesOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div className="py-1">
                  {servicesLinks.map(({ to, label }) => (
                    <button
                      key={to}
                      type="button"
                      onClick={() => {
                        navigate(to)
                        setServicesOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="mb-3 md:hidden">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 px-4 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <nav className="flex flex-col gap-1">
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-amber-600 text-white dark:bg-amber-500' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {servicesLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
