// ─────────────────────────────────────────────────────────────
// Glassmorphism Login Card — src/features/auth/components/LoginCard.jsx
// Wraps the main login form in an animated, glowing container.
// ─────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';

export default function LoginCard({ children, glowIntensity = 0, isDark = true }) {
  // Map typing intensity (0 to 1) to a pixel radius and opacity for the glow effect
  const blurRadius = 15 + glowIntensity * 50;
  const opacity = 0.05 + glowIntensity * 0.25;
  const glowColor = `rgba(59, 130, 246, ${opacity})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full max-w-md z-10"
    >
      {/* Background glow that reacts to typing */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 ${blurRadius}px ${glowColor}, inset 0 0 20px rgba(255,255,255,0.02)`
        }}
      />

      {/* The Glassmorphism Card — dark or light variant */}
      <div className={`relative backdrop-blur-2xl rounded-2xl p-8 sm:p-10 overflow-hidden transition-colors duration-300
        ${isDark
          ? 'bg-black/50 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]'
          : 'bg-white/80 border border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.12)]'
        }`}
      >
        {/* Subtle top glare */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent
          ${isDark ? 'via-white/20' : 'via-blue-300/40'}`} />
        {children}
      </div>
    </motion.div>
  );
}
