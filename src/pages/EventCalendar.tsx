import { useEffect, useState } from 'react'
import { API_BASE } from '../api'
import { useAuth } from '../context/AuthContext'

interface EventItem {
  id: number
  title: string
  date: string
  time: string
  venue: string
  description: string
}

export function EventCalendar() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [monthView, setMonthView] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [description, setDescription] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<EventItem | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/events`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const addEvent = async () => {
    if (user?.role !== 'admin') return
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(user.id) },
        body: JSON.stringify({ title, date, time, venue, description }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to add event')
      setEvents((prev) => [...prev, data as EventItem])
      setTitle('')
      setDate('')
      setTime('')
      setVenue('')
      setDescription('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (event: EventItem) => {
    if (user?.role !== 'admin') return
    setDeletingId(event.id)
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to delete event')
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
      setDeleteConfirm(null)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const [y, m] = monthView.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDay = new Date(y, m, 0)
  const startPad = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const calendarDays: (number | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const eventsByDate: Record<string, EventItem[]> = {}
  events.forEach((ev) => {
    const key = ev.date
    if (!eventsByDate[key]) eventsByDate[key] = []
    eventsByDate[key].push(ev)
  })

  const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })

  const goPrev = () => {
    const [yy, mm] = monthView.split('-').map(Number)
    if (mm === 1) setMonthView(`${yy - 1}-12`)
    else setMonthView(`${yy}-${String(mm - 1).padStart(2, '0')}`)
  }
  const goNext = () => {
    const [yy, mm] = monthView.split('-').map(Number)
    if (mm === 12) setMonthView(`${yy + 1}-01`)
    else setMonthView(`${yy}-${String(mm + 1).padStart(2, '0')}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          Event Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Campus events and workshops. {user?.role === 'admin' ? 'Admin can manage events below.' : ''}
        </p>
      </header>

      {user?.role === 'admin' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin: Add event</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Hackathon 2026"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Time</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. 10:00 AM"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Venue</label>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Auditorium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Short details for students"
              />
            </div>
            {error && <p className="text-xs text-rose-500 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={addEvent}
                disabled={saving || !title.trim() || !date.trim()}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                {saving ? 'Saving…' : 'Add event'}
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{monthName}</h2>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1 font-medium text-slate-500 dark:text-slate-400">
              {d}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />
            const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = eventsByDate[dateKey] || []
            return (
              <div
                key={dateKey}
                className={`min-h-14 rounded-lg border p-1 ${
                  dayEvents.length
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <span className="text-slate-700 dark:text-slate-300">{day}</span>
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="mt-0.5 truncate rounded bg-blue-200/80 px-1 text-[10px] text-blue-900 dark:bg-blue-900/50 dark:text-blue-100"
                    title={ev.title}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">+{dayEvents.length - 2}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading events…</p>}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">Upcoming events</h2>
        <ul className="space-y-3">
          {events
            .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((ev) => (
              <li
                key={ev.id}
                className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-50">{ev.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ev.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>📅 {ev.date}</span>
                  {ev.time && <span>🕐 {ev.time}</span>}
                  {ev.venue && <span>📍 {ev.venue}</span>}
                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(ev)}
                      disabled={deletingId === ev.id}
                      className="ml-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
        {!loading && events.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No events yet. Check back later.</p>
        )}
      </section>

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                  <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Event</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvent(deleteConfirm)}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  {deletingId === deleteConfirm.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
