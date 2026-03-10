import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
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
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
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
  const notifRef = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
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
    { to: '/resources', label: 'Resources' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/accommodation', label: 'Accommodation' },
    { to: '/lost-found', label: 'Lost & Found' },
    { to: '/events', label: 'Events' },
    { to: '/study-groups', label: 'Study Groups' },
    { to: '/profile', label: 'Profile' },
    { to: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/40 dark:bg-blue-500">
              <span className="text-lg font-semibold">CU</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Campus Utility
              </div>
              <div className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">Smart reuse &amp; student support</div>
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
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-16 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {searching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">Searching…</span>
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

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <p className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">Notifications</p>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto">
                      {notifications.slice().reverse().slice(0, 10).map((n) => (
                        <li key={n.id} className="border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-700">
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

          {/* Profile */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
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
                        className="w-full px-3 py-2 text-left text-sm text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-slate-700"
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
                      className="w-full px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.slice(0, 6).map(({ to, label }) => (
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
          </nav>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${linkBase} hidden lg:inline-flex ${
                  isActive ? 'bg-amber-600 text-white dark:bg-amber-500' : 'text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-800'
                }`
              }
            >
              Admin
            </NavLink>
          )}
          {user && (
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
            >
              Logout
            </button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
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
