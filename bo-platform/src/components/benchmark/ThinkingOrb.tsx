import { Brain, Zap, Circle } from "lucide-react";
import { motion } from "framer-motion";

interface ThinkingOrbProps {
  /** Size in pixels (default 64) */
  size?: number;
  /** Variant: 'brain' | 'zap' | 'pulse' */
  variant?: "brain" | "zap" | "pulse";
  /** Custom className */
  className?: string;
  /** Show orbiting particles */
  orbiting?: boolean;
  /** Override the icon color */
  iconColor?: string;
}

/**
 * Glassmorphism "thinking" orb with animated glow and optional orbiting particles.
 * Uses your semantic CSS variables (--color-accent, --color-glass-*, --color-shadow-glow)
 * and Tailwind animations (animate-spin, animate-pulse-glow).
 */
export function ThinkingOrb({
  size = 64,
  variant = "brain",
  className = "",
  orbiting = true,
  iconColor,
}: ThinkingOrbProps) {
  const Icon = variant === "zap" ? Zap : variant === "pulse" ? Circle : Brain;

  const iconColors: Record<string, string> = {
    brain: "var(--color-accent)",
    zap: "var(--color-warn)",
    pulse: "var(--color-accent-soft)",
  };

  const activeColor = iconColor || iconColors[variant];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Benchmark processing"
    >
      {/* Rotating gradient border ring */}
      {orbiting && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] p-[1px] bg-gradient-to-r
            from-[var(--color-accent)] via-[var(--color-accent-soft)] to-[var(--color-accent)]
            opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ borderRadius: "inherit" }}
          aria-hidden="true"
        />
      )}

      {/* Inner pulse glow background */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] bg-[var(--color-glass-bg)]
          animate-pulse-glow"
        style={{
          borderRadius: "inherit",
          boxShadow: "0 0 40px var(--color-shadow-glow)",
        }}
        aria-hidden="true"
      />

      {/* Orbiting particles */}
      {orbiting && [
        { delay: 0, duration: 10, radius: size * 0.55 },
        { delay: 1.5, duration: 14, radius: size * 0.65 },
        { delay: 3, duration: 18, radius: size * 0.45 },
      ].map((orbit, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{
            duration: orbit.duration,
            delay: orbit.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          aria-hidden="true"
        >
          <div
            className="rounded-full bg-[var(--color-accent)]/60"
            style={{
              width: size * 0.08,
              height: size * 0.08,
              transformOrigin: `center ${orbit.radius}px`,
              transform: `translateX(${orbit.radius}px)`,
            }}
          />
        </motion.div>
      ))}

      {/* Central icon */}
      <div
        className="relative z-10 flex items-center justify-center rounded-[inherit]
          bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)]"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: "inherit",
        }}
      >
        <Icon
          size={size * 0.35}
          className="text-[var(--color-accent)] drop-shadow-[0_0_8px_var(--color-shadow-glow)]"
          style={{ color: activeColor }}
          aria-hidden="true"
        />
      </div>

      {/* Subtle radar rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute inset-0 rounded-[inherit] border border-[var(--color-accent)]/30"
          style={{ borderRadius: "inherit" }}
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Convenience variant for inline/small usage */
export function MiniThinkingOrb({ variant = "brain", className = "" }: Omit<ThinkingOrbProps, "size" | "orbiting">) {
  return <ThinkingOrb size={32} variant={variant} orbiting={false} className={className} />;
}

export type { ThinkingOrbProps };