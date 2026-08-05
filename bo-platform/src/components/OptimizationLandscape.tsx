import { motion } from "framer-motion";
import { useMemo } from "react";

// A signature visual: contour rings (surrogate model belief) with sample points
// converging toward a minimum, and an acquisition-function sweep line.
// This is the visual motif reused across hero, loading and empty states.
export function OptimizationLandscape({ className = "" }: { className?: string }) {
  const rings = useMemo(
    () =>
      [1, 0.82, 0.64, 0.47, 0.31, 0.18].map((r, i) => ({
        r: r * 210,
        opacity: 0.14 - i * 0.012,
        delay: i * 0.08,
      })),
    []
  );

  const samples = useMemo(() => {
    const pts: { x: number; y: number; delay: number; size: number }[] = [];
    const cx = 380, cy = 280;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + i * 0.7;
      const shrink = 1 - i / 22;
      const radius = 190 * shrink * (0.4 + Math.random() * 0.6);
      pts.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.62,
        delay: 0.4 + i * 0.09,
        size: 3 + (1 - shrink) * 5,
      });
    }
    return pts;
  }, []);

  return (
    <svg
      viewBox="0 0 760 560"
      className={className}
      role="img"
      aria-label="Animated Bayesian optimisation contour surface converging on a minimum"
    >
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5ac8fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5ac8fa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ring-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ac8fa" />
          <stop offset="100%" stopColor="#0a84ff" />
        </linearGradient>
      </defs>

      {/* dot grid backdrop */}
      {Array.from({ length: 12 }).map((_, row) =>
        Array.from({ length: 16 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 48}
            cy={20 + row * 48}
            r={1}
            fill="rgba(255,255,255,0.06)"
          />
        ))
      )}

      {/* contour rings representing surrogate model uncertainty collapsing */}
      {rings.map((ring, i) => (
        <motion.ellipse
          key={i}
          cx={380}
          cy={280}
          rx={ring.r}
          ry={ring.r * 0.62}
          fill="none"
          stroke="url(#ring-stroke)"
          strokeWidth={1}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: ring.opacity, scale: 1 }}
          transition={{ duration: 1.4, delay: ring.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <circle cx={380} cy={280} r={90} fill="url(#core-glow)" opacity={0.5} />

      {/* sampled evaluation points converging toward the optimum */}
      {samples.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={i % 4 === 0 ? "#0a84ff" : "#f5f5f7"}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 0.5, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      {/* the located optimum */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2.1, type: "spring", stiffness: 200, damping: 14 }}
      >
        <circle cx={380} cy={280} r={7} fill="#0a84ff" />
        <motion.circle
          cx={380}
          cy={280}
          r={7}
          fill="none"
          stroke="#0a84ff"
          strokeWidth={1.5}
          animate={{ r: [7, 26, 7], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
        />
      </motion.g>
    </svg>
  );
}
