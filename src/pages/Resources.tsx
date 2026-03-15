import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { API_BASE } from '../api'
import { getImageUrl } from '../utils/imageUtils'
import { ResourceDetailsModal } from '../components/ResourceDetailsModal'

const categories = ['Book', 'Instrument', 'Calculator', 'Notes'] as const
const types = ['For Sale', 'Donation'] as const

interface Material {
  id: number
  title: string
  category: string
  course: string
  semester: string
  condition: string
  type: 'For Sale' | 'Donation'
  price: string
  owner: string
  ownerContact?: string
  image?: string
  description?: string
  postedByUserId?: number
}

type ViewMode = 'browse' | 'add'

export function Resources() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [view, setView] = useState<ViewMode>('browse')
  const [items, setItems] = useState<Material[]>([])
  const [details, setDetails] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<'All' | (typeof categories)[number]>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | (typeof types)[number]>('All')
  const [query, setQuery] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('Book')
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState('')
  const [condition, setCondition] = useState('')
  const [type, setType] = useState<(typeof types)[number]>('For Sale')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [ownerName, setOwnerName] = useState(user?.name ?? '')
  const [ownerContact, setOwnerContact] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Material | null>(null)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE}/api/materials`)
        if (!response.ok) {
          throw new Error('Failed to load materials from backend')
        }
        const data: Material[] = await response.json()
        setItems(data)
      } catch (err) {
        console.error(err)
        setError('Unable to reach backend. Please make sure the server is running.')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSaving(true)

    // Validation - Check required fields
    const requiredFields = [
      { value: title, name: 'Item title' },
      { value: price, name: 'Price' },
      { value: condition, name: 'Condition' },
      { value: ownerName, name: 'Contact name' },
      { value: imageFile, name: 'Image' }
    ]

    const missingFields = requiredFields.filter(({ value }) => !value)
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ name }) => name).join(', ')
      setFormError(`${fieldNames} ${missingFields.length === 1 ? 'is' : 'are'} required`)
      setSaving(false)
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('course', course)
      formData.append('semester', semester)
      formData.append('condition', condition)
      formData.append('type', type)
      formData.append('price', type === 'Donation' ? 'Free' : price || '₹0')
      formData.append('owner', ownerName || (user?.name ?? 'Anonymous'))
      formData.append('ownerContact', ownerContact)
      formData.append('description', description)
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`${API_BASE}/api/materials`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add material')
      }

      const newItem = await response.json()
      setItems(prev => [newItem, ...prev])
      setView('browse')
      
      // Reset form
      setTitle('')
      setCourse('')
      setSemester('')
      setCondition('')
      setDescription('')
      setPrice('')
      setOwnerContact('')
      setImageFile(null)
      setCategory('Book')
      setType('For Sale')
      setOwnerName(user?.name ?? '')
      
    } catch (err) {
      console.error(err)
      setFormError(err instanceof Error ? err.message : 'Failed to add material')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (material: Material) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/materials/${material.id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete resource')
      }

      setItems((prev) => prev.filter((item) => item.id !== material.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    }
  }

  const canDelete = (material: Material) => {
    if (!user) return false
    return user.role === 'admin' || material.postedByUserId === user.id
  }

  const handleAddToCart = (item: Material) => {
    if (item.type === 'Donation') {
      // Simple, reliable alert for donations
      window.alert(`🎁 Donation Available!\n\nItem: ${item.title}\nContact: ${item.owner}\n${item.ownerContact ? `Phone/Email: ${item.ownerContact}\n` : ''}Please reach out directly to arrange pickup/delivery.`)
      return
    }
    
    // Handle sale items
    const priceMatch = item.price.match(/(\d+)/)
    const price = priceMatch ? parseInt(priceMatch[1]) : 0
    
    addToCart({
      id: item.id,
      title: item.title,
      price: price,
      category: item.category,
      course: item.course,
      owner: item.owner,
    })
    
    window.alert(`✅ ${item.title} added to cart!`)
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
    const matchesType = typeFilter === 'All' || item.type === typeFilter
    const text = `${item.title} ${item.course} ${item.semester} ${item.owner}`.toLowerCase()
    const matchesQuery = !query.trim() || text.includes(query.toLowerCase())
    return matchesCategory && matchesType && matchesQuery
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Resources
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sell, donate, or browse study materials.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setView('browse')}
            className={`rounded-full px-3 py-1.5 font-medium ${
              view === 'browse'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Browse
          </button>
          <button
            type="button"
            onClick={() => setView('add')}
            className={`rounded-full px-3 py-1.5 font-medium ${
              view === 'add'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Add Resource
          </button>
        </div>
      </header>

      {view === 'add' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 sm:text-sm">
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Item title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="e.g. Engineering Mathematics – 3rd Sem"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="e.g. B.E. CSE"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="3"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as (typeof categories)[number])}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Like New / Good / Used"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as (typeof types)[number])}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Price {type === 'Donation' && '(will be shown as Free)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={type === 'Donation'}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
                    placeholder="e.g. ₹400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">
                  Image <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none file:mr-2 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:file:bg-blue-900/40 dark:file:text-blue-200"
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
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Short description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Mention highlights, usage, and any important details."
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">
                    Your name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Contact (phone / email)</label>
                  <input
                    type="text"
                    value={ownerContact}
                    onChange={(e) => setOwnerContact(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-rose-500 dark:text-rose-400">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setView('browse')}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  {saving ? 'Saving…' : 'Save resource'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {view === 'browse' && (
        <>
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as 'All' | (typeof categories)[number])
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="All">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as 'All' | (typeof types)[number])
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="All">Sale + Donation</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, course, semester, or seller..."
                className="mt-1 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
              />
            </div>
          </section>

          {loading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading resources from backend…</p>
          )}
          {error && !loading && <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>}

          <section className="grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-slate-900/60"
              >
                <div className="flex gap-3">
                    {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.title}
                      className="hidden h-24 w-24 flex-shrink-0 rounded-xl object-cover sm:block"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const noImageDiv = target.parentElement?.querySelector('.no-image-placeholder')
                        if (noImageDiv) {
                          (noImageDiv as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                    ) : (
                    <div className="hidden h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-700 dark:text-slate-300 sm:flex no-image-placeholder">
                      No image
                    </div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.course} • Semester {item.semester}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Category: {item.category} • Condition: {item.condition}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 dark:text-slate-300">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                      item.type === 'Donation'
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-200'
                        : 'bg-blue-500/10 border border-blue-500/40 text-blue-700 dark:text-blue-200'
                    }`}
                  >
                    {item.type === 'Donation' ? 'Donation' : `For Sale • ${item.price}`}
                  </span>
                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                    <p>Seller: {item.owner}</p>
                    {item.ownerContact && <p>Contact: {item.ownerContact}</p>}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDetails(item)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    View details
                  </button>
                  {item.type === 'For Sale' && (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="rounded-full bg-green-600 px-3 py-1 font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      Add to Cart
                    </button>
                  )}
                  {item.type === 'Donation' && (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="rounded-full bg-emerald-600 px-3 py-1 font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors"
                    >
                      🎁 Contact for Donation
                    </button>
                  )}
                  {canDelete(item) && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(item)}
                      className="rounded-full bg-rose-500 px-3 py-1 font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}

            {!loading && filteredItems.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No resources match your filters yet. Try changing the filters or add a new resource.
              </p>
            )}
          </section>

          {details && (
            <ResourceDetailsModal item={details} onClose={() => setDetails(null)} />
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
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Resource</h3>
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
        </>
      )}
    </div>
  )
}

