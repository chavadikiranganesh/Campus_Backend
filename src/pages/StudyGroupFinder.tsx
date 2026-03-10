import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface StudyGroup {
  id: number
  subject: string
  course: string
  semester: string
  size: number
  contact: string
  description: string
  members?: number[]
}

export function StudyGroupFinder() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState('')
  const [size, setSize] = useState(4)
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState(user?.email ?? '')
  const [joiningId, setJoiningId] = useState<number | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/study-groups`)
        if (res.ok) {
          const data = await res.json()
          setGroups(data)
        }
      } catch {
        setGroups([])
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  const joinGroup = async (id: number) => {
    if (!user?.id) return
    setJoiningId(id)
    try {
      const res = await fetch(`${API_BASE}/api/study-groups/${id}/join`, {
        method: 'POST',
        headers: { 'X-User-Id': String(user.id) },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to join group')
      setGroups((prev) => prev.map((g) => (g.id === id ? (data as StudyGroup) : g)))
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setJoiningId(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/study-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          course,
          semester,
          size,
          contact: contact || user?.email,
          description,
          userId: user?.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to create group')
      const created = await res.json()
      setGroups((prev) => [...prev, created])
      setSubject('')
      setCourse('')
      setSemester('')
      setSize(4)
      setDescription('')
      setContact(user?.email ?? '')
      setShowForm(false)
    } catch {
      setFormError('Could not create group. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = groups.filter((g) => {
    const matchQuery =
      !query.trim() ||
      g.subject.toLowerCase().includes(query.toLowerCase()) ||
      g.course.toLowerCase().includes(query.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(query.toLowerCase()))
    const matchCourse = !courseFilter.trim() || g.course.toLowerCase().includes(courseFilter.toLowerCase())
    return matchQuery && matchCourse
  })

  const courses = [...new Set(groups.map((g) => g.course).filter(Boolean))].sort()

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Study Group Finder
          </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find or create study groups by subject.
        </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          + Create group
        </button>
      </header>

      <section className="flex flex-wrap gap-2 sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by subject or description..."
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:max-w-xs"
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Create a study group</h2>
          <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="e.g. Data Structures"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.E. CSE"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. 3"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Max size</label>
              <input
                type="number"
                min={2}
                max={20}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What you'll cover, schedule, etc."
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
                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 dark:bg-violet-500"
              >
                {saving ? 'Creating…' : 'Create group'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <article
            key={g.id}
            className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 shadow-sm dark:border-violet-900/50 dark:bg-violet-950/20"
          >
            <h2 className="font-semibold text-slate-900 dark:text-slate-50">{g.subject}</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {g.course} · Sem {g.semester} · up to {g.size} members
            </p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{g.description}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Members: {(g.members?.length ?? 0)} / {g.size}
              </p>
              {user?.id && (
                <>
                  {g.members?.includes(user.id) ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                      Joined
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => joinGroup(g.id)}
                      disabled={joiningId === g.id || (g.members?.length ?? 0) >= g.size}
                      className="rounded-full bg-violet-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
                    >
                      {joiningId === g.id ? 'Joining…' : (g.members?.length ?? 0) >= g.size ? 'Full' : 'Join'}
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Contact: {g.contact}</p>
          </article>
        ))}
      </section>
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No groups match. Create one to get started.</p>
      )}
    </div>
  )
}
