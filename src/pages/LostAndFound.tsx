import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface LostFoundItem {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string
  location: string
  contact: string
  createdAt: string
}

export function LostAndFound() {
  const { user } = useAuth()
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'lost' | 'found'>('found')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState(user?.email ?? '')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/lost-found`)
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        }
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/lost-found`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          location,
          contact: contact || user?.email,
          userId: user?.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to post')
      const created = await res.json()
      setItems((prev) => [...prev, created])
      setTitle('')
      setDescription('')
      setLocation('')
      setContact(user?.email ?? '')
      setShowForm(false)
    } catch {
      setFormError('Could not post. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchFilter = filter === 'all' || item.type === filter
    const matchQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.location.toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Lost &amp; Found
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Report lost or found items.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400"
        >
          + Report item
        </button>
      </header>

      <section className="flex flex-wrap gap-2 sm:flex-row sm:items-center">
        <div className="flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {(['all', 'lost', 'found'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                filter === f
                  ? 'bg-amber-600 text-white dark:bg-amber-500'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, description, location..."
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:max-w-xs"
        />
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Report Lost or Found</h2>
          <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'lost' | 'found')}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Blue water bottle"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief description of the item"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where lost/found"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Your contact</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            {formError && <p className="text-xs text-rose-500 sm:col-span-2">{formError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50 dark:bg-amber-500"
              >
                {saving ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 shadow-sm ${
              item.type === 'lost'
                ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
            }`}
          >
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                item.type === 'lost'
                  ? 'bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                  : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
              }`}
            >
              {item.type}
            </span>
            <h2 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{item.title}</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-500">
              📍 {item.location} · {item.createdAt}
            </p>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">Contact: {item.contact}</p>
          </article>
        ))}
      </section>
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No items match. Try changing filters or add a new report.</p>
      )}
    </div>
  )
}
