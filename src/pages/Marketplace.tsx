import { useEffect, useState } from 'react'
import { API_BASE } from '../api'
import { useCart } from '../context/CartContext'
import { PaymentButton } from '../components/PaymentButton'

const sampleItems = [
  {
    id: 1,
    title: 'Engineering Mathematics – 3rd Sem',
    category: 'Book',
    course: 'B.E. CSE',
    semester: '3',
    condition: 'Like New',
    type: 'For Sale',
    price: '₹350',
    owner: 'Final Year – CSE',
  },
  {
    id: 2,
    title: 'Digital Logic Design Lab Kit',
    category: 'Instrument',
    course: 'B.E. ECE',
    semester: '4',
    condition: 'Good',
    type: 'Donation',
    price: 'Free',
    owner: 'Alumni – 2024 Batch',
  },
  {
    id: 3,
    title: 'Scientific Calculator FX-991ES',
    category: 'Calculator',
    course: 'B.E. Mechanical',
    semester: '2',
    condition: 'Very Good',
    type: 'For Sale',
    price: '₹500',
    owner: '3rd Year – Mech',
  },
  {
    id: 4,
    title: 'Data Structures Notes (PDF + Printed)',
    category: 'Notes',
    course: 'B.E. CSE',
    semester: '4',
    condition: 'Handwritten + Printed',
    type: 'Donation',
    price: 'Free',
    owner: 'Final Year – CSE',
  },
] as const

const categories = ['All', 'Book', 'Instrument', 'Calculator', 'Notes'] as const
const types = ['All', 'For Sale', 'Donation'] as const

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
}

export function Marketplace() {
  const { addToCart } = useCart()
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [type, setType] = useState<(typeof types)[number]>('All')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        // Fallback to static sample data so the page still works in demos
        setItems(sampleItems as unknown as Material[])
        setError('Using local sample data because the backend is not reachable.')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const matchesType = type === 'All' || item.type === type
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.course.toLowerCase().includes(query.toLowerCase()) ||
      item.semester.toLowerCase().includes(query.toLowerCase())

    return matchesCategory && matchesType && matchesQuery
  })

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          Study Materials Marketplace
        </h1>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Books, instruments, calculators, notes — buy or get free.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as (typeof types)[number])}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 sm:max-w-xs">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, course, semester..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </section>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading study materials…</p>
      )}
      {error && !loading && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          // Extract amount from price string (e.g., "₹350" -> 350)
          const amountStr = item.price.replace(/[₹,]/g, '').trim()
          const amount = parseInt(amountStr) || 0
          const isFreeItem = item.price === 'Free' || amount === 0

          return (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.course} · Semester {item.semester}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.category} · {item.condition}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                    item.type === 'Donation'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                  }`}
                >
                  {item.type === 'Donation' ? 'Donation' : `Sale · ${item.price}`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.owner}
                </span>
              </div>

              {/* Payment Button for items sold */}
              {item.type === 'For Sale' && !isFreeItem && (
                <div className="mt-4 space-y-2">
                  <PaymentButton
                    amount={amount}
                    description={`Purchase: ${item.title}`}
                    itemName={item.title}
                    onSuccess={(paymentId) => {
                      console.log(`Payment successful for ${item.title}:`, paymentId)
                    }}
                    onFailure={(error) => {
                      console.error(`Payment failed for ${item.title}:`, error)
                    }}
                  />
                  <button
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        title: item.title,
                        price: amount,
                        category: item.category,
                        course: item.course,
                        owner: item.owner,
                      })
                      alert(`${item.title} added to cart!`)
                    }}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition duration-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </article>
          )
        })}

        {filteredItems.length === 0 && !loading && (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">
            No items match your filters. Try Resources to add a listing.
          </p>
        )}
      </section>
    </div>
  )
}

