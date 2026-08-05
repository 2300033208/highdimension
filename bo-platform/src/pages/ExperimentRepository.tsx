import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Copy, Trash2, Download, Scale, Play, Clock, MoreVertical, FlaskConical } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Badge, Input, SectionEyebrow } from "@/components/ui/primitives";
import { useAuth, ExperimentData } from "@/contexts/AuthContext";

export default function ExperimentRepository() {
  const { user, deleteExperiment } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modeFilter, setModeFilter] = useState<string>("All");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const experiments = user?.experiments || [];

  const statuses = ["All", "Completed", "Running", "Queued", "Failed"];
  const modes = ["All", "dataset", "problem-statement"];

  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      const matchesSearch =
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.datasetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.problemTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || exp.status === statusFilter;
      const matchesMode = modeFilter === "All" || exp.mode === modeFilter;
      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [experiments, searchQuery, statusFilter, modeFilter]);

  const getStatusBadge = (status: ExperimentData["status"]) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "Running":
        return <Badge variant="accent">Running</Badge>;
      case "Queued":
        return <Badge variant="warn">Queued</Badge>;
      case "Failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleAction = (e: React.MouseEvent, action: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(null);
    const targetExp = experiments.find((exp) => exp.id === id);
    if (!targetExp) return;

    if (action === "delete") {
      deleteExperiment(id);
    } else if (action === "compare") {
      navigate("/visualisations");
    } else if (action === "duplicate") {
      navigate("/experiment/new");
    } else if (action === "export") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetExp, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${targetExp.name.replace(/\s+/g, "_")}_${id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <SectionEyebrow>Repository</SectionEyebrow>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Experiments</h1>
            <p className="mt-4 text-lg text-ink-dim max-w-2xl">
              Manage all your previous and running experiments in one place. Compare results, export data, or start new runs based on existing configurations.
            </p>
          </div>
          <Button onClick={() => navigate("/experiment/new")}>
            <FlaskConical className="h-4 w-4" />
            New Experiment
          </Button>
        </header>

        <Card className="p-0 overflow-hidden bg-[var(--color-glass-surface)] border-[var(--color-glass-border)]">
          <div className="p-4 sm:p-6 border-b border-[var(--color-glass-border)] flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-glass-active)]">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
              <Input
                placeholder="Search experiments..."
                className="pl-10 h-10 bg-canvas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-ink-dim" />
                <span className="text-sm font-medium text-ink-dim hidden sm:inline">Status:</span>
              </div>
              <select
                className="h-10 rounded-xl bg-canvas border border-[var(--color-glass-input-border)] px-3 text-sm text-ink outline-none focus:border-accent/60"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-xl bg-canvas border border-[var(--color-glass-input-border)] px-3 text-sm text-ink outline-none focus:border-accent/60"
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
              >
                <option value="All">All Modes</option>
                <option value="dataset">Dataset Mode</option>
                <option value="problem-statement">Problem Statement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--color-glass-surface)] text-ink-dim border-b border-[var(--color-glass-border)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Experiment Name</th>
                  <th className="px-6 py-4 font-semibold">Mode / Source</th>
                  <th className="px-6 py-4 font-semibold">Algorithms</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Started</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-glass-border)]">
                {filteredExperiments.length > 0 ? (
                  filteredExperiments.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[var(--color-glass-hover)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink group-hover:text-accent transition-colors">
                          {exp.name}
                        </div>
                        <div className="text-xs text-ink-faint mt-1 font-mono">{exp.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${exp.mode === "dataset" ? "bg-accent" : "bg-success"}`} />
                          <span className="capitalize text-ink">{exp.mode.replace("-", " ")}</span>
                        </div>
                        <div className="text-xs text-ink-dim mt-1 truncate max-w-[180px]">
                          {exp.mode === "dataset" ? exp.datasetName : exp.problemTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                          {exp.algorithms.slice(0, 2).map((a, i) => (
                            <span key={i} className="inline-flex items-center rounded-md bg-[var(--color-glass-active)] px-2 py-1 text-xs font-medium text-ink-dim">
                              {a}
                            </span>
                          ))}
                          {exp.algorithms.length > 2 && (
                            <span className="inline-flex items-center rounded-md bg-[var(--color-glass-active)] px-2 py-1 text-xs font-medium text-ink-dim">
                              +{exp.algorithms.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(exp.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-ink-dim">
                          <Clock className="h-4 w-4" />
                          {(() => {
                            try {
                              const d = new Date(exp.started);
                              return isNaN(d.getTime()) ? exp.started : d.toLocaleDateString();
                            } catch {
                              return exp.started;
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenu(activeMenu === exp.id ? null : exp.id)}
                            className="p-2 rounded-lg text-ink-dim hover:text-ink hover:bg-[var(--color-glass-active)] transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {activeMenu === exp.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 z-50 mt-2 w-48 rounded-xl bg-surface border border-[var(--color-glass-border)] shadow-xl p-1"
                              >
                                {exp.status === "Completed" && (
                                  <button onClick={(e) => handleAction(e, "compare", exp.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-[var(--color-glass-hover)]">
                                    <Scale className="h-4 w-4 text-ink-dim" /> Compare Results
                                  </button>
                                )}
                                <button onClick={(e) => handleAction(e, "duplicate", exp.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-[var(--color-glass-hover)]">
                                  <Copy className="h-4 w-4 text-ink-dim" /> Duplicate Run
                                </button>
                                {exp.status === "Completed" && (
                                  <button onClick={(e) => handleAction(e, "export", exp.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-[var(--color-glass-hover)]">
                                    <Download className="h-4 w-4 text-ink-dim" /> Export Data
                                  </button>
                                )}
                                <div className="h-px w-full bg-[var(--color-glass-border)] my-1" />
                                <button onClick={(e) => handleAction(e, "delete", exp.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-glass-active)] mb-3">
                        <FlaskConical className="h-6 w-6 text-ink-faint" />
                      </div>
                      <h3 className="text-sm font-medium text-ink">No experiments found</h3>
                      <p className="mt-1 text-sm text-ink-dim">
                        Get started by creating a new optimization experiment.
                      </p>
                      <Button className="mt-4" onClick={() => navigate("/experiment/new")} size="sm">
                        Create Experiment
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Click outside listener for menu - simple implementation */}
      {activeMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
      )}
    </AppShell>
  );
}
