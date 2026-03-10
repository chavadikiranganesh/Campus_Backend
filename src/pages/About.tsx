export function About() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          About Campus Utility
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Final year project: student utility platform — resources, accommodation, lost &amp; found, events, study groups, AI assistant.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 sm:grid-cols-2 sm:text-sm">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
            Core Modules
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Resources &amp; Marketplace</span> – Sell or donate books,
              instruments, calculators, notes. Search and filter by course, semester, category.
            </li>
            <li>
              <span className="font-medium">Accommodation</span> – Curated PG and hostel info:
              rent, facilities, occupancy, contact details.
            </li>
            <li>
              <span className="font-medium">Lost &amp; Found</span> – Report lost or found items.
            </li>
            <li>
              <span className="font-medium">Event Calendar</span> – Campus events and workshops.
            </li>
            <li>
              <span className="font-medium">Study Groups</span> – Find or create groups by subject.
            </li>
            <li>
              <span className="font-medium">AI Chatbot</span> – Guidance and FAQs across the platform.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
            Technology Stack
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>React + TypeScript, Vite, React Router.</li>
            <li>Tailwind CSS for responsive UI and dark mode.</li>
            <li>Express backend with in-memory store (database-ready).</li>
            <li>Rule-based chatbot with optional backend endpoint.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 sm:text-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
          Project Objectives &amp; Outcomes
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Promote sustainable reuse of learning materials on campus.</li>
          <li>Reduce financial burden on juniors for books and study aids.</li>
          <li>Make accommodation discovery transparent and student‑friendly.</li>
          <li>Integrate modern web tech with search, auth, and conversational assistant.</li>
        </ul>
      </section>
    </div>
  )
}

