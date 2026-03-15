/**
 * In development, this is '' so fetch('/api/...') goes to Vite proxy.
 * In production, set VITE_API_URL to your backend URL (e.g. https://your-app.onrender.com).
 */
// TEMPORARY: Force local backend for testing
export const API_BASE = 'http://localhost:5000'
// export const API_BASE = import.meta.env.DEV ? '' : 'https://campus-backend-1-sm36.onrender.com'
