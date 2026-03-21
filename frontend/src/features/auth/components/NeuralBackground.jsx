// ─────────────────────────────────────────────────────────────
// Neural Network Background — src/features/auth/components/NeuralBackground.jsx
// Animated background using tsParticles.
// Increases movement speed and line opacity based on typing intensity.
// ─────────────────────────────────────────────────────────────
import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function NeuralBackground({ typingIntensity = 0, isDark = true }) {
  // Initialize the tsParticles engine
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Compute dynamic options based on typing
  const options = useMemo(() => {
    // scale intensity from 0 (idle) to 1 (max typing)
    const normalizedIntensity = Math.min(Math.max(typingIntensity, 0), 1);
    const speed = 0.4 + normalizedIntensity * 1.5;
    const linkOpacity = 0.15 + normalizedIntensity * 0.4;
    const particleColor = isDark ? '#ffffff' : '#4f6ef7';
    const linkColor    = isDark ? '#ffffff' : '#4f6ef7';

    return {
      background: {
        color: { value: "transparent" },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: { distance: 140, links: { opacity: linkOpacity + 0.2 } },
        },
      },
      particles: {
        color: { value: particleColor },
        links: {
          color: linkColor,
          distance: 140,
          enable: true,
          opacity: linkOpacity,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: speed,
          direction: "none",
          random: true,
          straight: false,
          outModes: "out",
        },
        number: {
          density: { enable: true, area: 900 },
          value: 60,
        },
        opacity: { value: 0.2 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 2.5 } },
      },
      detectRetina: true,
    };
  }, [typingIntensity, isDark]);

  return (
    <div className={`absolute inset-0 w-full h-full z-0 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#f0f4ff]'}`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={options}
        className="w-full h-full opacity-60 pointer-events-none"
      />
    </div>
  );
}
