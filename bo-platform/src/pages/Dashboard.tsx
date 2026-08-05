import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { animate, motion } from "framer-motion";
import {
  FlaskConical,
  Cpu,
  Award,
  Clock,
  Target,
  Activity,
  UploadCloud,
  SlidersHorizontal,
  FileText,
  Sparkles,
  ArrowUpRight,
  Plus,
  Beaker,
  Database,
  Rocket
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { ALGORITHMS } from "@/data/mock";

const ICONS: Record<string, any> = { flask: FlaskConical, cpu: Cpu, award: Award, clock: Clock, target: Target, activity: Activity };

const QUICK_ACTIONS = [
  { title: "Upload Dataset", desc: "Direct upload and benchmark in one click", icon: UploadCloud, to: "/upload" },
  { title: "Start Benchmark", desc: "Direct upload and run benchmark", icon: SlidersHorizontal, to: "/upload" },
  { title: "Generate Report", desc: "Export results as PDF, CSV or Excel", icon: FileText, to: "/reports" },
  { title: "View Recommendations", desc: "See the recommended optimiser", icon: Sparkles, to: "/recommendation" },
];

const statusVariant: Record<string, "default" | "success" | "warn" | "danger" | "accent"> = {
  Completed: "success",
  Running: "accent",
  Queued: "warn",
  Failed: "danger",
};

function AnimatedCounter({ value, formatter }: { value: number, formatter?: (v: number) => string }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v)
    });
    return controls.stop;
  }, [value]);

  return <>{formatter ? formatter(display) : Math.round(display)}</>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const experiments = user?.experiments || [];
  const datasets = user?.datasets || [];
  const problemStatements = user?.problemStatements || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || "User";

  // Compute dynamic stats
  const totalExperiments = experiments.length;
  const allAlgorithms = new Set(experiments.flatMap((e) => e.algorithms || []));
  const completedExperiments = experiments.filter((e) => e.status === "Completed");
  const recommendedCounts: Record<string, number> = {};
  completedExperiments.forEach((e) => {
    if (e.recommended) recommendedCounts[e.recommended] = (recommendedCounts[e.recommended] || 0) + 1;
  });
  const topRecommended = Object.entries(recommendedCounts).sort((a, b) => b[1] - a[1])[0];
  
  const avgRuntime = completedExperiments.length > 0
    ? completedExperiments.reduce((sum, e) => {
        if (!e.duration) return sum;
        const mMatch = e.duration.match(/(\d+)\s*m/);
        const sMatch = e.duration.match(/([\d.]+)\s*s/);
        let sec = 0;
        if (mMatch) sec += parseFloat(mMatch[1]) * 60;
        if (sMatch) sec += parseFloat(sMatch[1]);
        if (!mMatch && !sMatch) {
          const raw = parseFloat(e.duration);
          if (!isNaN(raw)) sec = raw;
        }
        return sum + sec;
      }, 0) / completedExperiments.length
    : 0;
  
  const avgAccuracy = completedExperiments.length > 0
    ? completedExperiments.reduce((sum, e) => sum + e.bestObjective, 0) / completedExperiments.length
    : 0;

  const statCards = [
    { label: "Total Experiments", value: totalExperiments, delta: `${datasets.length} datasets, ${problemStatements.length} problems`, icon: "flask", type: "number" },
    { label: "Algorithms Tested", value: allAlgorithms.size, delta: allAlgorithms.size > 0 ? "unique algorithms" : "none yet", icon: "cpu", type: "number" },
    { label: "Recommended Optimiser", value: topRecommended ? topRecommended[0] : "—", delta: topRecommended ? `${topRecommended[1]} runs` : "run a benchmark", icon: "award", type: "text" },
    { label: "Average Runtime", value: avgRuntime, delta: completedExperiments.length > 0 ? `${completedExperiments.length} completed` : "no data", icon: "clock", type: "time" },
    { label: "Average Accuracy", value: avgAccuracy, delta: avgAccuracy > 0 ? "best objective avg" : "no data", icon: "target", type: "percent" },
    { label: "Recent Experiments", value: experiments.filter((e) => e.status === "Running").length, delta: experiments.filter((e) => e.status === "Running").length > 0 ? "running now" : "none running", icon: "activity", type: "number" },
  ];

  const runtimeData = Array.isArray(ALGORITHMS) ? ALGORITHMS.map((a) => ({ name: a.short, runtime: a.avgRuntime })) : [];
  const hasExperiments = experiments.length > 0;
  const latestExperiment = completedExperiments.length > 0 ? completedExperiments[completedExperiments.length - 1] : null;

  const renderValue = (card: typeof statCards[0]) => {
    if (card.type === "text") return card.value;
    if (card.type === "number") return <AnimatedCounter value={card.value as number} />;
    if (card.type === "percent") {
      if (card.value === 0) return "—";
      return <AnimatedCounter value={(card.value as number) * 100} formatter={(v) => `${v.toFixed(1)}%`} />;
    }
    if (card.type === "time") {
      if (card.value === 0) return "—";
      return <AnimatedCounter value={card.value as number} formatter={(v) => v < 60 ? `${v.toFixed(1)}s` : `${Math.floor(v / 60)}m ${Math.round(v % 60)}s`} />;
    }
    return card.value;
  };

  return (
    <AppShell>
      <Helmet>
        <title>Dashboard | HyperBench</title>
        <meta name="description" content="Manage your optimization experiments, view recommendations, and analyze benchmarks." />
        <meta property="og:title" content="Dashboard | HyperBench" />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {greeting}, <span className="text-gradient-accent">{firstName}</span>!
            </h1>
            <p className="text-base text-ink-dim max-w-xl leading-relaxed">
              Ready to find the optimal solution? You have <strong>{totalExperiments}</strong> experiments and <strong>{datasets.length}</strong> datasets waiting for you.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link to="/upload">
              <Button variant="secondary" className="hidden sm:flex">
                <UploadCloud className="h-4 w-4" /> Upload Data
              </Button>
            </Link>
            <Link to="/upload">
              <Button size="lg" className="shadow-lg shadow-accent/20">
                <Rocket className="h-4 w-4" /> New Benchmark
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {hasExperiments && latestExperiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[var(--color-glass-active)] to-[var(--color-glass-bg)] border-l-4 border-l-accent p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">Latest Result</Badge>
                  <span className="text-sm font-medium">{latestExperiment.name}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Recommended: <span className="text-accent">{latestExperiment.recommended || "None"}</span>
                </h3>
                <p className="text-sm text-ink-dim">
                  Achieved best objective of <strong>{latestExperiment.bestObjective.toFixed(4)}</strong> in {latestExperiment.duration}.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link to="/recommendation">
                  <Button variant="secondary">View Details</Button>
                </Link>
                <Link to="/reports">
                  <Button variant="outline">Generate Report</Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {hasExperiments ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            {statCards.map((s, i) => {
              const Icon = ICONS[s.icon];
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: "easeOut" }}
                >
                  <Card className="card-hover p-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)] flex items-center justify-center mb-4 transition-colors group-hover:border-accent/40 group-hover:bg-accent/5">
                        <Icon className="h-5 w-5 text-accent-soft" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight mb-1">{renderValue(s)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-ink-dim">{s.label}</div>
                      <div className="text-[11px] text-success mt-1.5 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> {s.delta}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <Link to={a.to}>
                  <Card className="card-hover h-full group cursor-pointer border-[var(--color-glass-border)] hover:border-accent/30 hover:bg-accent/[0.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <a.icon className="h-6 w-6 text-accent" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-ink-faint opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all duration-300 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                    <h3 className="font-semibold text-base mb-1">{a.title}</h3>
                    <p className="text-xs text-ink-dim leading-relaxed">{a.desc}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <Card className="lg:col-span-2 p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Average Runtime by Algorithm</h3>
                <p className="text-sm text-ink-dim">Seconds per benchmark run (reference data)</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={runtimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-glass-border)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="var(--color-ink-faint)" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={60} />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'var(--color-glass-hover)' }}
                      contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-glass-border)", borderRadius: 12, fontSize: 13, color: "var(--color-ink)", boxShadow: "var(--color-shadow-glass)" }} 
                    />
                    <Bar dataKey="runtime" fill="var(--color-accent)" radius={[6, 6, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-0 flex flex-col">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--color-glass-border)]">
                <h3 className="font-semibold text-lg">Recent Runs</h3>
                <Link to="/benchmark" className="text-xs font-medium text-accent hover:text-accent-soft transition-colors">View all</Link>
              </div>
              <div className="overflow-y-auto max-h-[400px] no-scrollbar">
                {experiments.slice(0, 10).map((e) => (
                  <Link key={e.id} to="/benchmark">
                    <div className="px-6 py-4 border-b border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)] transition-colors group cursor-pointer flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate group-hover:text-accent transition-colors">{e.name}</div>
                        <div className="text-xs text-ink-faint mt-1 flex items-center gap-2">
                          <span className="capitalize">{e.mode === "problem-statement" ? "Problem" : "Dataset"}</span>
                          <span className="w-1 h-1 rounded-full bg-ink-faint"></span>
                          <span className="font-mono">{e.bestObjective > 0 ? e.bestObjective.toFixed(4) : "—"}</span>
                        </div>
                      </div>
                      <Badge variant={statusVariant[e.status]}>{e.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="text-center py-20 px-6 w-full max-w-3xl mx-auto relative">
            {/* Animated Empty State Illustration */}
            <div className="relative w-full max-w-md mx-auto mb-12 h-56 flex items-center justify-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-10">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent to-accent-soft opacity-20 blur-xl scale-125"></div>
                <div className="relative h-28 w-28 rounded-3xl flex items-center justify-center bg-[var(--color-surface)] shadow-2xl border border-[var(--color-glass-border)]">
                  <Beaker className="h-12 w-12 text-accent" />
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 15, 0], x: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -left-4 sm:left-4 top-4 z-0">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl border border-[var(--color-glass-border)]">
                  <Database className="h-8 w-8 text-accent-soft" />
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -12, 0], x: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-4 sm:right-4 bottom-4 z-20">
                <div className="h-24 w-24 rounded-2xl flex items-center justify-center bg-[var(--color-surface)]/90 backdrop-blur-md shadow-xl border border-[var(--color-glass-border)]">
                  <Sparkles className="h-10 w-10 text-success" />
                </div>
              </motion.div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Your canvas is empty</h3>
              <p className="text-base text-ink-dim max-w-md mx-auto mb-10 leading-relaxed">
                Start by uploading a dataset or entering a problem statement to run your very first benchmark experiment and let our AI engine find the optimal algorithm.
              </p>
              <Link to="/upload">
                <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 group">
                  <Plus className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform" /> Create Your First Experiment
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
