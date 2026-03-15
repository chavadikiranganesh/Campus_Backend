export function Home() {
  return (
    <div className="space-y-10">
      <section className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 shadow-sm shadow-blue-500/30">
            React-Based Student Utility Platform with AI Chatbot
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Campus Utility: reuse study resources, find accommodation, and get
            instant AI help.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Campus Utility is a React-based web application that promotes
            sustainability and collaboration within college environments. It
            enables senior students to sell or donate used study materials and
            helps juniors easily discover what they need. An accommodation
            module and integrated AI chatbot provide always-available support.
          </p>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              ♻️ Sustainable campus reuse
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              🏠 PG &amp; hostel discovery
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              🤖 AI-powered assistance
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-blue-900/30">
          <div className="text-center text-slate-300">
            <h3 className="text-lg font-semibold mb-2">AI Assistant Available</h3>
            <p className="text-sm">Chat with our AI assistant for help with campus resources, accommodation, and more!</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:grid-cols-3 sm:gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Study Material Exchange
          </h2>
          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            Seniors can list books, instruments, and calculators for sale or
            donation. Juniors can filter by course, semester, and category to
            quickly find exactly what they need.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Accommodation Assistance
          </h2>
          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            Browse verified PGs and hostels near campus with key details like
            rent, facilities, distance, and owner contact information for
            easier decision making.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Integrated AI Chatbot
          </h2>
          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            The Campus Utility chatbot acts as a 24/7 assistant, helping users
            navigate the platform, answer FAQs, and provide real-time guidance
            about materials and accommodation.
          </p>
        </div>
      </section>
    </div>
  )
}

