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
  
  // For local filenames, check if they might be old local files
  // Return placeholder for old local files since /uploads no longer exists
  if (filename.includes('-') && filename.includes('.')) {
    // This looks like an old local filename, return placeholder
    return '/placeholder.png'
  }
  
  // Otherwise, treat as local filename (fallback for any other case)
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
  
  // For local filenames, check if they might be old local files
  // Return placeholder for old local files since /uploads no longer exists
  if (filename.includes('-') && filename.includes('.')) {
    // This looks like an old local filename, return placeholder
    return '/placeholder.png'
  }
  
  // Otherwise, treat as local filename (fallback for any other case)
  return `${API_BASE}/uploads/lostfound/${filename}`
}
