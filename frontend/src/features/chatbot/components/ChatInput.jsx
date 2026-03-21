// ─────────────────────────────────────────────────────────────
// ChatInput  —  features/chatbot/components/ChatInput.jsx
// Grok-style sticky bottom input dock with:
//   • Paperclip (placeholder)
//   • Elegant model selector dropdown
//   • Expanding textarea
//   • Send button
// ─────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Cpu, FileText, Image as ImageIcon, Mic, Video, X } from 'lucide-react';
import { AVAILABLE_MODELS } from '../../../lib/constants';

export default function ChatInput({
  onSend,
  isLoading,
  isUploading,
  onFileUpload,
  selectedModel,
  onModelChange,
  isDark,
}) {
  const [input, setInput] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const textareaRef = useRef(null);
  
  const docInputRef = useRef(null);
  const imgInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ── Auto-resize textarea ──────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  };

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = () => {
    const text = input.trim();
    if ((!text && stagedFiles.length === 0) || isLoading) return;
    
    // Instead of raw onSend(text), we package the specific payload requested
    onSend({ text, files: stagedFiles });
    
    setInput('');
    setStagedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileStage = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStagedFiles(prev => [...prev, { file, type }]);
    e.target.value = ''; // reset
  };

  const removeStagedFile = (index) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Find current model label ──────────────────────────────
  const currentModel = AVAILABLE_MODELS.find((m) => m.value === selectedModel) || AVAILABLE_MODELS[0];

  // ── Style tokens ──────────────────────────────────────────
  const dockBg = isDark
    ? 'bg-black/70 border-white/8 backdrop-blur-2xl'
    : 'bg-white/80 border-gray-200 backdrop-blur-2xl';

  const inputBg = isDark
    ? 'bg-white/5 border-white/10 focus-within:border-violet-500/40'
    : 'bg-gray-50 border-gray-200 focus-within:border-violet-400';

  return (
    <div
      className={`
        sticky bottom-0 left-0 right-0 z-30
        border-t ${dockBg}
        px-4 sm:px-8 py-4 transition-colors duration-300
      `}
    >
      {/* ── Model Selector (above the input) ───────────────── */}
      <div className="relative mb-2.5 flex items-center">
        <button
          onClick={() => setModelDropdownOpen((v) => !v)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-xs font-medium transition-all duration-200
            ${isDark
              ? 'bg-white/6 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:border-violet-500/30 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]'
              : 'bg-gray-100 hover:bg-violet-50 border border-gray-200 text-gray-600 hover:text-violet-700 hover:border-violet-300'
            }
          `}
        >
          <Cpu className="w-3 h-3 opacity-60" />
          <span className="max-w-[180px] truncate">{currentModel.name}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* ── Dropdown options ──────────────────────────────── */}
        {modelDropdownOpen && (
          <>
            {/* Invisible backdrop to close on click-away */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setModelDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className={`
                absolute bottom-full left-0 mb-2 z-50
                w-72 rounded-xl border p-1.5 shadow-2xl
                ${isDark
                  ? 'bg-[#0e0e0e] border-white/10 shadow-black/60'
                  : 'bg-white border-gray-200 shadow-gray-200/60'
                }
              `}
            >
              <p className={`px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Choose Model
              </p>
              {AVAILABLE_MODELS.map((m) => {
                const isActive = m.value === selectedModel;
                return (
                  <button
                    key={m.value}
                    onClick={() => {
                      onModelChange(m.value);
                      setModelDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left flex flex-col px-3 py-2 rounded-lg
                      transition-all duration-150 group
                      ${isActive
                        ? isDark
                          ? 'bg-violet-500/15 border border-violet-500/25 text-white'
                          : 'bg-violet-50 border border-violet-200 text-violet-700'
                        : isDark
                          ? 'hover:bg-white/6 text-gray-300 border border-transparent'
                          : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                      }
                    `}
                  >
                    <span className="text-xs font-medium">{m.name}</span>
                    <span className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      {/* ── Staged Files Preview ──────────────────────────── */}
      {stagedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {stagedFiles.map((staged, idx) => {
            const getIcon = () => {
              switch(staged.type) {
                case 'document': return <FileText className="w-3.5 h-3.5" />;
                case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
                case 'audio': return <Mic className="w-3.5 h-3.5" />;
                case 'video': return <Video className="w-3.5 h-3.5" />;
                default: return <FileText className="w-3.5 h-3.5" />;
              }
            };
            
            return (
              <div 
                key={idx} 
                className={`
                  flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg text-xs
                  ${isDark ? 'bg-zinc-800 text-gray-200 shadow-sm border border-white/10' : 'bg-gray-200 text-gray-800 shadow-sm border border-gray-300'}
                `}
              >
                {getIcon()}
                <span className="truncate max-w-[120px] font-medium">{staged.file.name}</span>
                <button 
                  onClick={() => removeStagedFile(idx)}
                  className={`p-0.5 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-300 text-gray-500 hover:text-gray-800'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────────── */}
      <div
        className={`
          flex items-end gap-3 rounded-2xl border px-3 py-2.5
          ${inputBg} transition-all duration-200
          focus-within:ring-2 focus-within:ring-violet-500/20
        `}
      >
        {/* Hidden File Inputs */}
        <input type="file" ref={docInputRef} accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={(e) => handleFileStage(e, 'document')} />
        <input type="file" ref={imgInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileStage(e, 'image')} />
        <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={(e) => handleFileStage(e, 'audio')} />
        <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileStage(e, 'video')} />
        
        {/* Multimodal Attachment Row */}
        <div className="flex items-center gap-0.5 shrink-0 mb-0.5 pr-2 border-r border-white/10">
          <div className="group relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => docInputRef.current?.click()}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/8' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            >
              <FileText className="w-4 h-4" />
            </motion.button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-xs bg-zinc-800 text-gray-200 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              Upload Document
            </span>
          </div>
          
          <div className="group relative hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => imgInputRef.current?.click()}
              className={`p-1.5 rounded-lg transition-colors flex ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/8' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            >
              <ImageIcon className="w-4 h-4" />
            </motion.button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-xs bg-zinc-800 text-gray-200 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              Upload Image
            </span>
          </div>

          <div className="group relative hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => audioInputRef.current?.click()}
              className={`p-1.5 rounded-lg transition-colors flex ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/8' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-xs bg-zinc-800 text-gray-200 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              Upload Audio
            </span>
          </div>

          <div className="group relative hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => videoInputRef.current?.click()}
              className={`p-1.5 rounded-lg transition-colors flex ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/8' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            >
              <Video className="w-4 h-4" />
            </motion.button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max text-xs bg-zinc-800 text-gray-200 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              Upload Video
            </span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your exams..."
          disabled={isLoading || isUploading}
          className={`
            flex-1 resize-none bg-transparent outline-none border-none
            text-sm leading-relaxed py-1 max-h-40 scrollbar-hide
            ${isDark
              ? 'text-gray-100 placeholder:text-gray-600'
              : 'text-gray-800 placeholder:text-gray-400'
            }
            disabled:opacity-50
          `}
        />

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleSubmit}
          disabled={(!input.trim() && stagedFiles.length === 0) || isLoading}
          className={`
            shrink-0 mb-0.5 p-2 rounded-xl transition-all duration-200
            ${(input.trim() || stagedFiles.length > 0) && !isLoading
              ? isDark
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_2px_12px_rgba(139,92,246,0.3)]'
              : isDark
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>

      {/* ── Hint ───────────────────────────────────────────── */}
      <p className={`mt-2 text-center text-[10px] ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
        Press{' '}
        <kbd
          className={`px-1 py-0.5 rounded text-[9px] font-mono ${isDark ? 'bg-white/8 text-gray-500' : 'bg-gray-200 text-gray-500'}`}
        >
          Enter
        </kbd>{' '}
        to send ·{' '}
        <kbd
          className={`px-1 py-0.5 rounded text-[9px] font-mono ${isDark ? 'bg-white/8 text-gray-500' : 'bg-gray-200 text-gray-500'}`}
        >
          Shift+Enter
        </kbd>{' '}
        for new line
      </p>
    </div>
  );
}
