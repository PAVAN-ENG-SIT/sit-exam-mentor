// ─────────────────────────────────────────────────────────────
// Root Wrapper  —  frontend/src/app/root.jsx
// Master wrapper: auth gate + global light/dark theme shell.
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Login from '../features/auth/Login';
import { ThemeProvider } from '../lib/ThemeContext';
import DashboardLayout from './DashboardLayout';

function AppShell() {
  // ── Pull state & actions from the auth store ─────────────
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const signOut = useAuthStore((s) => s.signOut);

  // ── Bootstrap auth on first mount ────────────────────────
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();          // clean up the listener
  }, [initializeAuth]);

  // ── 1) Loading screen ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] dark:bg-[#000000] transition-colors duration-150">
        <Loader2 className="w-10 h-10 animate-spin text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  // ── 2) Not logged in → show Login page ───────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-gray-900 dark:bg-[#000000] dark:text-gray-100 transition-colors duration-150">
        <Login />
      </div>
    );
  }

  // ── 3) Logged in → full dashboard ──────────────────
  return <DashboardLayout />;
}

export default function Root() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
