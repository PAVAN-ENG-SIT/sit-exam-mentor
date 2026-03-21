// ─────────────────────────────────────────────────────────────
// ChatSidebar  —  features/chatbot/components/ChatSidebar.jsx
// Left sidebar: logo, new chat, scrollable history, feature
// nav links, and profile icon that opens UserProfileModal.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  FileText,
  ClipboardList,
  BookOpen,
  CheckSquare,
  Film,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';
import { useTheme } from '../../../lib/ThemeContext';
import UserProfileModal from './UserProfileModal';

// ── Dynamic history ─────────────────────────────────────────────
const chats = [];

// ── Feature nav links ─────────────────────────────────────────

export default function ChatSidebar({ onNewChat, closeSidebar, activeView, setActiveView, chats = [], activeChatId, setActiveChatId }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [profileOpen, setProfileOpen] = useState(false);

  // ── Style tokens ──────────────────────────────────────────
  const bg        = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const border    = isDark ? 'border-[#1a1a1a]' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hover     = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const navDefault = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      <aside
        className={`
          flex flex-col w-[260px] shrink-0 h-screen
          ${bg} border-r ${border}
          transition-colors duration-300
        `}
      >
        {/* ── Logo + New Chat ─────────────────────────────── */}
        <div className={`px-3 pt-4 pb-3 border-b ${border}`}>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div
              className={`
                w-7 h-7 rounded-lg flex items-center justify-center
                ${isDark
                  ? 'bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/20'
                  : 'bg-gradient-to-br from-violet-100 to-cyan-100 border border-violet-200'
                }
              `}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
              ExamMentor
            </span>
          </div>

          {/* New Chat button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onNewChat?.();
              closeSidebar?.();
            }}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200
              ${isDark
                ? 'bg-white/6 hover:bg-white/10 border border-white/10 text-white'
                : 'bg-gray-50 hover:bg-violet-50 border border-gray-200 text-gray-700 hover:text-violet-700 hover:border-violet-200'
              }
            `}
          >
            <Plus className="w-4 h-4 shrink-0" />
            New Chat
          </motion.button>
        </div>

        {/* ── Chat History (scrollable) ───────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 py-3">
          <p className={`px-4 mb-2 text-[10px] uppercase tracking-widest font-semibold ${textMuted}`}>
            Recent
          </p>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-1">
            {chats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                No recent chats
              </div>
            ) : (
              <AnimatePresence>
                {chats.map((chat, i) => {
                  const isActive = activeChatId === chat.id;
                  return (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setActiveChatId(chat.id);
                        closeSidebar?.();
                      }}
                      className={`
                        w-full group flex items-center gap-2 px-3 py-2 rounded-lg
                        text-left text-xs transition-all duration-200 truncate mb-0.5
                        ${isActive
                          ? isDark ? 'bg-white/8 text-white' : 'bg-violet-50 text-violet-700'
                          : `${textMuted} ${hover}`
                        }
                      `}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                      <span className="flex-1 truncate">{chat.title}</span>
                      <ChevronRight
                        className={`
                          w-3 h-3 shrink-0 transition-opacity
                          ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}
                        `}
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Feature nav links ───────────────────────────── */}
        <nav className={`px-2 py-2 border-t ${border} space-y-0.5`}>
          <p className={`px-3 mb-1 text-[10px] uppercase tracking-widest font-semibold ${textMuted}`}>
            Features
          </p>
          {[
            { id: 'chat', label: 'Chat Arena', icon: MessageSquare },
            { id: 'todo', label: 'To-Do List', icon: CheckSquare }
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveView?.(id); closeSidebar?.(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? isDark ? 'bg-zinc-800 text-white' : 'bg-gray-200 text-gray-900' 
                    : `${navDefault} ${hover}`
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'opacity-100 text-violet-500' : 'opacity-60'}`} />
                <span className="flex-1 text-left">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Profile icon ────────────────────────────────── */}
        <div className={`px-3 py-3 border-t ${border} flex justify-end`}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setProfileOpen(true)}
            className={`
              w-9 h-9 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isDark
                ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                : 'bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-400/20 hover:shadow-violet-400/35'
              }
            `}
          >
            <User className="w-4 h-4" />
          </motion.button>
        </div>
      </aside>

      {/* ── Profile Modal ─────────────────────────────────── */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
