import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const cards = [
  {
    path: '/resources',
    icon: '📚',
    title: 'Resources',
    desc: 'Sell or donate books, instruments, calculators & notes. Browse listings from other students.',
    color: 'blue',
  },
  {
    path: '/marketplace',
    icon: '🛒',
    title: 'Marketplace',
    desc: 'Study materials marketplace — filter by course, semester, and category.',
    color: 'blue',
  },
  {
    path: '/accommodation',
    icon: '🏠',
    title: 'Accommodation',
    desc: 'Explore PGs and hostels with rent, facilities, distance and contact details.',
    color: 'emerald',
  },
  {
    path: '/lost-found',
    icon: '🔍',
    title: 'Lost & Found',
    desc: 'Report lost items or list what you found. Help reunite belongings.',
    color: 'amber',
  },
  {
    path: '/events',
    icon: '📅',
    title: 'Event Calendar',
    desc: 'Campus events, workshops and important dates.',
    color: 'violet',
  },
  {
    path: '/study-groups',
    icon: '👥',
    title: 'Study Groups',
    desc: 'Find or create study groups by subject and course.',
    color: 'violet',
  },
]

const colorClasses: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50/80 hover:border-blue-400 hover:shadow-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:hover:border-blue-700 dark:hover:shadow-blue-900/30',
  emerald:
    'border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 hover:shadow-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:hover:border-emerald-700 dark:hover:shadow-emerald-900/30',
  amber:
    'border-amber-200 bg-amber-50/80 hover:border-amber-400 hover:shadow-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:shadow-amber-900/30',
  violet:
    'border-violet-200 bg-violet-50/80 hover:border-violet-400 hover:shadow-violet-100 dark:border-violet-900/50 dark:bg-violet-950/30 dark:hover:border-violet-700 dark:hover:shadow-violet-900/30',
}

const iconBg: Record<string, string> = {
  blue: 'bg-blue-600 shadow-blue-400/50 dark:bg-blue-500',
  emerald: 'bg-emerald-600 shadow-emerald-400/50 dark:bg-emerald-500',
  amber: 'bg-amber-600 shadow-amber-400/50 dark:bg-amber-500',
  violet: 'bg-violet-600 shadow-violet-400/50 dark:bg-violet-500',
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-10 pb-8 pt-4">
      {/* Hero */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-6 py-10 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Welcome back
        </p>
        <h1 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl lg:text-4xl">
          Hi {user?.name || 'Student'}, what would you like to do today?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400">
          Resources, accommodation, lost &amp; found, events, study groups — one place.
        </p>
      </section>

      {/* Quick links grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className={`group flex flex-col items-start rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${colorClasses[card.color]}`}
            >
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white shadow-lg ${iconBg[card.color]}`}
              >
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{card.title}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
