import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

type Direction = "left" | "right" | "bottom";
type AnimState = "closed" | "entering" | "open" | "exiting";

interface GlassSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: Direction;
  title: string;
  labelId: string;
  children: React.ReactNode;
}

const DURATION = 620;
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function getOffscreenTransform(direction: Direction): string {
  switch (direction) {
    case "left":
      return "translate3d(-110%, 0, 0) scale(0.97)";
    case "right":
      return "translate3d(110%, 0, 0) scale(0.97)";
    case "bottom":
      return "translate3d(0, 110%, 0) scale(0.97)";
  }
}

export function GlassSectionModal({
  isOpen,
  onClose,
  direction,
  title,
  labelId,
  children,
}: GlassSectionModalProps) {
  const [animState, setAnimState] = useState<AnimState>("closed");
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const stableClose = useCallback(onClose, [onClose]);

  // Open / close transitions
  useEffect(() => {
    if (isOpen && animState === "closed") {
      previousFocus.current = document.activeElement as HTMLElement;
      setAnimState("entering");
      // Double rAF ensures the browser paints the off-screen state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState("open");
        });
      });
    } else if (!isOpen && (animState === "open" || animState === "entering")) {
      setAnimState("exiting");
      const timer = setTimeout(() => {
        setAnimState("closed");
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      }, DURATION);
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll
  useEffect(() => {
    if (animState !== "closed") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [animState]);

  // Focus management — move focus into panel & trap it
  useEffect(() => {
    if (animState !== "open" || !panelRef.current) return;

    const panel = panelRef.current;
    const getFocusable = () =>
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

    // Focus close button
    const els = getFocusable();
    if (els.length > 0) els[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stableClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [animState, stableClose]);

  if (animState === "closed") return null;

  const isVisible = animState === "open";
  const offscreen = getOffscreenTransform(direction);

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${DURATION}ms ${EASING}`,
        }}
        onClick={stableClose}
        aria-hidden="true"
      />

      {/* Panel container — centered with flexbox */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 sm:p-8 md:p-12 pt-20">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          className="pointer-events-auto flex flex-col"
          style={{
            width: "min(85vw, 1200px)",
            height: "clamp(480px, 80vh, 880px)",
            maxHeight: "90vh",
            background: "rgba(15, 17, 20, 0.38)",
            backdropFilter: "blur(40px) saturate(150%)",
            WebkitBackdropFilter: "blur(40px) saturate(150%)",
            border: "1px solid var(--color-glass-border)",
            borderRadius: "28px",
            boxShadow:
              "0 30px 100px var(--color-shadow-glass), 0 0 60px var(--color-shadow-glow), inset 0 1px 0 var(--color-glass-hover)",
            transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : offscreen,
            opacity: isVisible ? 1 : 0,
            transition: `transform ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--color-glass-border)] shrink-0">
            <h2
              id={labelId}
              className="text-lg sm:text-xl font-semibold text-ink"
            >
              {title}
            </h2>
            <button
              onClick={stableClose}
              aria-label="Close"
              className="h-9 w-9 rounded-full flex items-center justify-center text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
