// ─────────────────────────────────────────────────────────────
// API Client  —  frontend/src/lib/api.js
// Axios instance that auto-attaches the Supabase JWT
// to every outgoing request via a request interceptor.
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import { supabase } from './supabase';

// Points at the FastAPI backend (default dev port)
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 s max
});

// ── Request interceptor: attach Supabase JWT ────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      // getSession() returns the current session (null if logged out)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      // If Supabase is unreachable, let the request go through
      // without the token — the backend will return 401 if needed.
      console.warn('[api] Could not attach auth token:', err.message);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalise errors ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a non-2xx status
      console.error(
        `[api] ${error.response.status}:`,
        error.response.data?.detail || error.response.statusText,
      );
    } else if (error.request) {
      // Request was made but no response received (backend offline)
      console.error('[api] No response — backend may be offline.');
    } else {
      console.error('[api] Request error:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
