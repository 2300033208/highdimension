import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UploadCloud,
  SlidersHorizontal,
  BarChart3,
  Sparkles,
  LineChart,
  FileText,
  ShieldCheck,
  UserCircle2,
  Settings,
  BookOpen,
  ChevronLeft,
  Bell,
  Search,
  Activity,
  LogOut,
  Sun,
  Moon,
  Library,
  Book,
  PieChart,
  ListTree,
  Microscope,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { lazy, Suspense } from "react";

const ChatWidget = lazy(() => import("@/components/chat/ChatWidget").then((m) => ({ default: m.ChatWidget })));

const NAV_BASE = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Algorithm Explorer", to: "/algorithms", icon: Microscope },
  { label: "Experiment Repo", to: "/experiments", icon: ListTree },
  { label: "Benchmark Library", to: "/library", icon: Library },
  { label: "Benchmark Analytics", to: "/analytics", icon: PieChart },
  { label: "New Experiment", to: "/experiment/new", icon: SlidersHorizontal },
  { label: "Documentation", to: "/docs", icon: Book },
];

const NAV_ADMIN = { label: "Admin", to: "/admin", icon: ShieldCheck };

function getInitials(name?: string): string {
  if (!name || typeof name !== 'string') return "??";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const nav = isAdmin ? [...NAV_BASE, NAV_ADMIN] : NAV_BASE;

  // Check if a nav item is active or is a parent of the current route
  const isNavActive = (to: string, currentPath: string): boolean => {
    if (to === "/") return currentPath === "/";
    if (to === "/dashboard") return currentPath === "/dashboard";
    // Check exact match or if current path starts with nav path (for nested routes)
    return currentPath === to || currentPath.startsWith(to + "/");
  };

  const handleLogout = () => {
    navigate("/");
    // Delay clearing auth state to allow Framer Motion exit animations to complete safely
    setTimeout(() => {
      logout();
    }, 400);
  };

  const initials = user ? getInitials(user.name) : "??";

  return (
    <div className="relative h-screen flex bg-canvas overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden="true" />

      <motion.aside
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 hidden lg:flex flex-col shrink-0 border-r border-[var(--color-glass-border)] bg-[var(--color-surface)]/40 backdrop-blur-2xl sticky top-0 h-screen overflow-hidden"
      >
        <div className="flex items-center h-16 px-4 gap-2 border-b border-[var(--color-glass-border)]">
          <div className="flex h-12 w-12 items-center justify-center shrink-0 -ml-2 -my-1">
            <img src="/logo.jpg" alt="HyperBench Logo" className="h-full w-full object-contain mix-blend-screen" />
          </div>
          {!collapsed && <span className="font-semibold text-base truncate">HyperBench</span>}
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {nav.map((item) => {
            const active = isNavActive(item.to, location.pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group ${
                  active ? "text-ink bg-[var(--color-glass-active)]" : "text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent"
                  />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--color-glass-border)]">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
          >
            <UserCircle2 className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">Profile</span>}
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger/80 hover:text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-faint hover:text-ink hover:bg-[var(--color-glass-hover)] transition-colors"
          >
            <ChevronLeft className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      <div className="relative z-10 flex-1 min-w-0 flex flex-col h-screen">
        <TopBar initials={initials} theme={theme} toggleTheme={toggleTheme} userName={user?.name || ""} />
        <div className="flex-1 overflow-y-auto w-full no-scrollbar-adjust">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] w-full mx-auto">
            <Breadcrumb />
            <main id="main-content" className="space-y-4">
              {children}
            </main>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  );
}

function TopBar({ initials, theme, toggleTheme, userName }: { initials: string; theme: string; toggleTheme: () => void; userName: string }) {
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-[var(--color-glass-border)] h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          placeholder="Search experiments, datasets, algorithms…"
          className="h-10 w-full rounded-full bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] pl-10 pr-4 text-sm placeholder:text-ink-faint text-ink outline-none focus:border-accent/60 transition-colors"
        />
      </div>
      <div className="ml-auto flex items-center gap-3 relative">
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-glass-input)] hover:bg-[var(--color-glass-hover)] transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-ink-dim" /> : <Moon className="h-4 w-4 text-ink-dim" />}
        </button>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          aria-label="Toggle notifications"
          className="relative h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-glass-input)] hover:bg-[var(--color-glass-hover)] transition-colors"
        >
          <Bell className="h-4 w-4 text-ink-dim" />
        </button>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-12 w-80 card p-4 z-40"
          >
            <p className="text-sm text-ink-faint text-center py-6">No new notifications</p>
          </motion.div>
        )}
        <Link to="/profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent-soft flex items-center justify-center text-sm font-semibold text-white" title={userName}>
          {initials}
        </Link>
      </div>
    </header>
  );
}
