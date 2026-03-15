import { getImageUrl } from '../utils/imageUtils'

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
}

interface ResourceDetailsModalProps {
  item: Material | null
  onClose: () => void
}

export function ResourceDetailsModal({ item, onClose }: ResourceDetailsModalProps) {
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Resource details
            </p>
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {item.course} · Semester {item.semester}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[128px,1fr]">
          <div className="h-32 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            {item.image ? (
              <img 
                src={getImageUrl(item.image)} 
                alt={item.title} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const noImageDiv = target.parentElement?.querySelector('.no-image-detail')
                  if (noImageDiv) {
                    (noImageDiv as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 no-image-detail">
                No image
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item.condition}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  item.type === 'Donation'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                }`}
              >
                {item.type === 'Donation' ? 'Donation' : `For sale · ${item.price}`}
              </span>
            </div>

            {item.description && (
              <p className="text-sm text-slate-700 dark:text-slate-200">{item.description}</p>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-50">Seller</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{item.owner}</p>
              {item.ownerContact && (
                <p className="mt-1 text-slate-600 dark:text-slate-300">Contact: {item.ownerContact}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
