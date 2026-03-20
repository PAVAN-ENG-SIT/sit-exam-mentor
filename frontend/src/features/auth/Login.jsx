// ─────────────────────────────────────────────────────────────
// Futuristic Login Composer — src/features/auth/login.jsx
// Combines NeuralBackground, LoginCard, FloatingInput, and LiveConsole.
// Pure JS, Framer Motion, Tailwind CSS, Lucide Icons.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import NeuralBackground from './components/NeuralBackground';
import LoginCard from './components/LoginCard';
import FloatingInput from './components/FloatingInput';
import LiveConsole from './components/LiveConsole';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#050505] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* 1. Interactive Neural Network Background */}
      <NeuralBackground typingIntensity={typingIntensity} />
      
      {/* 2. Glassmorphism Login Card */}
      <LoginCard glowIntensity={typingIntensity}>
        
        {/* Header / Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
             <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </motion.div>
          
          <h1 className="text-3xl font-bold tracking-tight text-white/95">
            SIT Exam Mentor
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Secure connection established.
          </p>
        </div>

        {/* Global Alerts */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 font-medium">
            {error}
          </motion.div>
        )}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 font-medium">
            {message}
          </motion.div>
        )}

        {/* 3. Floating Inputs Form */}
        <form onSubmit={handleEmailAuth} className="space-y-1 relative z-20">
          <FloatingInput
            id="email"
            type="email"
            label="Email Address"
            icon={Mail}
            value={email}
            onChange={handleEmailChange}
            required
          />
          <FloatingInput
            id="password"
            type="password"
            label="Password"
            icon={Lock}
            value={password}
            onChange={handlePasswordChange}
            required
          />

          {/* 5. Login Button Animation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl
                       text-sm font-semibold text-white tracking-wide
                       bg-blue-600 hover:bg-blue-500
                       border border-blue-500 hover:border-blue-400
                       shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-300"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Initialize Profile' : 'Access System')}
          </motion.button>
        </form>

        <div className="mt-8 text-center z-20 relative">
           <button
             type="button"
             onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
             className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-medium"
           >
             {isSignUp ? 'Switch to Access System' : 'Request Profile Initialization'}
           </button>
        </div>

        {/* 4. AI Console Simulation */}
        <LiveConsole />
      </LoginCard>
    </div>
  );
}
