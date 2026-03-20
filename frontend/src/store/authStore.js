// ─────────────────────────────────────────────────────────────
// Auth Store  —  frontend/src/store/authStore.js
// Zustand store for Supabase authentication state.
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set) => ({
  // ── State ────────────────────────────────────────────────
  user: null,
  session: null,
  isLoading: true,

  // ── Actions ──────────────────────────────────────────────

  /**
   * initializeAuth()
   * Call once on app mount.
   *  1. Fetches the current session (handles page refreshes).
   *  2. Subscribes to future auth changes (login / logout / token refresh).
   */
  initializeAuth: () => {
    // 1) Get whatever session already exists (e.g. from a stored cookie)
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // 2) Listen for every auth change going forward
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // Return the unsubscribe handle so the caller can clean up
    return () => subscription.unsubscribe();
  },

  /**
   * signOut()
   * Signs the user out via Supabase and clears local state.
   */
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

export default useAuthStore;
