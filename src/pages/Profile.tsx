import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface Listings {
  materials: { id: number; title: string; type?: string }[]
  lostFound: { id: number; title: string; type?: string }[]
  studyGroups: { id: number; subject: string }[]
}

export function Profile() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const f = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/me/listings`, {
          headers: { 'X-User-Id': String(user.id) },
        })
        if (res.ok) {
          const data = await res.json()
          setListings(data)
        }
      } finally {
        setLoading(false)
      }
    }
    f()
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your account and listings.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Account</h2>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Name</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{user.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Role</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50">{user.role}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">My listings</h2>
        {loading && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
        {!loading && listings && (
          <div className="mt-2 space-y-2 text-sm">
            <p>Materials: {listings.materials.length} · Lost &amp; Found: {listings.lostFound.length} · Study groups: {listings.studyGroups.length}</p>
            {listings.materials.length > 0 && (
              <ul className="list-inside list-disc text-slate-600 dark:text-slate-400">
                {listings.materials.map((m) => (
                  <li key={m.id}>{m.title}</li>
                ))}
              </ul>
            )}
            {listings.lostFound.length > 0 && (
              <ul className="list-inside list-disc text-slate-600 dark:text-slate-400">
                {listings.lostFound.map((l) => (
                  <li key={l.id}>{l.title} ({l.type})</li>
                ))}
              </ul>
            )}
            {listings.studyGroups.length > 0 && (
              <ul className="list-inside list-disc text-slate-600 dark:text-slate-400">
                {listings.studyGroups.map((g) => (
                  <li key={g.id}>{g.subject}</li>
                ))}
              </ul>
            )}
            {listings.materials.length === 0 && listings.lostFound.length === 0 && listings.studyGroups.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400">No listings yet. Add from Resources, Lost &amp; Found, or Study Groups.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
