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
  {
    path: '/medical-help',
    icon: '🏥',
    title: 'Medical Help',
    desc: 'Blood donor directory - find and volunteer donors for emergencies.',
    color: 'red',
  },
]

const colorClasses: Record<string, string> = {
  blue: 'from-blue-50 to-white border-blue-200',
  emerald: 'from-emerald-50 to-white border-emerald-200',
  amber: 'from-amber-50 to-white border-amber-200',
  violet: 'from-violet-50 to-white border-violet-200',
  red: 'from-red-50 to-white border-red-200',
}

const iconBg: Record<string, string> = {
  blue: 'bg-blue-600 shadow-blue-400/50 dark:bg-blue-500',
  emerald: 'bg-emerald-600 shadow-emerald-400/50 dark:bg-emerald-500',
  amber: 'bg-amber-600 shadow-amber-400/50 dark:bg-amber-500',
  violet: 'bg-violet-600 shadow-violet-400/50 dark:bg-violet-500',
  red: 'bg-red-600 shadow-red-400/50 dark:bg-red-500',
}

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="page-section fade-in">
      {/* Welcome Section */}
      <section className="mb-12">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
            Welcome back
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 dark:text-slate-50">
          Hi {user?.name || 'Student'}, <span className="text-slate-600 dark:text-slate-400">what would you like to do today?</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl dark:text-slate-400">
          Resources, accommodation, lost &amp; found, events, study groups, and medical help — all in one place designed for your campus life.
        </p>
      </section>

      {/* Quick Access Cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Quick Access</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Everything you need, just a click away</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className={`feature-card group text-left bg-gradient-to-br ${colorClasses[card.color]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl text-white shadow-lg ${iconBg[card.color]}`}
                >
                  {card.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-900 dark:text-slate-100">
                    View →
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 dark:text-slate-50">{card.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="feature-card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-400">7+</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Campus Services</p>
          </div>
          <div className="feature-card text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2 dark:text-emerald-400">24/7</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Available Support</p>
          </div>
          <div className="feature-card text-center">
            <div className="text-3xl font-bold text-violet-600 mb-2 dark:text-violet-400">100%</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Student Focused</p>
          </div>
        </div>
      </section>
    </div>
  )
}
