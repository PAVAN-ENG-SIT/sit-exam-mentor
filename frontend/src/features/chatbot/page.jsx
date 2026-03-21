// ─────────────────────────────────────────────────────────────
// Chatbot Page  —  features/chatbot/page.jsx
// Full-screen Grok-style layout with a universally collapsible
// sidebar (slides left/right) and chat area.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { AVAILABLE_MODELS } from '../../lib/constants';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import TodoList from '../dashboard/TodoList';

// ── Backend URL ───────────────────────────────────────────────
const CHAT_API_URL = 'http://localhost:8000/chat';

export default function ChatbotPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ── Local state ─────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeView, setActiveView] = useState('chat');
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const user = useAuthStore(s => s.user);
  
  // Sidebar starts open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Auto-close on resize if window gets too small
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Database Fetching ───────────────────────────────────────
  useEffect(() => {
    if (user) {
      const loadChats = async () => {
        const { data } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setChats(data);
      };
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (activeChatId) {
      const loadMessages = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', activeChatId)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      };
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user?.id || "anonymous-test-user");

    try {
      const res = await fetch('http://localhost:8000/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `✅ Successfully scanned **${file.name}** and stored ${data.chunks_stored} contextual memory chunks.` }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `❌ Upload failed: ${data.detail || 'Unknown error'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `❌ Network Error: Could not reach the upload endpoint.` }]);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Send message ────────────────────────────────────────────
  const handleSend = useCallback(
    async (payload) => {
      if (!user) {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '⚠️ Please sign in to create chat sessions.' }]);
        return;
      }

      // Handle both legacy string and new multimodal object
      const text = typeof payload === 'string' ? payload : payload.text;
      const files = typeof payload === 'object' && payload.files ? payload.files : [];
      
      // Step 1: Optimistic UI Update
      const userMsg = { id: Date.now(), role: 'user', content: text, attachedFiles: files.map(f => f.file.name) };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      let currentChatId = activeChatId;

      try {
        // Step 2 & 3: Check and Create Session if null
        if (!currentChatId) {
          const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert({ user_id: user.id, title: text.substring(0, 40) + (text.length > 40 ? '...' : '') })
            .select()
            .single();
          
          if (chatError) throw chatError;
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
          setChats(prev => [newChat, ...prev]); // Prepend new chat locally
        }

        // Step 4: Store User Message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({ chat_id: currentChatId, role: 'user', content: text });
        if (msgError) console.error("Failed to save user message:", msgError);

        // Step 6: RAG Pipeline Trigger
        const res = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
            model: selectedModel,
            chat_id: currentChatId,
            user_id: user.id
          }),
        });

        const data = await res.json();
        const aiResponseContent = data.reply || `⚠️ Error: ${data.error}`;
        
        // Step 7: Save AI Response
        if (data.reply) {
          await supabase
            .from('messages')
            .insert({ chat_id: currentChatId, role: 'assistant', content: aiResponseContent });
        }

        // Step 8: Update UI
        setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: aiResponseContent, citations: data.citations || [] }]);

      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', content: '⚠️ Chat error: ' + err.message },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedModel, activeChatId, user, chats],
  );

  const bg = isDark ? 'bg-[#050505]' : 'bg-[#f9f9f9]';

  return (
    <div className={`h-screen w-full flex overflow-hidden ${bg} transition-colors duration-300`}>

      {/* ─── Sliding Sidebar ──────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, x: -260 }}
            animate={{ width: 260, x: 0 }}
            exit={{ width: 0, x: -260 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="shrink-0 h-full overflow-hidden"
          >
            <ChatSidebar 
              onNewChat={handleNewChat} 
              onClose={() => setSidebarOpen(false)}
              activeView={activeView}
              setActiveView={setActiveView}
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main chat area ──────────────────────────────── */}
      <div className="relative flex flex-col flex-1 min-w-0 h-full">
        {/* Header / Sidebar Toggle */}
        <div
          className={`
            shrink-0 flex items-center gap-3 px-4 py-3 border-b
            ${isDark ? 'border-[#1a1a1a]' : 'border-gray-200'}
          `}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/8 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            ExamMentor AI
          </span>
        </div>

        {/* Conditional View Rendering */}
        {activeView === 'chat' ? (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} isDark={isDark} />
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isDark={isDark}
            />
          </>
        ) : (
          <TodoList />
        )}
      </div>
    </div>
  );
}
