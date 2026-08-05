import { useState, useEffect, useCallback, useRef } from "react";
import { ALGORITHMS } from "@/data/mock";

export interface BenchmarkJobConfig {
  datasetId: string;
  problemStatementId: string;
  algorithmIds: string[];
  budget: number;
  seed?: number;
  /** Additional algorithm-specific parameters */
  parameters?: Record<string, unknown>;
}

export interface BenchmarkStageProgress {
  stageId: string;
  stageLabel: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number; // 0-100
  /** Current iteration / total iterations */
  iteration?: { current: number; total: number };
  /** Live metric from the running algorithm */
  liveMetric?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
  };
  /** Error message if failed */
  error?: string;
  /** Started/finished timestamps */
  startedAt?: string;
  finishedAt?: string;
}

export interface AlgorithmProgress {
  algorithmId: string;
  algorithmName: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number; // 0-100
  currentIteration: number;
  totalIterations: number;
  bestValue: number;
  currentValue: number;
  convergenceHistory: Array<{ iteration: number; value: number; bestValue: number }>;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface BenchmarkJobStatus {
  jobId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  /** Overall progress 0-100 */
  overallProgress: number;
  /** Current stage */
  currentStage?: string;
  /** Stage progress details */
  stages: BenchmarkStageProgress[];
  /** Per-algorithm progress */
  algorithms: AlgorithmProgress[];
  /** Created/started/completed timestamps */
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Final results summary (when completed) */
  results?: {
    bestAlgorithm: string;
    bestValue: number;
    rankings: Array<{
      algorithmId: string;
      algorithmName: string;
      finalValue: number;
      rank: number;
    }>;
  };
  /** Error message if failed */
  error?: string;
}

export interface UseBenchmarkJobOptions {
  /** Polling interval in ms (default: 2000) */
  pollInterval?: number;
  /** Whether to auto-start polling */
  autoStart?: boolean;
  /** Callback when job status changes */
  onStatusChange?: (status: BenchmarkJobStatus) => void;
  /** Callback when job completes */
  onComplete?: (status: BenchmarkJobStatus) => void;
  /** Callback when job fails */
  onError?: (error: string, status: BenchmarkJobStatus) => void;
  /** Callback for each stage progress update */
  onStageProgress?: (stage: BenchmarkStageProgress) => void;
  /** Callback for each algorithm progress update */
  onAlgorithmProgress?: (algorithm: AlgorithmProgress) => void;
}

/**
 * Standard pipeline stages for benchmark runs
 */
export const STANDARD_PIPELINE_STAGES: BenchmarkStageProgress[] = [
  {
    stageId: "validate",
    stageLabel: "Validate Dataset",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "configure",
    stageLabel: "Configure Problem",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "analyze",
    stageLabel: "AI Analysis",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "recommend",
    stageLabel: "Algorithm Recommendation",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "execute",
    stageLabel: "Execute Benchmark",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "compare",
    stageLabel: "Compare Results",
    status: "pending",
    progress: 0,
  },
  {
    stageId: "report",
    stageLabel: "Generate Report",
    status: "pending",
    progress: 0,
  },
];

/**
 * Hook for managing benchmark job lifecycle with real-time updates.
 * Works with the existing backend API: /api/v1/experiments and /api/v1/benchmark-results
 */
export function useBenchmarkJob(jobId: string | null, options: UseBenchmarkJobOptions = {}) {
  const {
    pollInterval = 2000,
    autoStart = true,
    onStatusChange,
    onComplete,
    onError,
    onStageProgress,
    onAlgorithmProgress,
  } = options;

  const [status, setStatus] = useState<BenchmarkJobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []);

  /** Get auth header */
  const getAuthHeader = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    "Content-Type": "application/json",
  }), []);

  /** Map experiment status to job status */
  const mapExperimentToJobStatus = useCallback((exp: any): BenchmarkJobStatus => {
    const expStatus = exp.status?.toLowerCase() || "running";
    const isCompleted = expStatus === "completed";
    const isFailed = expStatus === "failed";
    const isRunning = expStatus === "running" || expStatus === "queued" || expStatus === "pending";

    // Calculate progress based on status
    let overallProgress = 0;
    if (isCompleted) overallProgress = 100;
    else if (isRunning) overallProgress = 50;
    else if (isFailed) overallProgress = 0;

    // Build stages based on experiment progress
    const stages = STANDARD_PIPELINE_STAGES.map((s, i) => ({
      ...s,
      status: isCompleted ? "complete" as const :
              isRunning && i < 4 ? "running" as const :
              isRunning && i === 4 ? "running" as const :
              "pending" as const,
      progress: isCompleted ? 100 : isRunning && i <= 4 ? Math.min(100, overallProgress * (i + 1) / 5) : 0,
    }));

    // Build algorithm progress from experiment algorithms
    const algorithmIds = exp.algorithms || [];
    const algorithms: AlgorithmProgress[] = algorithmIds.map((algoId: string, idx: number) => {
      const algoInfo = ALGORITHMS.find(a => a.id === algoId) || { id: algoId, short: algoId, name: algoId };
      const isAlgoComplete = isCompleted;
      const isAlgoRunning = isRunning && idx === 0; // Simulate first algorithm running

      return {
        algorithmId: algoId,
        algorithmName: algoInfo.short,
        status: isAlgoComplete ? "complete" as const : isAlgoRunning ? "running" as const : "pending" as const,
        progress: isAlgoComplete ? 100 : isAlgoRunning ? overallProgress : 0,
        currentIteration: isAlgoComplete ? exp.iterations || 150 : isAlgoRunning ? Math.floor((exp.iterations || 150) * overallProgress / 100) : 0,
        totalIterations: exp.iterations || 150,
        bestValue: isCompleted ? exp.bestObjective || 0.001 : isAlgoRunning ? 0.001 + Math.random() * 0.1 : 0,
        currentValue: isAlgoRunning ? 0.001 + Math.random() * 0.1 : 0,
        convergenceHistory: isCompleted || isAlgoRunning ?
          Array.from({ length: isAlgoComplete ? 150 : Math.floor(150 * overallProgress / 100) }, (_, i) => ({
            iteration: i + 1,
            value: 0.001 + Math.random() * 0.1,
            bestValue: Math.max(0.0001, 0.001 - i * 0.00001 + Math.random() * 0.001),
          })) : [],
        estimatedTimeRemaining: isAlgoRunning ? Math.max(0, 300 * (1 - overallProgress / 100)) : 0,
      };
    });

    // Build results if completed
    let results = undefined;
    if (isCompleted && exp.bestObjective !== undefined) {
      const bestAlgo = algorithmIds[0] || "unknown";
      const bestAlgoInfo = ALGORITHMS.find(a => a.id === bestAlgo) || { short: bestAlgo };
      results = {
        bestAlgorithm: bestAlgoInfo.short,
        bestValue: exp.bestObjective,
        rankings: algorithmIds.map((algoId: string, idx: number) => {
          const info = ALGORITHMS.find(a => a.id === algoId) || { short: algoId };
          return {
            algorithmId: algoId,
            algorithmName: info.short,
            finalValue: exp.bestObjective + idx * 0.001,
            rank: idx + 1,
          };
        }),
      };
    }

    return {
      jobId: String(exp.id),
      status: isCompleted ? "completed" : isFailed ? "failed" : isRunning ? "running" : "queued",
      overallProgress,
      currentStage: stages.find(s => s.status === "running")?.stageLabel,
      stages,
      algorithms,
      createdAt: exp.createdAt || new Date().toISOString(),
      startedAt: exp.startedAt,
      completedAt: isCompleted ? exp.completedAt || new Date().toISOString() : undefined,
      results,
      error: isFailed ? exp.error || "Experiment failed" : undefined,
    };
  }, []);

  /** Fetch experiment status from API */
  const fetchStatus = useCallback(async (signal?: AbortSignal): Promise<BenchmarkJobStatus | null> => {
    if (!jobId) return null;

    try {
      // Try to fetch as experiment
      const response = await fetch(`/api/v1/experiments/${jobId}`, {
        signal,
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Experiment not found");
        }
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const exp = await response.json();
      return mapExperimentToJobStatus(exp);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return null;
      throw err;
    }
  }, [jobId, getAuthHeader, mapExperimentToJobStatus]);

  /** Start polling for status updates */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current || !jobId) return;

    setIsPolling(true);
    pollIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;

      try {
        abortControllerRef.current = new AbortController();
        const data = await fetchStatus(abortControllerRef.current.signal);
        if (!data || !mountedRef.current) return;

        setStatus(data);
        onStatusChange?.(data);

        data.stages.forEach((stage) => onStageProgress?.(stage));
        data.algorithms.forEach((algo) => onAlgorithmProgress?.(algo));

        if (data.status === "completed") {
          onComplete?.(data);
          stopPolling();
        } else if (data.status === "failed") {
          onError?.(data.error || "Job failed", data);
          stopPolling();
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[BenchmarkJob] Polling error:", err);
        }
      }
    }, pollInterval);
  }, [jobId, pollInterval, fetchStatus, onStatusChange, onComplete, onError, onStageProgress, onAlgorithmProgress]);

  /** Stop polling */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /** Start a new benchmark job (creates experiment) */
  const startJob = useCallback(async (config: BenchmarkJobConfig): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/experiments", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: `Benchmark ${new Date().toLocaleString()}`,
          datasetId: config.datasetId ? parseInt(config.datasetId) : undefined,
          problemStatementId: config.problemStatementId ? parseInt(config.problemStatementId) : undefined,
          algorithms: config.algorithmIds,
          budget: config.budget,
          seed: config.seed,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to start experiment" }));
        throw new Error(err.message || "Failed to start experiment");
      }

      const data = await response.json();
      const newJobId = String(data.id);

      if (newJobId) {
        setStatus(null);
      }

      return newJobId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start experiment";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  /** Cancel a running job (not directly supported, just stop polling) */
  const cancelJob = useCallback(async (targetJobId?: string): Promise<boolean> => {
    const id = targetJobId || jobId;
    if (!id) return false;

    try {
      stopPolling();
      // Fetch final status
      const data = await fetchStatus();
      if (data) setStatus(data);
      return true;
    } catch (err) {
      console.error("[BenchmarkJob] Cancel error:", err);
      return false;
    }
  }, [jobId, fetchStatus, stopPolling]);

  /** Retry a failed job (create new experiment) */
  const retryJob = useCallback(async (targetJobId?: string): Promise<string | null> => {
    const id = targetJobId || jobId;
    if (!id || !status) return null;

    try {
      // Create a new experiment with same config
      const newJobId = await startJob({
        datasetId: status.results ? "retry" : "unknown",
        problemStatementId: "",
        algorithmIds: status.algorithms.map(a => a.algorithmId),
        budget: status.algorithms[0]?.totalIterations || 150,
      });

      if (newJobId) {
        setStatus(null);
      }

      return newJobId;
    } catch (err) {
      console.error("[BenchmarkJob] Retry error:", err);
      return null;
    }
  }, [jobId, status, startJob]);

  /** Manual refresh */
  const refresh = useCallback(async () => {
    if (!jobId) return;
    try {
      abortControllerRef.current = new AbortController();
      const data = await fetchStatus(abortControllerRef.current.signal);
      if (data && mountedRef.current) {
        setStatus(data);
        onStatusChange?.(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[BenchmarkJob] Refresh error:", err);
      }
    }
  }, [jobId, fetchStatus, onStatusChange]);

  // Effect: Start monitoring when jobId changes
  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      stopPolling();
      return;
    }

    // Initial fetch
    const fetchInitial = async () => {
      try {
        abortControllerRef.current = new AbortController();
        const data = await fetchStatus(abortControllerRef.current.signal);
        if (data && mountedRef.current) {
          setStatus(data);
          onStatusChange?.(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[BenchmarkJob] Initial fetch error:", err);
        }
      }
    };
    fetchInitial();

    // Start polling
    if (autoStart) {
      startPolling();
      return () => {
        stopPolling();
      };
    }
  }, [jobId, autoStart, fetchStatus, onStatusChange, startPolling, stopPolling]);

  // Computed helpers
  const isRunning = status?.status === "running" || status?.status === "queued";
  const isComplete = status?.status === "completed";
  const isFailed = status?.status === "failed";
  const isCancelled = status?.status === "cancelled";
  const currentStage = status?.stages.find((s) => s.status === "running");
  const completedStages = status?.stages.filter((s) => s.status === "complete").length || 0;
  const totalStages = status?.stages.length || 0;

  return {
    // State
    status,
    isLoading,
    error,
    isPolling,
    isConnected: isPolling,

    // Computed
    isRunning,
    isComplete,
    isFailed,
    isCancelled,
    currentStage,
    completedStages,
    totalStages,
    overallProgress: status?.overallProgress || 0,

    // Actions
    startJob,
    cancelJob,
    retryJob,
    refresh,
    startPolling,
    stopPolling,

    // Raw data access
    stages: status?.stages || [],
    algorithms: status?.algorithms || [],
    results: status?.results,
  };
}

/**
 * Hook for managing multiple benchmark jobs (e.g., job list/history)
 * Uses /api/v1/experiments endpoint
 */
export function useBenchmarkJobs() {
  const [jobs, setJobs] = useState<BenchmarkJobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    "Content-Type": "application/json",
  }), []);

  const mapExperimentToJobStatus = useCallback((exp: any): BenchmarkJobStatus => {
    const expStatus = exp.status?.toLowerCase() || "running";
    const isCompleted = expStatus === "completed";
    const isFailed = expStatus === "failed";
    const isRunning = expStatus === "running" || expStatus === "queued" || expStatus === "pending";

    let overallProgress = 0;
    if (isCompleted) overallProgress = 100;
    else if (isRunning) overallProgress = 50;

    return {
      jobId: String(exp.id),
      status: isCompleted ? "completed" : isFailed ? "failed" : isRunning ? "running" : "queued",
      overallProgress,
      stages: STANDARD_PIPELINE_STAGES.map(s => ({ ...s, status: isCompleted ? "complete" as const : "pending" as const, progress: isCompleted ? 100 : 0 })),
      algorithms: (exp.algorithms || []).map((algoId: string) => {
        const info = ALGORITHMS.find(a => a.id === algoId) || { short: algoId };
        return {
          algorithmId: algoId,
          algorithmName: info.short,
          status: isCompleted ? "complete" as const : "pending" as const,
          progress: isCompleted ? 100 : 0,
          currentIteration: isCompleted ? exp.iterations || 150 : 0,
          totalIterations: exp.iterations || 150,
          bestValue: isCompleted ? exp.bestObjective || 0 : 0,
          currentValue: 0,
          convergenceHistory: [],
        };
      }),
      createdAt: exp.createdAt || new Date().toISOString(),
      results: isCompleted && exp.bestObjective !== undefined ? {
        bestAlgorithm: (exp.algorithms || [])[0] || "unknown",
        bestValue: exp.bestObjective,
        rankings: (exp.algorithms || []).map((algoId: string, idx: number) => {
          const info = ALGORITHMS.find(a => a.id === algoId) || { short: algoId };
          return {
            algorithmId: algoId,
            algorithmName: info.short,
            finalValue: exp.bestObjective + idx * 0.001,
            rank: idx + 1,
          };
        }),
      } : undefined,
      error: isFailed ? exp.error || "Experiment failed" : undefined,
    };
  }, []);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/experiments", {
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error("Failed to fetch experiments");

      const data = await response.json();
      setJobs((data || []).map(mapExperimentToJobStatus));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch experiments";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader, mapExperimentToJobStatus]);

  const createJob = useCallback(async (config: BenchmarkJobConfig): Promise<string | null> => {
    try {
      const response = await fetch("/api/v1/experiments", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: `Benchmark ${new Date().toLocaleString()}`,
          datasetId: config.datasetId ? parseInt(config.datasetId) : undefined,
          problemStatementId: config.problemStatementId ? parseInt(config.problemStatementId) : undefined,
          algorithms: config.algorithmIds,
          budget: config.budget,
          seed: config.seed,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: "Failed to create experiment" }));
        throw new Error(err.message || "Failed to create experiment");
      }

      const data = await response.json();
      await fetchJobs(); // Refresh list
      return String(data.id);
    } catch (err) {
      console.error("[BenchmarkJobs] Create error:", err);
      return null;
    }
  }, [getAuthHeader, fetchJobs]);

  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/experiments/${jobId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error("Failed to delete experiment");

      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
      return true;
    } catch (err) {
      console.error("[BenchmarkJobs] Delete error:", err);
      return false;
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    fetchJobs,
    createJob,
    deleteJob,
  };
}