// ─────────────────────────────────────────────────────────────
// Futuristic Login Composer — src/features/auth/Login.jsx
// Combines NeuralBackground, LoginCard, FloatingInput, LiveConsole.
// Added: Google OAuth button + Dark/Light mode toggle.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import NeuralBackground from './components/NeuralBackground';
import LoginCard from './components/LoginCard';
import FloatingInput from './components/FloatingInput';
import LiveConsole from './components/LiveConsole';
import { useTheme } from '../../lib/ThemeContext';

// ── Google SVG icon (no external dep needed) ─────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ── Theme Toggle Button ───────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        fixed top-4 right-4 z-50
        w-10 h-10 rounded-full
        flex items-center justify-center
        border transition-all duration-300
        ${isDark
          ? 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20 shadow-[0_0_15px_rgba(255,220,50,0.3)]'
          : 'bg-black/10 border-black/20 text-indigo-700 hover:bg-black/15 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
        }
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Controls the background particle speed and card glow
  const [typingIntensity, setTypingIntensity] = useState(0);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setTypingIntensity(Math.min(val.length / 25, 1));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setTypingIntensity(Math.min((email.length + val.length) / 35, 1));
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth via Supabase ────────────────────────────────
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (oauthError) throw oauthError;
      // Supabase will redirect the browser to Google; no further handling needed here.
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  // ── Background / card adapt to theme ────────────────────────
  const containerBg = isDark ? 'bg-[#050505]' : 'bg-[#f0f4ff]';
  const textColor   = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 ${containerBg} ${textColor} overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300`}>

      {/* ── Theme Toggle (fixed top-right) ────────────────────── */}
      <ThemeToggle />

      {/* ── 1. Interactive Neural Network Background ──────────── */}
      <NeuralBackground typingIntensity={typingIntensity} isDark={isDark} />

      {/* ── 2. Glassmorphism Login Card ───────────────────────── */}
      <LoginCard glowIntensity={typingIntensity} isDark={isDark}>

        {/* Header / Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]
              ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-100 border border-blue-300'}`}
          >
            <svg
              className={`w-8 h-8 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>

          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white/95' : 'text-gray-800'}`}>
            SIT Exam Mentor
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Secure connection established.
          </p>
        </div>

        {/* Global Alerts */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium">
            {error}
          </motion.div>
        )}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-500 font-medium">
            {message}
          </motion.div>
        )}

        {/* ── 3. Floating Inputs Form ───────────────────────────── */}
        <form onSubmit={handleEmailAuth} className="space-y-1 relative z-20">
          <FloatingInput
            id="email"
            type="email"
            label="Email Address"
            icon={Mail}
            value={email}
            onChange={handleEmailChange}
            isDark={isDark}
            required
          />
          <FloatingInput
            id="password"
            type="password"
            label="Password"
            icon={Lock}
            value={password}
            onChange={handlePasswordChange}
            isDark={isDark}
            required
          />

          {/* ── 5. Login / Sign-up Button ─────────────────────── */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`
              w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl
              text-sm font-semibold tracking-wide transition-colors duration-300
              ${isDark
                ? 'text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 hover:border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]'
                : 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 shadow-[0_2px_12px_rgba(59,130,246,0.3)]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : (isSignUp ? 'Initialize Profile' : 'Access System')}
          </motion.button>
        </form>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="relative my-6 z-20">
          <div className={`absolute inset-0 flex items-center`}>
            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className={`px-3 ${isDark ? 'bg-transparent text-gray-500' : 'bg-transparent text-gray-400'}`}>
              or continue with
            </span>
          </div>
        </div>

        {/* ── Google OAuth Button ───────────────────────────────── */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          className={`
            w-full relative z-20 flex items-center justify-center gap-3 py-3.5 rounded-xl
            text-sm font-semibold transition-all duration-300
            ${isDark
              ? 'bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {googleLoading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
        </motion.button>

        {/* ── Toggle Sign-up / Login ─────────────────────────────── */}
        <div className="mt-6 text-center z-20 relative">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
            className={`text-xs transition-colors uppercase tracking-widest font-medium
              ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >
            {isSignUp ? 'Switch to Access System' : 'Request Profile Initialization'}
          </button>
        </div>

        {/* ── 4. AI Console Simulation ──────────────────────────── */}
        <LiveConsole />
      </LoginCard>
    </div>
  );
}
