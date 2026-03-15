import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import { getLostFoundImageUrl } from '../utils/imageUtils'

interface LostFoundItem {
  id: number
  type: 'lost' | 'found'
  title: string
  description: string
  location: string
  contact: string
  createdAt: string
  postedByUserId?: number
  image?: string
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<LostFoundItem | null>(null)
  const [editItem, setEditItem] = useState<LostFoundItem | null>(null)

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
    
    if (!user) {
      setFormError('Please log in to post items.')
      return
    }
    
    // Validation - Check required fields
    const requiredFields = [
      { value: title, name: 'Title' },
      { value: location, name: 'Location' },
      { value: contact, name: 'Contact' },
      { value: imageFile, name: 'Image' }
    ]

    const missingFields = requiredFields.filter(({ value }) => !value)
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ name }) => name).join(', ')
      setFormError(`${fieldNames} ${missingFields.length === 1 ? 'is' : 'are'} required`)
      return
    }
    
    setSaving(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('type', type)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('location', location)
      formData.append('contact', contact || user?.email)
      formData.append('postedByUserId', String(user?.id || ''))
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await fetch(`${API_BASE}/api/lost-found`, {
        method: 'POST',
        headers: user ? { 'X-User-Id': String(user.id) } : {},
        body: formData,
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to post')
      }
      const created = await res.json()
      setItems((prev) => [...prev, created])
      setTitle('')
      setDescription('')
      setLocation('')
      setContact(user?.email ?? '')
      setImageFile(null)
      setShowForm(false)
    } catch (error) {
      console.error('Lost & Found post error:', error)
      setFormError((error as Error).message || 'Could not post. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: LostFoundItem) => {
    setEditItem(item)
    setTitle(item.title)
    setType(item.type)
    setDescription(item.description)
    setLocation(item.location)
    setContact(item.contact)
    setImageFile(null)
    setShowForm(true)
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!editItem || !user) return

    setFormError(null)
    setSaving(true)
    
    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('location', location)
      formData.append('contact', contact || user?.email)
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await fetch(`${API_BASE}/api/lost-found/${editItem.id}`, {
        method: 'PUT',
        headers: { 'x-user-id': String(user.id) },
        body: formData,
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update')
      }
      
      const updated = await res.json()
      setItems((prev) => prev.map(item => item.id === editItem.id ? updated : item))
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Lost & Found update error:', error)
      setFormError((error as Error).message || 'Could not update. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setLocation('')
    setContact(user?.email ?? '')
    setImageFile(null)
    setEditItem(null)
    setFormError(null)
  }

  const handleDelete = async (item: LostFoundItem) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/lost-found/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': String(user.id) },
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to delete item')
        } else {
          const errorText = await response.text()
          throw new Error(`Server error: ${response.status} - ${errorText}`)
        }
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    }
  }

  const canEdit = (item: LostFoundItem) => {
    if (!user) {
      console.log('LostAndFound canEdit: No user logged in')
      return false
    }
    
    // Handle different data types and null values
    const itemUserId = item.postedByUserId
    const currentUserId = user.id
    
    // Convert both to numbers for comparison, handle null/undefined
    const itemUserIdNum = itemUserId != null ? Number(itemUserId) : null
    const currentUserIdNum = currentUserId != null ? Number(currentUserId) : null
    
    const isAdmin = user.role === 'admin'
    const isOwner = itemUserIdNum !== null && itemUserIdNum === currentUserIdNum
    
    console.log('LostAndFound canEdit check:', {
      userId: currentUserId,
      itemPostedBy: itemUserId,
      itemUserIdNum,
      currentUserIdNum,
      userRole: user.role,
      isAdmin,
      isOwner,
      canEditResult: isAdmin || isOwner
    })
    
    return isAdmin || isOwner
  }

  const canDelete = (item: LostFoundItem) => {
    if (!user) {
      console.log('LostAndFound canDelete: No user logged in')
      return false
    }
    
    // Handle different data types and null values
    const itemUserId = item.postedByUserId
    const currentUserId = user.id
    
    // Convert both to numbers for comparison, handle null/undefined
    const itemUserIdNum = itemUserId != null ? Number(itemUserId) : null
    const currentUserIdNum = currentUserId != null ? Number(currentUserId) : null
    
    const isAdmin = user.role === 'admin'
    const isOwner = itemUserIdNum !== null && itemUserIdNum === currentUserIdNum
    
    console.log('LostAndFound canDelete check:', {
      userId: currentUserId,
      itemPostedBy: itemUserId,
      itemUserIdNum,
      currentUserIdNum,
      isAdmin,
      isOwner,
      canDeleteResult: isAdmin || isOwner
    })
    
    return isAdmin || isOwner
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
          onClick={() => { setShowForm(true); resetForm(); }}
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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {editItem ? 'Edit Lost or Found Item' : 'Report Lost or Found'}
          </h2>
          <form onSubmit={editItem ? handleUpdate : handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
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
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Title <span className="text-rose-500">*</span>
              </label>
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
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where lost/found"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Your contact <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or phone"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Image <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-2 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:file:bg-blue-900/40 dark:file:text-blue-200"
              />
              {imageFile ? (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selected: {imageFile.name}
                  </p>
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Image is required
                </p>
              )}
            </div>
            {formError && <p className="text-xs text-rose-500 sm:col-span-2">{formError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50 dark:bg-amber-500"
              >
                {saving ? (editItem ? 'Updating…' : 'Posting…') : (editItem ? 'Update' : 'Post')}
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
            {item.image ? (
              <img
                src={getLostFoundImageUrl(item.image)}
                alt={item.title}
                className="mb-2 h-32 w-full rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="mb-2 h-32 w-full rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                No image
              </div>
            )}
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
            <div className="mt-3 flex justify-end gap-2">
              {canEdit(item) && (
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  Edit
                </button>
              )}
              {canDelete(item) && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(item)}
                  className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No items match. Try changing filters or add a new report.</p>
      )}

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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Item</h3>
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
