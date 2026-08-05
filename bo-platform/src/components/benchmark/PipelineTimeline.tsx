import { CheckCircle, Clock, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingOrb } from "./ThinkingOrb";

export type StageStatus = "pending" | "running" | "complete" | "error";

export interface PipelineStage {
  id: string;
  label: string;
  description?: string;
  /** Optional live progress (0-100) for running stages */
  progress?: number;
  /** Optional iteration info for running stages */
  iteration?: { current: number; total: number };
  /** Optional live metric (e.g., best value so far) */
  liveMetric?: { label: string; value: string; trend?: "up" | "down" };
}

export interface PipelineTimelineProps {
  stages: PipelineStage[];
  /** Currently active stage index */
  activeIndex?: number;
  /** Overall progress 0-100 */
  overallProgress?: number;
  /** Estimated time remaining string */
  estimatedTime?: string;
  /** Compact mode (smaller, no descriptions) */
  compact?: boolean;
  /** Show connector line between stages */
  showConnector?: boolean;
  /** Custom className */
  className?: string;
}

/** Individual stage row with animated transitions */
export function StageRow({
  stage,
  index,
  status,
  isActive,
  compact = false,
  showConnector = true,
}: {
  stage: PipelineStage;
  index: number;
  status: StageStatus;
  isActive: boolean;
  compact?: boolean;
  showConnector?: boolean;
}) {
  const statusConfig = {
    pending: {
      icon: Clock,
      iconClass: "text-ink-faint",
      bgClass: "bg-[var(--color-glass-bg)]",
      borderClass: "border-[var(--color-glass-border)]",
      textClass: "text-ink-dim",
      label: "Queued",
    },
    running: {
      icon: Loader2,
      iconClass: "text-[var(--color-accent)] animate-spin",
      bgClass: "bg-[var(--color-glass-hover)] border-[var(--color-accent)]/30",
      borderClass: "border-[var(--color-accent)]/30",
      textClass: "text-ink",
      label: "Running",
    },
    complete: {
      icon: CheckCircle,
      iconClass: "text-[var(--color-success)]",
      bgClass: "bg-[var(--color-glass-bg)] border-[var(--color-success)]/20",
      borderClass: "border-[var(--color-success)]/20",
      textClass: "text-ink-dim",
      label: "Complete",
    },
    error: {
      icon: AlertCircle,
      iconClass: "text-[var(--color-danger)]",
      bgClass: "bg-[var(--color-glass-bg)] border-[var(--color-danger)]/20",
      borderClass: "border-[var(--color-danger)]/20",
      textClass: "text-ink-dim",
      label: "Error",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <motion.div
      layout
      className={`relative flex items-start gap-4 transition-all duration-300 ${
        compact ? "py-2" : "py-3"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Connector line */}
      {showConnector && index > 0 && (
        <motion.div
          className="absolute left-5 top-0 bottom-0 w-0.5"
          style={{
            background: `linear-gradient(var(--color-glass-border), var(--color-glass-border))`,
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
        />
      )}

      {/* Status indicator column */}
      <div className="relative flex flex-col items-center shrink-0" style={{ width: 40 }}>
        {/* Status icon with animated background */}
        <motion.div
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-300 ${statusConfig.bgClass} ${statusConfig.borderClass}`}
          animate={{
            scale: isActive && status === "running" ? 1.1 : 1,
            boxShadow: isActive && status === "running"
              ? "0 0 20px var(--color-shadow-glow)"
              : "none",
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={`h-5 w-5 ${statusConfig.iconClass}`} aria-hidden="true" />

          {/* Progress ring for running stages */}
          {status === "running" && stage.progress !== undefined && (
            <svg className="absolute -inset-1" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--color-glass-border)"
                strokeWidth="3"
              />
              <motion.circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={113.1}
                strokeDashoffset={113.1 * (1 - stage.progress / 100)}
                transform="rotate(-90 22 22)"
                style={{ filter: "drop-shadow(0 0 4px var(--color-shadow-glow))" }}
                animate={{ strokeDashoffset: 113.1 * (1 - stage.progress / 100) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
          )}

          {/* Checkmark draw animation for complete */}
          {status === "complete" && (
            <motion.path
              d="M9 16l2 2 4-4"
              stroke="var(--color-success)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            />
          )}
        </motion.div>

        {/* Step number */}
        <span className="mt-1.5 text-[10px] font-mono font-semibold text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <motion.h4
            className={`font-medium truncate ${statusConfig.textClass}`}
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {stage.label}
          </motion.h4>

          <motion.span
            className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-glass-bg)] border-[var(--color-glass-border)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={status}
          >
            {statusConfig.label}
          </motion.span>
        </div>

        {!compact && stage.description && (
          <motion.p
            className="mt-1 text-sm text-ink-faint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {stage.description}
          </motion.p>
        )}

        {/* Live progress bar for running stage */}
        {status === "running" && stage.progress !== undefined && !compact && (
          <motion.div
            className="mt-3 h-1.5 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)]"
              style={{ filter: "drop-shadow(0 0 6px var(--color-shadow-glow))" }}
              initial={{ width: 0 }}
              animate={{ width: `${stage.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {/* Iteration counter + live metric */}
        {(status === "running" || status === "complete") && !compact && (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-faint">
            {stage.iteration && (
              <span className="flex items-center gap-1 font-mono">
                <Loader2 className="h-3 w-3 animate-spin text-[var(--color-accent)]" />
                Iteration {stage.iteration.current.toLocaleString()} / {stage.iteration.total.toLocaleString()}
              </span>
            )}
            {stage.liveMetric && (
              <motion.span
                className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] ${stage.liveMetric.trend === "up" ? "text-[var(--color-success)]" : stage.liveMetric.trend === "down" ? "text-[var(--color-danger)]" : ""}`}
                key={stage.liveMetric.value}
                layout
              >
                <span>{stage.liveMetric.label}:</span>
                <span className="font-mono font-medium text-ink">{stage.liveMetric.value}</span>
                {stage.liveMetric.trend && (
                  <span className="text-[10px]">
                    {stage.liveMetric.trend === "up" ? "▲" : "▼"}
                  </span>
                )}
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Chevron / expand indicator */}
      {!compact && (
        <motion.div
          className="flex items-center justify-center w-8 text-ink-faint"
          animate={{ rotate: isActive && status === "running" ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={16} />
        </motion.div>
      )}
    </motion.div>
  );
}

export function PipelineTimeline({
  stages,
  activeIndex = 0,
  overallProgress,
  estimatedTime,
  compact = false,
  showConnector = true,
  className = "",
}: PipelineTimelineProps) {
  const stageStatuses = stages.map((_, i) => {
    if (i < activeIndex) return "complete" as StageStatus;
    if (i === activeIndex) return "running" as StageStatus;
    return "pending" as StageStatus;
  });

  return (
    <div className={`space-y-1 ${className}`} role="status" aria-live="polite">
      {/* Overall progress header */}
      {(overallProgress !== undefined || estimatedTime) && (
        <motion.div
          className="mb-4 p-4 rounded-xl bg-[var(--color-glass-bg)] border-[var(--color-glass-border)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Overall Progress</span>
            <span className="text-sm font-mono font-semibold text-[var(--color-accent)]">
              {overallProgress !== undefined ? `${Math.round(overallProgress)}%` : "—"}
            </span>
          </div>

          {overallProgress !== undefined && (
            <div className="h-2 rounded-full bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-soft)] to-[var(--color-accent)]"
                style={{ filter: "drop-shadow(0 0 8px var(--color-shadow-glow))" }}
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )}

          {estimatedTime && (
            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-ink-dim">
              <Clock size={12} />
              <span>Estimated: {estimatedTime}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Stage rows */}
      <AnimatePresence mode="popLayout">
        {stages.map((stage, index) => (
          <StageRow
            key={stage.id}
            stage={stage}
            index={index}
            status={stageStatuses[index]}
            isActive={index === activeIndex}
            compact={compact}
            showConnector={showConnector}
          />
        ))}
      </AnimatePresence>

      {/* Mini thinking orb at bottom when running */}
      {activeIndex < stages.length && stageStatuses[activeIndex] === "running" && (
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThinkingOrb size={48} variant="brain" orbiting={true} />
        </motion.div>
      )}
    </div>
  );
}

/** Predefined pipeline stages for standard benchmark runs */
export const STANDARD_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "validate",
    label: "Validate Dataset",
    description: "Check dimensions, types, missing values, and bounds",
  },
  {
    id: "configure",
    label: "Configure Problem",
    description: "Encode variables, define search space, set objective",
  },
  {
    id: "analyze",
    label: "AI Analysis",
    description: "Analyze landscape, dimensionality, and problem characteristics",
  },
  {
    id: "recommend",
    label: "Algorithm Recommendation",
    description: "Meta-learner selects optimal algorithms for your problem",
  },
  {
    id: "execute",
    label: "Execute Benchmark",
    description: "Run selected algorithms with live convergence tracking",
  },
  {
    id: "compare",
    label: "Compare Results",
    description: "Aggregate metrics, statistical tests, rank algorithms",
  },
  {
    id: "report",
    label: "Generate Report",
    description: "Create structured benchmark report with visualizations",
  },
];