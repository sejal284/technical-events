// Central API base URL for the frontend
// Vite exposes env vars prefixed with VITE_
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
