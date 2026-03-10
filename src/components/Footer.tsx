export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Campus Utility. Final year project.</p>
        <p className="text-right">
          Resources · Marketplace · Accommodation · Lost &amp; Found · Events · Study Groups · AI support
        </p>
      </div>
    </footer>
  )
}

