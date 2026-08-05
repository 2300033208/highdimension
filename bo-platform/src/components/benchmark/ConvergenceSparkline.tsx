import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export interface ConvergencePoint {
  iteration: number;
  value: number;
  /** Optional best-so-far value */
  bestValue?: number;
  /** Optional timestamp for time-based x-axis */
  timestamp?: number;
}

export interface ConvergenceSeries {
  id: string;
  label: string;
  color: string; // semantic color variable name (e.g., "var(--color-accent)")
  data: ConvergencePoint[];
  /** Line style variant */
  style?: "solid" | "dashed" | "dotted";
}

export interface ConvergenceSparklineProps {
  /** Array of series to plot */
  series: ConvergenceSeries[];
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show axes and labels */
  showAxes?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Minimization (lower is better) or maximization */
  direction?: "minimize" | "maximize";
  /** Animate on mount */
  animated?: boolean;
  /** Custom className */
  className?: string;
  /** Compact mode (no axes, minimal) */
  compact?: boolean;
  /** Reference lines (e.g., known optimum) */
  referenceLines?: { value: number; label: string; color: string }[];
}

/**
 * SVG path generator for smooth curves using cubic bezier
 */
function generateSmoothPath(points: { x: number; y: number }[], tension = 0.4): string {
  if (points.length < 2) return "";

  const path = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];

    // Control points for smooth curve
    const cp1x = p0.x + (p1.x - p0.x) * tension;
    const cp1y = p0.y;
    const cp2x = p1.x - (p1.x - p0.x) * tension;
    const cp2y = p1.y;

    path.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`);
  }

  return path.join(" ");
}

/**
 * Generate simple linear path
 */
function generateLinearPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

/**
 * Scale data points to SVG coordinates
 */
function scalePoints(
  data: ConvergencePoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  direction: "minimize" | "maximize"
): { x: number; y: number; bestX?: number; bestY?: number; originalValue: number; originalBestValue?: number }[] {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (data.length === 0) return [];

  const xValues = data.map((d) => d.iteration);
  const yValues = data.map((d) => d.value);
  const bestYValues = data.map((d) => d.bestValue ?? d.value);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues, ...bestYValues);
  const yMax = Math.max(...yValues, ...bestYValues);

  // Add small padding to avoid clipping
  const yRange = yMax - yMin || 1;
  const yPad = yRange * 0.05;

  return data.map((point, i) => {
    const x = padding.left + ((point.iteration - xMin) / (xMax - xMin || 1)) * innerWidth;

    // For minimize: lower value = higher on chart (smaller y)
    // For maximize: higher value = higher on chart
    const normalizedY = direction === "minimize"
      ? (point.value - (yMin - yPad)) / (yRange + yPad * 2)
      : ((yMax + yPad) - point.value) / (yRange + yPad * 2);

    const y = padding.top + normalizedY * innerHeight;

    // Best-so-far position
    let bestX: number | undefined;
    let bestY: number | undefined;
    if (point.bestValue !== undefined) {
      bestX = x;
      const normalizedBestY = direction === "minimize"
        ? (point.bestValue - (yMin - yPad)) / (yRange + yPad * 2)
        : ((yMax + yPad) - point.bestValue) / (yRange + yPad * 2);
      bestY = padding.top + normalizedBestY * innerHeight;
    }

    return { x, y, bestX, bestY, originalValue: point.value, originalBestValue: point.bestValue };
  });
}

export function ConvergenceSparkline({
  series,
  width = 400,
  height = 200,
  showAxes = true,
  showLegend = true,
  showTooltip = true,
  xLabel = "Iteration",
  yLabel = "Objective Value",
  direction = "minimize",
  animated = true,
  className = "",
  compact = false,
  referenceLines = [],
}: ConvergenceSparklineProps) {
  const padding = compact
    ? { top: 8, right: 8, bottom: 8, left: 8 }
    : { top: 24, right: showLegend ? 120 : 16, bottom: showAxes ? 40 : 16, left: showAxes ? 50 : 16 };

  // Compute all scaled points for all series
  const allScaledPoints = series.map((s) => ({
    series: s,
    points: scalePoints(s.data, width, height, padding, direction),
  }));

  // Find overall min/max for axes
  const allPoints = allScaledPoints.flatMap((sp) => sp.points);
  const allYValues = allPoints.map((p) => p.originalValue);
  const allBestYValues = allPoints.filter((p) => p.originalBestValue !== undefined).map((p) => p.originalBestValue!);
  const allY = [...allYValues, ...allBestYValues];
  const yMin = allY.length > 0 ? Math.min(...allY) : 0;
  const yMax = allY.length > 0 ? Math.max(...allY) : 1;
  const yRange = yMax - yMin || 1;

  // Tooltip state
  let tooltipContent: React.ReactNode = null;
  let tooltipPosition = { x: 0, y: 0, visible: false };

  // We'll use a simpler approach - CSS-based tooltip via title or a separate component
  // For now, skip complex tooltip to keep it clean

  return (
    <div className={`relative ${className}`} style={{ width, height }} role="img" aria-label="Convergence chart">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ fontFamily: "inherit" }}
      >
        <defs>
          {/* Gradient definitions for lines */}
          {allScaledPoints.map(({ series }) => (
            <linearGradient
              key={`grad-${series.id}`}
              id={`grad-${series.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={series.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={series.color} stopOpacity="1" />
            </linearGradient>
          ))}

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dashed pattern */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>

        {/* Background grid */}
        {showAxes && !compact && (
          <g className="grid-lines" stroke="var(--color-glass-border)" strokeWidth="0.5" opacity="0.5">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = padding.top + frac * (height - padding.top - padding.bottom);
              return (
                <line
                  key={frac}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Vertical grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const x = padding.left + frac * (width - padding.left - padding.right);
              return (
                <line
                  key={frac}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>
        )}

        {/* Reference lines */}
        {referenceLines.map((ref, i) => {
          const normalizedY = direction === "minimize"
            ? (ref.value - yMin) / yRange
            : (yMax - ref.value) / yRange;
          const y = padding.top + (1 - normalizedY) * (height - padding.top - padding.bottom);

          return (
            <g key={`ref-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={ref.color}
                strokeWidth="1"
                strokeDasharray="6 4"
                opacity="0.7"
              />
              <text
                x={width - padding.right - 4}
                y={y - 4}
                fontSize="10"
                fill={ref.color}
                textAnchor="end"
                fontFamily="monospace"
              >
                {ref.label}
              </text>
            </g>
          );
        })}

        {/* Series paths */}
        <g className="series-group">
          {allScaledPoints.map(({ series, points }) => {
            if (points.length < 2) return null;

            const pathData = series.style === "solid"
              ? generateSmoothPath(points.map((p) => ({ x: p.x, y: p.y })))
              : generateLinearPath(points.map((p) => ({ x: p.x, y: p.y })));

            const dashArray = series.style === "dashed" ? "6 4" : series.style === "dotted" ? "2 4" : "none";

            return (
              <g key={series.id} className="series">
                {/* Main line */}
                <motion.path
                  d={pathData}
                  stroke={`url(#grad-${series.id})`}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={dashArray}
                  filter="url(#glow)"
                  initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Best-so-far line (if available) */}
                {points.some((p) => p.bestX !== undefined && p.bestY !== undefined) && (
                  <>
                    <motion.path
                      d={generateSmoothPath(
                        points
                          .filter((p) => p.bestX !== undefined && p.bestY !== undefined)
                          .map((p) => ({ x: p.bestX!, y: p.bestY! }))
                      )}
                      stroke={series.color}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray="4 3"
                      opacity={0.7}
                      initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {/* Best-so-far markers */}
                    <AnimatePresence>
                      {points
                        .filter((p) => p.bestX !== undefined && p.bestY !== undefined)
                        .map((p, idx) => (
                          <motion.circle
                            key={idx}
                            cx={p.bestX!}
                            cy={p.bestY!}
                            r={3.5}
                            fill="var(--color-canvas)"
                            stroke={series.color}
                            strokeWidth={2}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          />
                        ))}
                    </AnimatePresence>
                  </>
                )}

                {/* Data point markers on hover/tracking */}
                <AnimatePresence>
                  {points.map((p, idx) => (
                    <motion.circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={animated ? 0 : 3}
                      fill={series.color}
                      stroke="var(--color-canvas)"
                      strokeWidth={1.5}
                      opacity={0}
                      className="data-point"
                      style={{ transition: "opacity 0.2s, r 0.2s" }}
                      onMouseEnter={() => {
                        // Hover effect handled via CSS
                      }}
                      initial={animated ? { r: 0, opacity: 0 } : { r: 3, opacity: 0 }}
                      animate={{ r: 3, opacity: 0 }}
                      exit={{ r: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </AnimatePresence>
              </g>
            );
          })}
        </g>

        {/* Axes */}
        {showAxes && !compact && (
          <g className="axes" stroke="var(--color-glass-border)" strokeWidth="1">
            {/* Y axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
            />
            {/* X axis */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
            />

            {/* Y axis ticks and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const y = padding.top + frac * (height - padding.top - padding.bottom);
              const value = direction === "minimize"
                ? yMin + (1 - frac) * yRange
                : yMin + frac * yRange;
              return (
                <g key={`ytick-${frac}`}>
                  <line
                    x1={padding.left - 4}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fontSize="10"
                    fill="var(--color-ink-dim)"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {value.toFixed(value >= 100 ? 0 : value >= 1 ? 2 : 4)}
                  </text>
                </g>
              );
            })}

            {/* X axis ticks and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
              const x = padding.left + frac * (width - padding.left - padding.right);
              // Use actual iteration values
              const iterations = allScaledPoints[0]?.points.map((p) => p.x) || [];
              const minIter = allPoints[0]?.originalValue !== undefined
                ? series[0]?.data[0]?.iteration || 0
                : 0;
              const maxIter = series[0]?.data[series[0].data.length - 1]?.iteration || 100;
              const iterValue = Math.round(minIter + frac * (maxIter - minIter));
              return (
                <g key={`xtick-${frac}`}>
                  <line
                    x1={x}
                    y1={height - padding.bottom}
                    x2={x}
                    y2={height - padding.bottom + 4}
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 16}
                    fontSize="10"
                    fill="var(--color-ink-dim)"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {iterValue.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Axis labels */}
        {showAxes && !compact && (
          <>
            {/* Y label */}
            <text
              x={12}
              y={height / 2}
              fontSize="11"
              fill="var(--color-ink-dim)"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(-90, 12, ${height / 2})`}
              fontWeight="500"
            >
              {yLabel}
            </text>
            {/* X label */}
            <text
              x={width / 2}
              y={height - 8}
              fontSize="11"
              fill="var(--color-ink-dim)"
              textAnchor="middle"
              fontWeight="500"
            >
              {xLabel}
            </text>
          </>
        )}

        {/* Current best indicator (latest point) */}
        {allScaledPoints.map(({ series, points }) => {
          const lastPoint = points[points.length - 1];
          if (!lastPoint) return null;

          return (
            <g key={`current-${series.id}`}>
              {/* Current value marker */}
              <motion.circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={5}
                fill={series.color}
                stroke="var(--color-canvas)"
                strokeWidth={2}
                initial={animated ? { scale: 0 } : { scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Best-so-far indicator */}
              {lastPoint.bestX !== undefined && lastPoint.bestY !== undefined && (
                <motion.circle
                  cx={lastPoint.bestX}
                  cy={lastPoint.bestY}
                  r={6}
                  fill="transparent"
                  stroke={series.color}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Trend indicator */}
              {points.length >= 2 && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <text
                    x={lastPoint.x + 12}
                    y={lastPoint.y - 12}
                    fontSize="10"
                    fill={series.color}
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {lastPoint.originalValue.toFixed(4)}
                  </text>
                  {lastPoint.originalBestValue !== undefined && (
                    <text
                      x={lastPoint.bestX! + 12}
                      y={lastPoint.bestY! + 20}
                      fontSize="9"
                      fill={series.color}
                      opacity={0.8}
                      fontFamily="monospace"
                    >
                      best: {lastPoint.originalBestValue.toFixed(4)}
                    </text>
                  )}
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && !compact && series.length > 0 && (
        <div
          className="absolute top-0 right-0 mt-2 mr-2"
          style={{ maxWidth: padding.right - 8 }}
        >
          <div className="flex flex-col gap-1.5">
            {series.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="h-2 w-6 rounded"
                  style={{
                    background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                    border: `1px solid ${s.color}40`,
                  }}
                />
                <span className="text-xs text-ink truncate" style={{ maxWidth: "100px" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mini sparkline for inline use in tables/cards
 */
export interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  direction?: "minimize" | "maximize";
  showBest?: boolean;
  bestValue?: number;
  className?: string;
}

export function MiniSparkline({
  data,
  width = 120,
  height = 32,
  color = "var(--color-accent)",
  direction = "minimize",
  showBest = true,
  bestValue,
  className = "",
}: MiniSparklineProps) {
  if (data.length < 2) return <div className={className} style={{ width, height }} />;

  const padding = { top: 2, right: 2, bottom: 2, left: 2 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerWidth;
    const normalized = direction === "minimize"
      ? (value - min) / range
      : (max - value) / range;
    const y = padding.top + (1 - normalized) * innerHeight;
    return { x, y, value };
  });

  const pathData = generateSmoothPath(points);
  const computedBest = showBest ? (bestValue ?? (direction === "minimize" ? min : max)) : undefined;
  const bestIndex = showBest ? data.indexOf(computedBest!) : -1;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="mini-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`${pathData} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
          fill="url(#mini-grad)"
          opacity={0.3}
        />

        {/* Line */}
        <motion.path
          d={pathData}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Best point marker */}
        {showBest && bestIndex >= 0 && (
          <motion.circle
            cx={points[bestIndex].x}
            cy={points[bestIndex].y}
            r={3}
            fill={color}
            stroke="var(--color-canvas)"
            strokeWidth={1.5}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Current point marker */}
        <motion.circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
          stroke="var(--color-canvas)"
          strokeWidth={1}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Inline value */}
      <div className="absolute bottom-0 right-0 text-[9px] font-mono text-ink-faint">
        {data[data.length - 1].toFixed(4)}
      </div>
    </div>
  );
}

/**
 * Generate mock convergence data for testing
 */
export function generateMockConvergenceData(
  iterations: number,
  startValue: number,
  optimumValue: number,
  noise: number = 0.1
): ConvergencePoint[] {
  const data: ConvergencePoint[] = [];
  let currentBest = startValue;

  for (let i = 1; i <= iterations; i++) {
    // Simulate convergence with noise
    const progress = i / iterations;
    const theoretical = startValue - (startValue - optimumValue) * Math.pow(progress, 0.7);
    const noiseFactor = (Math.random() - 0.5) * 2 * noise * (startValue - optimumValue) * (1 - progress * 0.5);
    const value = theoretical + noiseFactor;

    currentBest = direction === "minimize" ? Math.min(currentBest, value) : Math.max(currentBest, value);

    data.push({
      iteration: i,
      value,
      bestValue: currentBest,
    });
  }

  return data;
}

// Default direction for mock generator
const direction = "minimize";