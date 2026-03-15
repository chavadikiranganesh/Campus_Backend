import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

interface Listings {
  materials: { id: number; title: string; type?: string }[]
  lostFound: { id: number; title: string; type?: string }[]
  studyGroups: { id: number; subject: string }[]
}

interface Order {
  id: string
  items: { title: string; price: number; owner: string }[]
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  deliveryAddress: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export function Profile() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listings | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchListings = async () => {
    if (!user) return
    try {
      const res = await fetch(`${API_BASE}/api/users/me/listings`, {
        headers: { 'X-User-Id': String(user.id) },
      })
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    }
  }

  const refreshListings = async () => {
    setRefreshing(true)
    await fetchListings()
    setRefreshing(false)
  }

  useEffect(() => {
    if (!user) return
    const f = async () => {
      try {
        // Load listings
        await fetchListings()

        // Load orders from database
        const ordersRes = await fetch(`${API_BASE}/api/orders/user/${user.id}`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setOrders(ordersData)
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">My listings</h2>
          <button
            onClick={refreshListings}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {refreshing ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent animate-spin rounded-full"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Your Orders</h2>
        {loading && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
        {!loading && orders.length === 0 && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No orders yet. Start shopping to see your order history.</p>
        )}
        {!loading && orders.length > 0 && (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-lg p-4 dark:border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-50">Order #{order.id}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">₹{order.totalAmount}</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Items:</p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400">
                    {order.items.map((item, index) => (
                      <li key={index}>{item.title} - ₹{item.price}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p><strong>Delivery Address:</strong> {order.deliveryAddress.fullName}, {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
