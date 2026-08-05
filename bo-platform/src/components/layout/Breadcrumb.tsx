import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component for displaying the current page's location
 * within the application hierarchy. Supports deep linking and route-param sync.
 *
 * @param items - Array of breadcrumb items. If not provided, derives from current path.
 * @param className - Additional CSS classes for styling customization.
 */
export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const location = useLocation();

  if (!items) {
    items = deriveBreadcrumbFromPath(location.pathname);
  }

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm text-neutral-400 ${className}`}
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRight
              size={14}
              className="text-neutral-600"
              aria-hidden="true"
            />
          )}

          {item.current ? (
            <span
              className="text-white/90 font-medium truncate"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link
              to={item.href}
              className="flex items-center gap-1.5 hover:text-white/80 transition-colors truncate"
            >
              {index === 0 && <Home size={14} className="shrink-0" aria-hidden="true" />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * Derive breadcrumb items from the current pathname.
 * Used when items prop is not provided.
 */
function deriveBreadcrumbFromPath(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    const label = formatSegmentLabel(segment, i, segments);
    const isLast = i === segments.length - 1;

    items.push({
      label,
      href: isLast ? currentPath : currentPath,
      current: isLast,
    });
  }

  return items;
}

/**
 * Format a URL segment into a human-readable label.
 */
function formatSegmentLabel(
  segment: string,
  index: number,
  allSegments: string[]
): string {
  // Handle special routes
  if (segment === "docs" && index === allSegments.length - 2) {
    return "Documentation";
  }
  if (segment === "experiments" && index === allSegments.length - 2) {
    return "Experiment Repository";
  }
  if (segment === "benchmarks" && index === allSegments.length - 2) {
    return "Benchmark Library";
  }

  // Handle ID segments (typically last segment after a route name)
  if (index > 0 && isLikelyId(segment)) {
    const parentSegment = allSegments[index - 1];
    if (parentSegment === "algorithms") return "Algorithm Details";
    if (parentSegment === "insights") return "Experiment Insights";
    return `#${segment.slice(0, 8)}`;
  }

  // Default: capitalize and replace hyphens
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if a string is likely an ID (UUID or alphanumeric identifier).
 */
function isLikelyId(value: string): boolean {
  // UUID pattern: 8-4-4-4-12 hex chars
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  // Alphanumeric ID: 6+ chars with mix of letters and numbers
  const alphanumericRegex = /^[a-z0-9]{6,}$/i;

  return uuidRegex.test(value) || alphanumericRegex.test(value);
}