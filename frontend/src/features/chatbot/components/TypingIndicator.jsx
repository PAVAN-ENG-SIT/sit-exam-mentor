// ─────────────────────────────────────────────────────────────
// TypingIndicator  —  features/chatbot/components/TypingIndicator.jsx
// Three bouncing dots + "ExamMentor is thinking..." text.
// ─────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-start gap-3"
    >
      {/* AI avatar */}
      <div
        className={`
          w-7 h-7 rounded-full shrink-0 flex items-center justify-center
          ${isDark
            ? 'bg-violet-500/20 border border-violet-500/30'
            : 'bg-violet-100 border border-violet-200'
          }
        `}
      >
        <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
      </div>

      {/* Dots + label */}
      <div className="flex flex-col gap-1.5">
        <div
          className={`
            inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm
            ${isDark
              ? 'bg-white/5 border border-white/8'
              : 'bg-gray-100 border border-gray-200'
            }
          `}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              className={`
                w-1.5 h-1.5 rounded-full
                ${isDark ? 'bg-violet-400' : 'bg-violet-500'}
              `}
            />
          ))}
        </div>
        <span className={`text-[10px] ml-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          ExamMentor is thinking…
        </span>
      </div>
    </motion.div>
  );
}
