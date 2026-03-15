import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

const sampleAccommodations = [
  {
    id: 1,
    name: 'GreenView Boys PG',
    distance: '0.8 km from campus',
    rent: '₹7,500 / month',
    occupancy: '2 / 3 sharing',
    facilities: ['Wi‑Fi', '3 meals', 'Laundry', 'Study table'],
    contact: 'Mr. Kumar – +91 98765 43210',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400']
  },
  {
    id: 2,
    name: 'Sunrise Ladies Hostel',
    distance: '1.2 km from campus',
    rent: '₹8,500 / month',
    occupancy: '2 sharing',
    facilities: ['Wi‑Fi', 'Breakfast & Dinner', '24x7 Security', 'Library room'],
    contact: 'Office – +91 91234 56780',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400']
  },
  {
    id: 3,
    name: 'TechPark Student Homes',
    distance: '2.0 km from campus',
    rent: '₹6,800 / month',
    occupancy: '3 / 4 sharing',
    facilities: ['Wi‑Fi', 'Food court nearby', 'Gym access', 'Bus pickup'],
    contact: 'Reception – +91 90000 11223',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400']
  },
] as const

interface AccommodationItem {
  id: number
  name: string
  distance: string
  rent: string
  occupancy: string
  facilities: string[]
  contact: string
  images?: string[]  // Changed to images to match backend
  postedByUserId?: number
}

export function Accommodation() {
  const { user } = useAuth()
  const [places, setPlaces] = useState<AccommodationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [distance, setDistance] = useState('')
  const [rent, setRent] = useState('')
  const [occupancy, setOccupancy] = useState('')
  const [facilities, setFacilities] = useState('')
  const [contact, setContact] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<AccommodationItem | null>(null)

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE}/api/accommodations`)
        if (!response.ok) {
          throw new Error('Failed to load accommodations from backend')
        }
        const data: AccommodationItem[] = await response.json()
        setPlaces(data)
      } catch (err) {
        console.error(err)
        setPlaces(sampleAccommodations as unknown as AccommodationItem[])
        setError('Using local sample data because the backend is not reachable.')
      } finally {
        setLoading(false)
      }
    }

    fetchAccommodations()
  }, [])

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSaving(true)
    
    if (photoFiles.length === 0) {
      setFormError('Please select at least one image')
      setSaving(false)
      return
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', name)
      formData.append('distance', distance)
      formData.append('rent', rent)
      formData.append('occupancy', occupancy)
      formData.append('facilities', facilities)
      formData.append('contact', contact)
      
      // Add image files
      photoFiles.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch(`${API_BASE}/api/accommodations`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save accommodation.')
      }

      const created: AccommodationItem = await response.json()
      setPlaces((prev) => [...prev, created])
      setName('')
      setDistance('')
      setRent('')
      setOccupancy('')
      setFacilities('')
      setContact('')
      setPhotoFiles([])
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (accommodation: AccommodationItem) => {
    if (!user) return

    try {
      const response = await fetch(`${API_BASE}/api/accommodations/${accommodation.id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete accommodation')
      }

      setPlaces((prev) => prev.filter((place) => place.id !== accommodation.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    }
  }

  const canDelete = (accommodation: AccommodationItem) => {
    if (!user) return false
    // Allow admins to delete any accommodation
    if (user.role === 'admin') return true
    // Allow users to delete accommodations they posted (if postedByUserId is tracked)
    if (accommodation.postedByUserId && accommodation.postedByUserId === user.id) return true
    // For now, allow all authenticated users to delete (for testing)
    return true
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          Accommodation
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          PGs and hostels near campus — rent, facilities, contact. Admins can add listings with multiple photos.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-slate-500">Loading accommodation listings from backend...</p>
      )}
      {error && !loading && (
        <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {places.map((place) => (
          <article
            key={place.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
          >
            <PgPhotoSlider photos={place.images || []} name={place.name} />
            <div className="mt-3 space-y-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 sm:text-base">
                {place.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{place.distance}</p>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">{place.rent}</p>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>Occupancy: {place.occupancy}</p>
              <p className="text-[11px]">
                Facilities:
                <span className="ml-1 text-slate-800 dark:text-slate-200">
                  {place.facilities.join(' • ')}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500">Contact: {place.contact}</p>
            </div>
            {canDelete(place) && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(place)}
                  className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 hidden sm:text-sm">
        In a complete system, this page would be connected to an admin-verified database of PGs and
        hostels. Students could filter by budget, distance, gender, and facilities. Integration with
        the AI chatbot would allow natural-language queries such as “show options under ₹8,000
        within 1 km”.
      </section>

      {user?.role === 'admin' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin: Add PG / hostel</h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Add multiple photo URLs so students can view a gallery.</p>
          <form onSubmit={handleAdd} className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="PG or hostel name"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Distance</label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. 0.8 km from campus"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Rent</label>
                <input
                  type="text"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. ₹7,500 / month"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Occupancy</label>
                <input
                  type="text"
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. 2 / 3 sharing"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Wi‑Fi, 3 meals, Laundry"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-700 dark:text-slate-300">Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Name and phone"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-slate-700 dark:text-slate-300">
                  Photos (up to 5 images)
                </label>
              </div>
              
              {/* File Upload Section */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      // Validate file count and types
                      const validFiles = files.filter(file => {
                        if (!file) return false // Filter out null files
                        const isValidType = file.type.startsWith('image/')
                        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
                        if (!isValidType) {
                          alert(`${file.name} is not a valid image file`)
                          return false
                        }
                        if (!isValidSize) {
                          alert(`${file.name} is too large (max 5MB)`)
                          return false
                        }
                        return true
                      })
                      
                      if (validFiles.length > 5) {
                        alert('Maximum 5 images allowed')
                        setPhotoFiles(validFiles.slice(0, 5))
                      } else {
                        setPhotoFiles(validFiles)
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-2 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:file:bg-blue-900/40 dark:file:text-blue-200"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 Hold Ctrl/Cmd and click to select multiple images, or drag to select multiple files
                </p>
                
                {/* Image Previews */}
                {photoFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Selected ({photoFiles.length}/5): {photoFiles.filter(f => f).map(f => f.name).join(', ')}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPhotoFiles([])}
                        className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photoFiles.filter(f => f).map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <p className="mt-1 text-xs text-slate-500 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {formError && <p className="text-xs text-rose-500 md:col-span-2">{formError}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 dark:bg-emerald-500"
              >
                {saving ? 'Saving…' : 'Save accommodation'}
              </button>
            </div>
          </form>
        </section>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null)
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                  <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete Accommodation</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PgPhotoSlider({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0)
  
  // Filter out empty/invalid photos and use Cloudinary URLs directly
  const validPhotos = photos.filter(photo => photo && photo.startsWith('http'))

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-700">
      {validPhotos.length > 0 ? (
        <>
          <img
            src={validPhotos[index]}
            alt={`${name} photo ${index + 1}`}
            className="h-full w-full object-cover"
            onError={(e) => { 
              ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' 
            }}
          />
          {validPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 px-2 py-1 text-xs text-white hover:bg-slate-800"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % validPhotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 px-2 py-1 text-xs text-white hover:bg-slate-800"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {validPhotos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
          <span className="text-sm">No photos</span>
        </div>
      )}
    </div>
  )
}
