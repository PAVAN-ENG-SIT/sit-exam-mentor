// ─────────────────────────────────────────────────────────────
// Live Console AI Simulation — src/features/auth/components/LiveConsole.jsx
// Displays a fake terminal boot sequence using Framer Motion.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultLines = [
  "> Booting ExamMentor AI...",
  "> Initializing Vector Database...",
  "> Loading Embedding Model...",
  "> Checking User Credentials...",
  "> Awaiting Login Sequence..."
];

export default function LiveConsole() {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < defaultLines.length) {
        setLines((prev) => [...prev, defaultLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 700); // 700ms between each terminal line

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md p-5 pb-6 h-40 overflow-hidden font-mono text-xs sm:text-sm text-green-400 shadow-inner relative">
      <AnimatePresence>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-1.5"
          >
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className="absolute inline-block w-2.5 h-4 bg-green-400 translate-y-1 ml-1"
      />
    </div>
  );
}
