import { Link, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Activity, ChevronDown } from "lucide-react";

export type SectionId = "how-it-works" | "algorithms" | "research" | "about-us" | "contact-us";

export type NavPathSegment = "dashboard" | "upload" | "experiment" | "benchmark" | "recommendation" | "visualisations" | "reports" | "admin" | "profile" | "settings" | "research" | "algorithms" | "algorithms-id" | "experiments" | "library" | "analytics" | "insights-experimentId" | "docs" | "docs-section";

interface NavbarProps {
  onSectionClick?: (section: SectionId | null) => void;
  activeSection?: SectionId | null;
  activePath?: NavPathSegment | null;
}

const NAV_LINKS: {
  label: string;
  sectionId: SectionId | null;
  href: string;
  dropdown?: boolean;
}[] = [
  { label: "Home", sectionId: null, href: "/" },
  { label: "How It Works", sectionId: "how-it-works", href: "/#workflow", dropdown: true },
  { label: "Algorithms", sectionId: "algorithms", href: "/algorithms" },
  { label: "Research", sectionId: "research", href: "/research" },
  { label: "About Us", sectionId: "about-us", href: "/#about-us" },
  { label: "Contact", sectionId: "contact-us", href: "/#contact-us" },
];

export function Navbar({ onSectionClick, activeSection, activePath }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    link: (typeof NAV_LINKS)[number]
  ) => {
    // "Home" clears any active panel
    if (link.sectionId === null && onSectionClick) {
      if (link.href === "/") return; // Allow Link component to handle navigation
      onSectionClick(null);
      setMenuOpen(false);
      return;
    }

    // Section links → open glass panel
    if (link.sectionId && onSectionClick) {
      e.preventDefault();
      onSectionClick(link.sectionId);
      setMenuOpen(false);
      return;
    }
  };

  return (
    <header
      role="banner"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-nav-bg)] backdrop-blur-xl border-b border-[var(--color-glass-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full flex h-16 items-center justify-between px-6 sm:px-12">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-ink font-medium text-base"
          aria-label="HyperBench Home"
        >
          <div className="flex h-14 w-14 items-center justify-center shrink-0 -ml-2 -my-2">
            <img src="/logo.jpg" alt="HyperBench Logo" className="h-full w-full object-contain mix-blend-screen" />
          </div>
          <span className="text-xl">HyperBench</span>
        </Link>

        {/* Center nav pill — liquid glass */}
        <nav
          className="hidden md:flex liquid-glass items-center gap-4 lg:gap-8 rounded-2xl px-4 py-2"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={(e) => handleNavClick(e, link)}
              className={`flex items-center gap-1.5 px-4 lg:px-5 py-2.5 rounded-xl text-[15px] transition-colors font-medium ${
                activeSection === link.sectionId && link.sectionId !== null
                  ? "bg-[var(--color-glass-hover)] text-ink"
                  : link.sectionId === null && !activeSection
                  ? "bg-[var(--color-glass-hover)] text-ink"
                  : "text-ink-dim hover:text-ink"
              }`}
              aria-current={
                (link.sectionId === null && !activeSection) ||
                activeSection === link.sectionId
                  ? "page"
                  : undefined
              }
            >
              {link.label}
              {link.dropdown && (
                <ChevronDown size={13} className="mt-px" aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/?login=true">
            <button className="liquid-glass text-ink text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[var(--color-glass-hover)] transition-colors">
              Sign in
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-[var(--color-accent)] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:opacity-90 transition-colors">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden liquid-glass text-ink p-2 rounded-lg"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={18} aria-hidden="true" />
          ) : (
            <Menu size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-[72px] left-4 right-4 z-30 md:hidden liquid-glass rounded-2xl p-4 flex flex-col gap-1"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={(e) => handleNavClick(e, link)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors text-left"
            >
              {link.label}
              {link.dropdown && (
                <ChevronDown size={13} aria-hidden="true" />
              )}
            </button>
          ))}
          <div className="flex gap-2 mt-2 pt-3 border-t border-[var(--color-glass-border)]">
            <Link to="/?login=true" className="flex-1">
              <button className="w-full liquid-glass text-ink text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[var(--color-glass-hover)] transition-colors">
                Sign in
              </button>
            </Link>
            <Link to="/register" className="flex-1">
              <button className="w-full bg-[var(--color-accent)] text-white text-sm font-medium px-4 py-2.5 rounded-full hover:opacity-90 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
