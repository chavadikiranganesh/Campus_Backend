import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function Settings() {
  const { user } = useAuth()
  const { resolved, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const handleThemeToggle = () => {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your account preferences and application settings
        </p>
      </header>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Appearance Settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Appearance</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Customize how Campus Utility looks</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              type="button"
              onClick={handleThemeToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                resolved === 'dark'
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  resolved === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Account Information</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View your account details</p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">{user?.name || 'Not set'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 break-all font-medium text-slate-900 dark:text-slate-50">{user?.email || 'Not set'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-slate-50 capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Preferences</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your notification and privacy settings</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">Email Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Receive updates about activities</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-blue-600 transition-colors dark:bg-blue-500"
            >
              <span className="inline-block h-6 w-6 translate-x-7 transform rounded-full bg-white transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
