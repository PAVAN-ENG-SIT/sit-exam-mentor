// ─────────────────────────────────────────────────────────────
// ChatMessages  —  features/chatbot/components/ChatMessages.jsx
// Scrollable message list with user/AI bubbles, auto-scroll,
// and typing indicator support.
// ─────────────────────────────────────────────────────────────
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, Paperclip } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

// ── AI avatar icon ────────────────────────────────────────────
function AIAvatar({ isDark }) {
  return (
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
  );
}

// ── Single message bubble ─────────────────────────────────────
function MessageBubble({ msg, isDark }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* AI Avatar — only on assistant messages */}
      {!isUser && <AIAvatar isDark={isDark} />}

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? `bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-tr-sm shadow-lg shadow-violet-600/20`
            : isDark
              ? 'bg-zinc-900/70 border border-white/8 text-gray-200 rounded-tl-sm shadow-lg shadow-black/30'
              : 'bg-gray-100 border border-gray-200 text-gray-700 rounded-tl-sm'
          }
        `}
      >
        {/* Attached Files rendering for User */}
        {isUser && msg.attachedFiles?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {msg.attachedFiles.map((fname, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-medium"
              >
                <Paperclip className="w-3 h-3" />
                {fname}
              </span>
            ))}
          </div>
        )}

        {/* Simple markdown-ish line rendering */}
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {renderBoldText(line)}
          </p>
        ))}

        {/* ── RAG Citations ── */}
        {!isUser && msg.citations?.length > 0 && (
          <div className={`mt-3 flex flex-wrap gap-2 border-t pt-2.5 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'} w-full block mb-0.5`}>Sources used</span>
            {msg.citations.map((cite, idx) => (
              <div 
                key={idx}
                className={`group relative cursor-help flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                  isDark 
                    ? 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20' 
                    : 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100'
                }`}
              >
                [{idx + 1}]
                
                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-2.5 py-1.5 text-xs text-left border rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none ${
                  isDark ? 'bg-[#111] border-white/10 text-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.8)]' : 'bg-white border-gray-200 text-gray-800 shadow-xl'
                }`}>
                  <p className="font-medium truncate">{cite.filename}</p>
                  <p className="opacity-70 text-[10px] mt-0.5">Page {cite.page}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Very lightweight bold-text renderer:
 * wraps **text** in <strong> tags.
 */
function renderBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ── Main component ────────────────────────────────────────────
export default function ChatMessages({ messages, isLoading, isDark }) {
  const endRef = useRef(null);

  // Auto-scroll to bottom when messages change or typing starts
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-8 py-6 space-y-5 pb-44">
      {/* Welcome state when no messages */}
      {messages.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-4
              ${isDark
                ? 'bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20'
                : 'bg-gradient-to-br from-violet-100 to-cyan-100 border border-violet-200'
              }
            `}
          >
            <Bot className={`w-8 h-8 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
          </div>
          <h2 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Ready to Begin
          </h2>
          <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Upload a document, image, audio, or video to begin.<br/>Exam Mentor will analyze the content and answer your questions.
          </p>
        </motion.div>
      )}

      {/* Message list */}
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isLoading && <TypingIndicator isDark={isDark} />}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={endRef} />
    </div>
  );
}
