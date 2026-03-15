/**
 * Image URL helper utility
 * Constructs proper image URLs for uploaded files
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export function getImageUrl(filename?: string): string {
  if (!filename) {
    return '/placeholder.png' // Fallback to placeholder
  }
  return `${API_BASE}/uploads/${filename}`
}

export function getLostFoundImageUrl(filename?: string): string {
  if (!filename) {
    return '/placeholder.png' // Fallback to placeholder
  }
  return `${API_BASE}/uploads/lostfound/${filename}`
}
