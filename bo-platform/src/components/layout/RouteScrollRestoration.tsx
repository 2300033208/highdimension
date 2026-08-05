import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Restores scroll position on back/forward navigation, and scrolls to the top
 * on forward (PUSH) navigation. Also honours `#hash` anchors by scrolling the
 * matching element into view.
 *
 * Scroll positions are stored in sessionStorage keyed by location key so a
 * page's scroll offset survives a reload within the same tab.
 */
const STORAGE_PREFIX = "hdbo:scroll:";

export function RouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const key = location.key;

    // Persist the outgoing scroll offset before the new page renders.
    return () => {
      if (key) {
        const offset = window.scrollY;
        positions.current.set(key, offset);
        try {
          sessionStorage.setItem(STORAGE_PREFIX + key, String(offset));
        } catch {
          /* storage may be unavailable (private mode / quota) */
        }
      }
    };
  }, [location.key]);

  useEffect(() => {
    // Deep-link anchors win over restoration.
    if (location.hash) {
      const id = location.hash.slice(1);
      // Wait a frame so the target page has mounted its content.
      const frame = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return () => cancelAnimationFrame(frame);
    }

    if (navigationType === "POP") {
      const stored =
        positions.current.get(location.key) ??
        (() => {
          try {
            const raw = sessionStorage.getItem(STORAGE_PREFIX + location.key);
            return raw === null ? null : Number(raw);
          } catch {
            return null;
          }
        })();

      if (stored !== null && stored !== undefined && !Number.isNaN(stored)) {
        const frame = requestAnimationFrame(() => {
          window.scrollTo({ top: stored, behavior: "auto" });
        });
        return () => cancelAnimationFrame(frame);
      }
    }

    // PUSH / REPLACE → start at the top.
    window.scrollTo({ top: 0, behavior: "auto" });
    return undefined;
  }, [location.key, location.hash, navigationType]);

  return null;
}
