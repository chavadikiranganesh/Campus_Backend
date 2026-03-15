/**
 * Image URL helper utility
 * Constructs proper image URLs for uploaded files
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export function getImageUrl(filename?: string): string {
  if (!filename) {
    return '/placeholder.png' // Fallback to placeholder
  }
  
  // If it's already a full URL (Cloudinary), return as-is
  if (filename.startsWith('http')) {
    return filename
  }
  
  // Otherwise, treat as local filename (fallback for old data)
  return `${API_BASE}/uploads/${filename}`
}

export function getLostFoundImageUrl(filename?: string): string {
  if (!filename) {
    return '/placeholder.png' // Fallback to placeholder
  }
  
  // If it's already a full URL (Cloudinary), return as-is
  if (filename.startsWith('http')) {
    return filename
  }
  
  // Otherwise, treat as local filename (fallback for old data)
  return `${API_BASE}/uploads/lostfound/${filename}`
}
