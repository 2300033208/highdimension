import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "PLATFORM",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Benchmarks", href: "/benchmark" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Tutorials", href: "/docs/tutorials" },
    ],
  },
  {
    title: "RESEARCH",
    links: [
      { label: "Algorithms", href: "/algorithms" },
      { label: "Publications", href: "/research" },
      { label: "Datasets", href: "/library" },
    ],
  },
  {
    title: "PROJECT",
    links: [
      { label: "Architecture", href: "/#architecture" },
      { label: "Security", href: "/#security" },
      { label: "About", href: "/docs/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-24" role="contentinfo">
      <div className="container py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2.5 font-semibold mb-4" aria-label="HD-BO Bench Home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 border border-accent/30">
              <Activity className="h-4 w-4 text-accent-soft" aria-hidden="true" />
            </span>
            HD-BO Bench
          </Link>
          <p className="text-sm text-ink-dim max-w-xs leading-relaxed">
            A research-oriented benchmarking platform for high-dimensional Bayesian Optimization.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-ink-faint mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-ink-dim hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container py-6 border-t border-white/[0.06] text-center text-xs text-ink-faint">
        <span>© 2026 HD-BO Bench.</span>
      </div>
    </footer>
  );
}
