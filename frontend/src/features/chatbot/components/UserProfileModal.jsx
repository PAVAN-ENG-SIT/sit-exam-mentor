// ─────────────────────────────────────────────────────────────
// UserProfileModal  —  features/chatbot/components/UserProfileModal.jsx
// Glassmorphism modal with profile fields, theme toggle, sign out.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../../lib/ThemeContext';
import useAuthStore from '../../../store/authStore';

export default function UserProfileModal({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [college, setCollege] = useState('');
  const [semester, setSemester] = useState('');

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // ── Style tokens ────────────────────────────────────────────
  const inputClass = `
    w-full px-3 py-2.5 rounded-xl text-sm outline-none
    transition-all duration-200
    ${isDark
      ? 'bg-white/5 border border-white/10 text-gray-100 placeholder:text-gray-600 focus:border-violet-500/50 focus:bg-white/8'
      : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white'
    }
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* ── Modal ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed inset-0 z-50 flex items-center justify-center p-4
              pointer-events-none
            `}
          >
            <div
              className={`
                pointer-events-auto w-full max-w-sm rounded-2xl p-6
                backdrop-blur-xl border shadow-2xl
                ${isDark
                  ? 'bg-black/40 border-white/10 shadow-violet-500/5'
                  : 'bg-white/80 border-gray-200 shadow-gray-300/30'
                }
              `}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={`
                  absolute top-4 right-4 p-1.5 rounded-lg transition-colors
                  ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
                `}
              >
                <X className="w-4 h-4" />
              </button>

              {/* ── Avatar ────────────────────────────────── */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center mb-3
                    ${isDark
                      ? 'bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25'
                      : 'bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-400/25'
                    }
                  `}
                >
                  <User className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Your Profile
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {user?.email || 'student@sit.ac.in'}
                </p>
              </div>

              {/* ── Form fields ───────────────────────────── */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className={`text-[10px] uppercase tracking-wider font-semibold mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pa1 Das"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`text-[10px] uppercase tracking-wider font-semibold mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    College
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="SIT, Tumkur"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`text-[10px] uppercase tracking-wider font-semibold mb-1 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="6th Semester"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ── Theme toggle ──────────────────────────── */}
              <button
                onClick={toggleTheme}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2
                  text-sm font-medium transition-all duration-200
                  ${isDark
                    ? 'hover:bg-white/8 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                {isDark
                  ? <Sun className="w-4 h-4 text-yellow-400" />
                  : <Moon className="w-4 h-4 text-indigo-500" />
                }
                <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>

              {/* ── Sign out ──────────────────────────────── */}
              <button
                onClick={handleSignOut}
                className="
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  text-red-500 hover:bg-red-500/10
                "
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
