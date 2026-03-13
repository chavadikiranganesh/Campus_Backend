import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const
const years = ['1st', '2nd', '3rd', 'Final'] as const
const departments = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Biomedical', 'IT'] as const

interface BloodDonor {
  id: number
  fullName: string
  department: string
  year: string
  bloodGroup: string
  phoneNumber: string
  lastDonationDate?: string
  createdBy: number
  createdAt: string
}

export function MedicalHelp() {
  const { user } = useAuth()
  const [donors, setDonors] = useState<BloodDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState<'All' | (typeof bloodGroups)[number]>('All')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<BloodDonor | null>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState<(typeof departments)[number]>('CSE')
  const [year, setYear] = useState<(typeof years)[number]>('1st')
  const [bloodGroup, setBloodGroup] = useState<(typeof bloodGroups)[number]>('O+')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [lastDonationDate, setLastDonationDate] = useState('')

  useEffect(() => {
    fetchDonors()
  }, [search, bloodGroupFilter])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (bloodGroupFilter !== 'All') params.append('bloodGroup', bloodGroupFilter)
      
      const response = await fetch(`${API_BASE}/api/medical-help?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load donors from backend')
      }
      const data: BloodDonor[] = await response.json()
      setDonors(data)
    } catch (err) {
      console.error(err)
      setError('Unable to reach backend. Please make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSaving(true)

    try {
      const payload = {
        fullName,
        department,
        year,
        bloodGroup,
        phoneNumber,
        lastDonationDate: lastDonationDate || null,
      }

      const response = await fetch(`${API_BASE}/api/medical-help`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': String(user?.id)
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save donor information.')
      }

      const created: BloodDonor = await response.json()
      setDonors((prev) => [created, ...prev])
      
      // Reset form
      setFullName('')
      setDepartment('CSE')
      setYear('1st')
      setBloodGroup('O+')
      setPhoneNumber('')
      setLastDonationDate('')
      setShowForm(false)
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (donor: BloodDonor) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/medical-help/${donor.id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete donor')
      }

      setDonors((prev) => prev.filter((d) => d.id !== donor.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    }
  }

  const canDelete = (donor: BloodDonor) => {
    if (!user) return false
    return user.role === 'admin' || donor.createdBy === user.id
  }

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Medical Help
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Blood donor directory - find and volunteer donors.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Total donors: {donors.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
        >
          + Add Donor
        </button>
      </header>

      {/* Search and Filters */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {(['All', ...bloodGroups] as const).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setBloodGroupFilter(group)}
                className={`rounded-full px-3 py-1.5 font-medium ${
                  bloodGroupFilter === group
                    ? 'bg-red-600 text-white dark:bg-red-500'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Add Donor Form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Add Blood Donor</h2>
          <form onSubmit={handleSubmit} className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as (typeof departments)[number])}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Year *</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as (typeof years)[number])}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} Year
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Blood Group *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as (typeof bloodGroups)[number])}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                maxLength={10}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="10-digit phone number"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Last Donation Date (optional)</label>
              <input
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            {formError && <p className="text-xs text-rose-500 dark:text-rose-400 md:col-span-2">{formError}</p>}
            <div className="mt-2 flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
              >
                {saving ? 'Saving…' : 'Save Donor'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Donors List */}
      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading donors...</p>
      )}
      {error && !loading && <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {donors.map((donor) => (
          <article
            key={donor.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-slate-900/60"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                    {donor.fullName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {donor.department} • {donor.year} Year
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800 dark:bg-red-900/40 dark:text-red-200">
                  {donor.bloodGroup}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Phone:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      {donor.phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCall(donor.phoneNumber)}
                      className="rounded-full bg-green-500 px-2 py-1 text-[10px] font-medium text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      Call
                    </button>
                  </div>
                </div>
                
                {donor.lastDonationDate && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Last Donation:</p>
                    <span className="text-xs text-slate-900 dark:text-slate-100">
                      {donor.lastDonationDate}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Added:</p>
                  <span className="text-xs text-slate-900 dark:text-slate-100">
                    {donor.createdAt}
                  </span>
                </div>
              </div>
            </div>
            
            {canDelete(donor) && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(donor)}
                  className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}

        {!loading && donors.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
            No donors found. Add a new donor to get started.
          </p>
        )}
      </section>

      {/* Delete Confirmation Modal */}
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Donor</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete "{deleteConfirm.fullName}"? This action cannot be undone.
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
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
