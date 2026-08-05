/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate"
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1360px" },
    },
    extend: {
      fontFamily: {
        display: ["'Manrope'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["'Manrope'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        canvas: "var(--color-canvas)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          border: "var(--color-surface-border)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          dim: "var(--color-ink-dim)",
          faint: "var(--color-ink-faint)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          soft: "var(--color-accent-soft)",
          dim: "var(--color-accent-dim)",
        },
        success: "var(--color-success)",
        warn: "var(--color-warn)",
        danger: "var(--color-danger)",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px var(--color-shadow-glass)",
        glow: "0 0 40px var(--color-shadow-glow)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: 0.5 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.8s infinite linear",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
