import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface UserRow {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  lastLoginAt: string | null
}

interface Activity {
  user: UserRow
  logins: { userId: number; at: string }[]
  materials: unknown[]
  lostFound: unknown[]
  studyGroups: unknown[]
}

export function Admin() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') return
    const f = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: { 'X-User-Id': String(user.id) },
        })
        if (!res.ok) throw new Error('Failed to load users')
        const data = await res.json()
        setUsers(data)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    f()
  }, [user])

  const loadActivity = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/activity`, {
        headers: { 'X-User-Id': String(user?.id) },
      })
      if (!res.ok) return
      const data = await res.json()
      setActivity(data)
    } catch {
      setActivity(null)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Remove this user? Their listings will remain.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user?.id) },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setUsers((prev) => prev.filter((u) => u.id !== id))
      if (activity?.user.id === id) setActivity(null)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">Admin access only.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Manage users</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View activity and remove users if needed.</p>
      </header>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">ID</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Name</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Email</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Role</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Last login</th>
              <th className="p-3 font-medium text-slate-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => loadActivity(u.id)}
                    className="mr-2 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Activity
                  </button>
                  {u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => deleteUser(u.id)}
                      disabled={deletingId === u.id}
                      className="text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400"
                    >
                      {deletingId === u.id ? '…' : 'Delete'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activity && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-50">
              Activity: {activity.user.name} ({activity.user.email})
            </h2>
            <button
              type="button"
              onClick={() => setActivity(null)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <h3 className="mb-1 font-medium text-slate-700 dark:text-slate-300">Logins ({activity.logins.length})</h3>
              <ul className="max-h-32 overflow-y-auto rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
                {activity.logins.slice(-10).reverse().map((l, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(l.at).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-slate-700 dark:text-slate-300">Listings</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Materials: {activity.materials.length} · Lost &amp; Found: {activity.lostFound.length} · Study groups: {activity.studyGroups.length}
              </p>
              {activity.materials.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-slate-600 dark:text-slate-400">
                  {(activity.materials as { title?: string }[]).slice(0, 5).map((m, i) => (
                    <li key={i}>{m.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
