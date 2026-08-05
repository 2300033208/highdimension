import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  FileText,
  Clock,
  Zap,
  Brain,
  TrendingDown,
  Terminal,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { PipelineTimeline, STANDARD_PIPELINE_STAGES, PipelineStage } from "./PipelineTimeline";
import { ConvergenceSparkline, ConvergenceSeries, generateMockConvergenceData } from "./ConvergenceSparkline";
import { ThinkingOrb, MiniThinkingOrb } from "./ThinkingOrb";
import { useBenchmarkJob, BenchmarkJobConfig, BenchmarkJobStatus, AlgorithmProgress } from "@/hooks/useBenchmarkJob";

export interface BenchmarkExecutionViewProps {
  /** Initial job config (used if no jobId provided) */
  initialConfig?: BenchmarkJobConfig;
  /** Existing job ID to monitor */
  jobId?: string | null;
  /** Callback when job completes */
  onComplete?: (status: BenchmarkJobStatus) => void;
  /** Callback when job fails */
  onError?: (error: string) => void;
  /** Read-only mode (view only) */
  readOnly?: boolean;
  /** Compact mode for embedding */
  compact?: boolean;
}

interface AlgorithmCardProps {
  algorithm: AlgorithmProgress;
  isActive: boolean;
  onSelect: () => void;
  selectedAlgorithmId: string | null;
  compact?: boolean;
}

function AlgorithmCard({
  algorithm,
  isActive,
  onSelect,
  selectedAlgorithmId,
  compact = false,
}: AlgorithmCardProps) {
  const isSelected = selectedAlgorithmId === algorithm.algorithmId;
  const statusColors = {
    pending: { bg: "bg-[var(--color-glass-bg)]", border: "border-[var(--color-glass-border)]", text: "text-ink-dim", icon: "text-ink-faint" },
    running: { bg: "bg-[var(--color-glass-hover)]", border: "border-[var(--color-accent)]/30", text: "text-ink", icon: "text-[var(--color-accent)]" },
    complete: { bg: "bg-[var(--color-glass-bg)]", border: "border-[var(--color-success)]/20", text: "text-ink-dim", icon: "text-[var(--color-success)]" },
    error: { bg: "bg-[var(--color-glass-bg)]", border: "border-[var(--color-danger)]/20", text: "text-ink-dim", icon: "text-[var(--color-danger)]" },
  };

  const statusConfig = statusColors[algorithm.status];
  const StatusIcon = algorithm.status === "running" ? Loader2 : algorithm.status === "complete" ? CheckCircle : AlertCircle;

  return (
    <motion.div
      layout
      className={`relative rounded-xl p-4 transition-all duration-300 cursor-pointer ${statusConfig.bg} ${statusConfig.border} ${isSelected ? "ring-2 ring-[var(--color-accent)]" : ""} ${compact ? "p-3" : ""}`}
      onClick={onSelect}
      whileHover={{ y: -2, boxShadow: "var(--color-shadow-glass)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold tracking-[0.1em] uppercase ${statusConfig.text}`}>
              {algorithm.status.toUpperCase()}
            </span>
            {isActive && algorithm.status === "running" && (
              <motion.span className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-accent)]">
                <Loader2 size={10} className="animate-spin" />
                LIVE
              </motion.span>
            )}
          </div>
          <h4 className={`font-medium truncate ${statusConfig.text}`}>{algorithm.algorithmName}</h4>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={`h-4 w-4 ${statusConfig.icon}` + (algorithm.status === "running" ? " animate-spin" : "")} />
        </div>
      </div>

      {!compact && (
        <>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-soft)]"
              style={{ filter: "drop-shadow(0 0 6px var(--color-shadow-glow))" }}
              initial={{ width: 0 }}
              animate={{ width: `${algorithm.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-ink-faint">Iteration</span>
              <span className="font-mono font-medium text-ink">{algorithm.currentIteration.toLocaleString()} / {algorithm.totalIterations.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-ink-faint">Best Value</span>
              <span className="font-mono font-medium text-[var(--color-success)]">{algorithm.bestValue.toFixed(6)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-ink-faint">Current</span>
              <span className="font-mono font-medium text-ink">{algorithm.currentValue.toFixed(6)}</span>
            </div>
            {algorithm.estimatedTimeRemaining && (
              <div className="flex flex-col gap-0.5">
                <span className="text-ink-faint">Est. Time</span>
                <span className="font-mono font-medium text-ink-dim">{formatTime(algorithm.estimatedTimeRemaining)}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mini sparkline for compact mode */}
      {compact && algorithm.convergenceHistory.length > 1 && (
        <div className="mt-2 h-16">
          <ConvergenceSparkline
            series={[
              {
                id: algorithm.algorithmId,
                label: algorithm.algorithmName,
                color: "var(--color-accent)",
                data: algorithm.convergenceHistory.map((p) => ({
                  iteration: p.iteration,
                  value: p.value,
                  bestValue: p.bestValue,
                })),
              },
            ]}
            width={400}
            height={64}
            compact
            showAxes={false}
            showLegend={false}
          />
        </div>
      )}
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

export function BenchmarkExecutionView({
  initialConfig,
  jobId: initialJobId,
  onComplete,
  onError,
  readOnly = false,
  compact = false,
}: BenchmarkExecutionViewProps) {
  const [jobId, setJobId] = useState<string | null>(initialJobId || null);
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showConvergence, setShowConvergence] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "algorithms" | "convergence" | "split">("split");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    status,
    isLoading,
    error,
    isRunning,
    isComplete,
    isFailed,
    isCancelled,
    currentStage,
    completedStages,
    totalStages,
    overallProgress,
    stages,
    algorithms,
    results,
    startJob,
    cancelJob,
    retryJob,
    refresh,
  } = useBenchmarkJob(jobId, {
    autoStart: !!jobId,
    onComplete,
    onError,
    onStageProgress: (stage) => {
      // Could update local stage state here
    },
    onAlgorithmProgress: (algo) => {
      // Could update local algorithm state here
    },
  });

  // Auto-select first running algorithm
  useEffect(() => {
    if (algorithms.length > 0 && !selectedAlgorithmId) {
      const runningAlgo = algorithms.find((a) => a.status === "running");
      const pendingAlgo = algorithms.find((a) => a.status === "pending");
      setSelectedAlgorithmId(runningAlgo?.algorithmId || pendingAlgo?.algorithmId || algorithms[0].algorithmId);
    }
  }, [algorithms, selectedAlgorithmId]);

  // Build convergence series from algorithms
  const convergenceSeries: ConvergenceSeries[] = algorithms
    .filter((a) => a.convergenceHistory.length > 0)
    .map((a, idx) => ({
      id: a.algorithmId,
      label: a.algorithmName,
      color: `hsl(${(idx * 137.5) % 360}, 70%, 55%)`, // Golden angle for distinct colors
      data: a.convergenceHistory.map((p) => ({
        iteration: p.iteration,
        value: p.value,
        bestValue: p.bestValue,
      })),
    }));

  const handleStart = useCallback(async () => {
    if (!initialConfig) return;
    const newJobId = await startJob(initialConfig);
    if (newJobId) {
      setJobId(newJobId);
      setSelectedAlgorithmId(null);
    }
  }, [initialConfig, startJob]);

  const handleCancel = useCallback(async () => {
    if (!jobId) return;
    await cancelJob(jobId);
  }, [jobId, cancelJob]);

  const handleRetry = useCallback(async () => {
    if (!jobId) return;
    const newJobId = await retryJob(jobId);
    if (newJobId) {
      setJobId(newJobId);
      setSelectedAlgorithmId(null);
    }
  }, [jobId, retryJob]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Demo mode: generate mock data when no real job
  const isDemoMode = !jobId && !initialConfig;

  if (compact) {
    return (
      <div className="rounded-xl bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">Benchmark Execution</h3>
          <div className="flex items-center gap-2">
            {isRunning && <MiniThinkingOrb variant="brain" />}
            {isComplete && <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-[var(--color-danger)]" />}
          </div>
        </div>

        {isDemoMode ? (
          <div className="text-center py-8 text-ink-dim">
            <Brain className="h-12 w-12 mx-auto mb-3 text-ink-faint" />
            <p className="text-sm">No active benchmark job</p>
            <p className="text-xs mt-1">Configure and start a benchmark to see live execution</p>
          </div>
        ) : (
          <>
            <PipelineTimeline
              stages={STANDARD_PIPELINE_STAGES}
              activeIndex={stages.findIndex((s) => s.status === "running") || completedStages}
              overallProgress={overallProgress}
              compact
              showConnector
            />
            {algorithms.length > 0 && (
              <div className="mt-4 space-y-2">
                {algorithms.slice(0, 3).map((algo) => (
                  <AlgorithmCard
                    key={algo.algorithmId}
                    algorithm={algo}
                    isActive={algo.algorithmId === selectedAlgorithmId}
                    onSelect={() => setSelectedAlgorithmId(algo.algorithmId)}
                    selectedAlgorithmId={selectedAlgorithmId}
                    compact
                  />
                ))}
                {algorithms.length > 3 && (
                  <div className="text-center text-xs text-ink-faint py-2">
                    +{algorithms.length - 3} more algorithms
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`rounded-2xl bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 m-0 rounded-none" : ""
      }`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={isFullscreen ? { height: "100vh", width: "100vw" } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-glass-border)] bg-[var(--color-glass-bg)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            {isRunning && <ThinkingOrb size={40} variant="brain" orbiting={true} />}
            {isComplete && !isRunning && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
              </div>
            )}
            {isFailed && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20">
                <AlertCircle className="h-5 w-5 text-[var(--color-danger)]" />
              </div>
            )}
            {!jobId && !isRunning && !isComplete && !isFailed && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)]">
                <Brain className="h-5 w-5 text-ink-dim" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Benchmark Execution</h2>
            <p className="text-xs text-ink-dim">
              {jobId ? `Job: ${jobId.slice(0, 8)}...` : "Ready to start"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] rounded-lg p-1">
            {[
              { mode: "timeline" as const, icon: BarChart3, label: "Pipeline" },
              { mode: "algorithms" as const, icon: Zap, label: "Algorithms" },
              { mode: "convergence" as const, icon: TrendingDown, label: "Convergence" },
              { mode: "split" as const, icon: Terminal, label: "Split" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                    : "text-ink-dim hover:text-ink"
                }`}
                title={label}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          {!readOnly && !jobId && initialConfig && !isRunning && (
            <motion.button
              onClick={handleStart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium text-sm hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={16} />
              Start Benchmark
            </motion.button>
          )}

          {jobId && isRunning && !readOnly && (
            <>
              <motion.button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink text-sm hover:bg-[var(--color-glass-active)] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <Square size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </motion.button>
              <motion.button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink-dim hover:text-ink hover:bg-[var(--color-glass-active)] transition-colors"
                whileTap={{ scale: 0.95 }}
                title="Refresh"
              >
                <RotateCcw size={16} />
              </motion.button>
            </>
          )}

          {jobId && (isComplete || isFailed) && (
            <>
              <motion.button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink text-sm hover:bg-[var(--color-glass-active)] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Retry</span>
              </motion.button>
              {isComplete && results && (
                <motion.button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink text-sm hover:bg-[var(--color-glass-active)] transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
              )}
            </>
          )}

          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink-dim hover:text-ink hover:bg-[var(--color-glass-active)] transition-colors"
            whileTap={{ scale: 0.95 }}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {isDemoMode && !jobId ? (
          // Demo/Empty state
          <motion.div
            key="demo"
            className="flex h-[500px] items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md">
              <motion.div
                className="mx-auto mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ThinkingOrb size={96} variant="brain" orbiting={true} />
              </motion.div>
              <h3 className="text-xl font-semibold text-ink mb-2">Ready to Run Benchmarks</h3>
              <p className="text-ink-dim mb-6">
                Configure a benchmark job to see the live execution pipeline, algorithm convergence,
                and real-time progress tracking with beautiful animations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-6 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium hover:opacity-90 transition-opacity">
                  <Play className="inline h-4 w-4 mr-2" />
                  Start Demo Benchmark
                </button>
                <button className="px-6 py-3 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink font-medium hover:bg-[var(--color-glass-active)] transition-colors">
                  <Settings className="inline h-4 w-4 mr-2" />
                  Configure Job
                </button>
              </div>
            </div>
          </motion.div>
        ) : isLoading && !status ? (
          // Loading state
          <motion.div
            key="loading"
            className="flex h-[500px] items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <ThinkingOrb size={80} variant="brain" orbiting={true} />
              <p className="mt-4 text-ink-dim">Loading benchmark job...</p>
            </div>
          </motion.div>
        ) : (
          // Main views
          <motion.div
            key={viewMode}
            className="h-[500px] overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === "timeline" && (
              <div className="h-full p-6 overflow-y-auto">
                <PipelineTimeline
                  stages={STANDARD_PIPELINE_STAGES}
                  activeIndex={stages.findIndex((s) => s.status === "running") || completedStages}
                  overallProgress={overallProgress}
                  estimatedTime={algorithms.find((a) => a.status === "running")?.estimatedTimeRemaining
                    ? formatTime(algorithms.find((a) => a.status === "running")!.estimatedTimeRemaining!)
                    : undefined}
                  showConnector
                />
              </div>
            )}

            {viewMode === "algorithms" && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-ink">Algorithm Progress</h3>
                  <div className="flex items-center gap-2 text-sm text-ink-dim">
                    {algorithms.filter((a) => a.status === "running").length > 0 && (
                      <>
                        <MiniThinkingOrb variant="zap" />
                        <span>{algorithms.filter((a) => a.status === "running").length} running</span>
                      </>
                    )}
                    <span className="text-[var(--color-success)]">
                      <CheckCircle className="inline h-3 w-3 mr-1" />
                      {algorithms.filter((a) => a.status === "complete").length} complete
                    </span>
                    <span className="text-[var(--color-danger)]">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      {algorithms.filter((a) => a.status === "error").length} failed
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {algorithms.map((algo) => (
                    <AlgorithmCard
                      key={algo.algorithmId}
                      algorithm={algo}
                      isActive={algo.algorithmId === selectedAlgorithmId}
                      onSelect={() => setSelectedAlgorithmId(algo.algorithmId)}
                      selectedAlgorithmId={selectedAlgorithmId}
                    />
                  ))}
                  {algorithms.length === 0 && (
                    <div className="col-span-full text-center py-12 text-ink-dim">
                      <Zap className="h-12 w-12 mx-auto mb-3 text-ink-faint" />
                      <p>No algorithms running yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === "convergence" && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-ink">Live Convergence</h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-ink-dim cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDetails}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowDetails(e.target.checked)}
                        className="rounded border-[var(--color-glass-border)] bg-[var(--color-glass-input)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                      Show best-so-far
                    </label>
                  </div>
                </div>
                {convergenceSeries.length > 0 ? (
                  <ConvergenceSparkline
                    series={convergenceSeries}
                    width={400}
                    height={450}
                    showAxes={true}
                    showLegend={true}
                    showTooltip={true}
                    xLabel="Iteration"
                    yLabel="Objective Value"
                    direction="minimize"
                    animated={true}
                    referenceLines={results?.bestValue
                      ? [{ value: results.bestValue, label: "Global Best", color: "var(--color-success)" }]
                      : []}
                  />
                ) : (
                  <div className="h-[450px] flex items-center justify-center text-ink-dim">
                    <div className="text-center">
                      <TrendingDown className="h-12 w-12 mx-auto mb-3 text-ink-faint" />
                      <p>No convergence data yet</p>
                      <p className="text-xs mt-1">Start a benchmark to see live convergence curves</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "split" && (
              <div className="h-full flex overflow-hidden">
                {/* Left: Timeline */}
                <div className="w-1/2 border-r border-[var(--color-glass-border)] overflow-y-auto p-4">
                  <h3 className="font-semibold text-ink mb-4">Pipeline</h3>
                  <PipelineTimeline
                    stages={STANDARD_PIPELINE_STAGES}
                    activeIndex={stages.findIndex((s) => s.status === "running") || completedStages}
                    overallProgress={overallProgress}
                    compact
                    showConnector
                  />
                </div>

                {/* Right: Algorithms + Convergence */}
                <div className="w-1/2 flex flex-col overflow-hidden p-4">
                  <div className="flex-1 overflow-y-auto">
                    <h3 className="font-semibold text-ink mb-3">Algorithms</h3>
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                      {algorithms.map((algo) => (
                        <AlgorithmCard
                          key={algo.algorithmId}
                          algorithm={algo}
                          isActive={algo.algorithmId === selectedAlgorithmId}
                          onSelect={() => setSelectedAlgorithmId(algo.algorithmId)}
                          selectedAlgorithmId={selectedAlgorithmId}
                          compact
                        />
                      ))}
                      {algorithms.length === 0 && (
                        <div className="text-center py-8 text-ink-dim">
                          <Zap className="h-8 w-8 mx-auto mb-2 text-ink-faint" />
                          <p className="text-sm">Waiting for algorithms...</p>
                        </div>
                      )}
                    </div>

                    <div className="h-64">
                      {convergenceSeries.length > 0 ? (
                        <ConvergenceSparkline
                          series={convergenceSeries}
                          width={400}
                          height={256}
                          showAxes={true}
                          showLegend={true}
                          compact={false}
                          direction="minimize"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-ink-dim">
                          <p className="text-sm">Convergence data appears here during execution</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      {error && (
        <motion.div
          className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-5 w-5 text-[var(--color-danger)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-danger)] flex-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="text-xs font-medium text-[var(--color-danger)] hover:underline"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Results summary when complete */}
      {isComplete && results && (
        <motion.div
          className="mx-4 mb-4 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success)]/20">
                <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-success)]">Benchmark Completed</p>
                <p className="text-sm text-ink-dim">Best: {results.bestAlgorithm} — {results.bestValue.toFixed(6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-sm text-ink hover:bg-[var(--color-glass-active)]">
                <FileText className="inline h-3 w-3 mr-1" />
                View Report
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-sm text-ink hover:bg-[var(--color-glass-active)]">
                <Download className="inline h-3 w-3 mr-1" />
                Export Results
              </button>
            </div>
          </div>
          {results.rankings.length > 1 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ink-dim border-b border-[var(--color-glass-border)]">
                    <th className="text-left py-2 px-3">Rank</th>
                    <th className="text-left py-2 px-3">Algorithm</th>
                    <th className="text-right py-2 px-3 font-mono">Final Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.rankings.slice(0, 5).map((r) => (
                    <tr key={r.algorithmId} className="border-b border-[var(--color-glass-border)]/50">
                      <td className="py-2 px-3 font-mono font-semibold text-[var(--color-accent)]">#{r.rank}</td>
                      <td className="py-2 px-3 text-ink">{r.algorithmName}</td>
                      <td className="py-2 px-3 text-right font-mono text-ink-dim">{r.finalValue.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Demo wrapper that simulates a benchmark job for testing
 */
export function BenchmarkExecutionDemo() {
  const [demoJobId, setDemoJobId] = useState<string | null>(null);
  const [demoStage, setDemoStage] = useState(0);
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    if (!demoJobId) return;

    const interval = setInterval(() => {
      setDemoProgress((p) => {
        const next = p + Math.random() * 5;
        if (next >= 100) {
          setDemoStage((s) => {
            if (s >= STANDARD_PIPELINE_STAGES.length - 1) {
              clearInterval(interval);
              return s;
            }
            return s + 1;
          });
          return 0;
        }
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [demoJobId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">Benchmark Execution Demo</h2>
        <div className="flex items-center gap-2">
          {demoJobId ? (
            <button
              onClick={() => {
                setDemoJobId(null);
                setDemoStage(0);
                setDemoProgress(0);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] text-ink hover:bg-[var(--color-glass-active)]"
            >
              <RotateCcw className="inline h-4 w-4 mr-1" />
              Reset Demo
            </button>
          ) : (
            <button
              onClick={() => setDemoJobId("demo-" + Date.now())}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium"
            >
              <Play className="inline h-4 w-4 mr-1" />
              Start Demo
            </button>
          )}
        </div>
      </div>

      <BenchmarkExecutionView
        jobId={demoJobId}
        initialConfig={{
          datasetId: "demo-dataset",
          problemStatementId: "demo-problem",
          algorithmIds: ["vanilla-bo", "saasbo", "turbo", "baxus", "hebo"],
          budget: 100,
          seed: 42,
        }}
        readOnly={false}
      />
    </div>
  );
}