import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { PaymentButton } from '../components/PaymentButton'
import { API_BASE } from '../api'

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
  imageUrl?: string
  description?: string
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
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [ownerName, setOwnerName] = useState(user?.name ?? '')
  const [ownerContact, setOwnerContact] = useState('')

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

    try {
      const payload = {
        title,
        category,
        course,
        semester,
        condition,
        type,
        price: type === 'Donation' ? 'Free' : price || '₹0',
        owner: ownerName || (user?.name ?? 'Anonymous'),
        ownerContact,
        imageUrl,
        description,
        userId: user?.id,
      }

      const response = await fetch(`${API_BASE}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save resource.')
      }

      const created: Material = await response.json()
      setItems((prev) => [...prev, created])

      setTitle('')
      setCourse('')
      setSemester('')
      setCondition('')
      setType('For Sale')
      setPrice('')
      setImageUrl('')
      setDescription('')
      setOwnerName(user?.name ?? '')
      setOwnerContact('')
      setView('browse')
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
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
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Item title</label>
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
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Condition</label>
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
                    Price {type === 'Donation' && '(will be shown as Free)'}
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
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Paste a link to the item photo"
                />
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
                  <label className="mb-1 block text-slate-700 dark:text-slate-300">Your name</label>
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
                    {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="hidden h-24 w-24 flex-shrink-0 rounded-xl object-cover sm:block"
                    />
                    ) : (
                    <div className="hidden h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-700 dark:text-slate-300 sm:flex">
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
                <div className="mt-3 flex items-center justify-end gap-2 text-xs sm:text-sm flex-wrap">
                  <button
                    type="button"
                    onClick={() => setDetails(item)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    View details
                  </button>
                  {item.type === 'For Sale' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const priceAmount = parseInt(item.price.replace(/[₹,]/g, '')) || 0
                          addToCart({
                            id: item.id,
                            title: item.title,
                            price: priceAmount,
                            category: item.category,
                            course: item.course,
                            owner: item.owner,
                          })
                          alert(`${item.title} added to cart!`)
                        }}
                        className="rounded-full border border-blue-500 bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      >
                        Add to Cart
                      </button>
                    </>
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
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
              role="dialog"
              aria-modal="true"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setDetails(null)
              }}
            >
              <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-700">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Resource details
                    </p>
                    <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                      {details.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {details.course} · Semester {details.semester}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetails(null)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-4 p-4 sm:grid-cols-[128px,1fr]">
                  <div className="h-32 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {details.imageUrl ? (
                      <img src={details.imageUrl} alt={details.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {details.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {details.condition}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          details.type === 'Donation'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                        }`}
                      >
                        {details.type === 'Donation' ? 'Donation' : `For sale · ${details.price}`}
                      </span>
                    </div>

                    {details.description && (
                      <p className="text-sm text-slate-700 dark:text-slate-200">{details.description}</p>
                    )}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-900 dark:text-slate-50">Seller</p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{details.owner}</p>
                      {details.ownerContact && (
                        <p className="mt-1 text-slate-600 dark:text-slate-300">Contact: {details.ownerContact}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700 flex-wrap">
                  {details.type === 'For Sale' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const priceAmount = parseInt(details.price.replace(/[₹,]/g, '')) || 0
                          addToCart({
                            id: details.id,
                            title: details.title,
                            price: priceAmount,
                            category: details.category,
                            course: details.course,
                            owner: details.owner,
                          })
                          setDetails(null)
                          alert(`${details.title} added to cart!`)
                        }}
                        className="rounded-full border border-blue-500 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      >
                        Add to Cart
                      </button>
                      <div className="w-auto">
                        <PaymentButton
                          amount={parseInt(details.price.replace(/[₹,]/g, '')) || 0}
                          description={`Purchase: ${details.title}`}
                          itemName={details.title}
                          onSuccess={() => {
                            setDetails(null)
                            alert('Payment successful!')
                          }}
                          onFailure={() => {}}
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetails(null)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

