import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Database, BarChart, Target, Zap, LayoutGrid, Layers, Cpu, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Badge, SectionEyebrow, Progress, Divider } from "@/components/ui/primitives";
import { ALGORITHMS } from "@/data/mock";

export default function AlgorithmDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const algorithm = ALGORITHMS.find((a) => a.id === id);

  if (!algorithm) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="h-20 w-20 rounded-full bg-[var(--color-glass-active)] flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-ink-faint" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-4">Algorithm Not Found</h1>
          <p className="text-ink-dim mb-8 max-w-md">
            The algorithm you are looking for does not exist or has been removed from the platform.
          </p>
          <Button onClick={() => navigate("/algorithms")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Explorer
          </Button>
        </div>
      </AppShell>
    );
  }

  const getFamilyIcon = (family: string) => {
    switch (family) {
      case "Trust Region":
        return <LayoutGrid className="h-5 w-5" />;
      case "Sparse Axis-Aligned":
        return <Layers className="h-5 w-5" />;
      case "Bandit":
        return <Zap className="h-5 w-5" />;
      default:
        return <Cpu className="h-5 w-5" />;
    }
  };

  const getFamilyColor = (family: string) => {
    switch (family) {
      case "Trust Region":
        return "accent";
      case "Sparse Axis-Aligned":
        return "success";
      case "Bandit":
        return "warn";
      default:
        return "default";
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-dim hover:text-ink transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-glass-active)] group-hover:bg-[var(--color-glass-hover)] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Knowledge Base
        </button>

        {/* Header Section */}
        <header className="pt-4">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant={getFamilyColor(algorithm.family) as any} className="px-3 py-1.5 text-sm">
              {getFamilyIcon(algorithm.family)}
              <span className="ml-1.5">{algorithm.family}</span>
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl mb-4">{algorithm.name}</h1>
          <p className="text-xl text-ink-dim leading-relaxed">{algorithm.description}</p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <SectionEyebrow>Strengths & Limitations</SectionEyebrow>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Key Advantages
                  </h3>
                  <ul className="space-y-3">
                    {algorithm.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-ink-dim">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success/60" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-ink mb-4">
                    <XCircle className="h-5 w-5 text-danger" />
                    Limitations
                  </h3>
                  <ul className="space-y-3">
                    {algorithm.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-ink-dim">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger/60" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <SectionEyebrow>Ideal Use Cases</SectionEyebrow>
              <div className="mt-4 p-6 rounded-2xl bg-[var(--color-glass-active)] border border-[var(--color-glass-border)]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-ink mb-2">When to use {algorithm.short}</h4>
                    <p className="text-ink-dim leading-relaxed">{algorithm.bestFor}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Metrics */}
          <div className="space-y-6">
            <Card className="p-6">
              <SectionEyebrow>Performance Metrics</SectionEyebrow>
              <div className="space-y-6 mt-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-dim font-medium">Average Accuracy</span>
                    <span className="text-ink font-semibold">{(algorithm.avgAccuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={algorithm.avgAccuracy * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-dim font-medium">Convergence Speed</span>
                    <span className="text-ink font-semibold">{algorithm.convergenceSpeed}/100</span>
                  </div>
                  <Progress value={algorithm.convergenceSpeed} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-dim font-medium">Scalability</span>
                    <span className="text-ink font-semibold">{algorithm.scalability}/100</span>
                  </div>
                  <Progress value={algorithm.scalability} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <SectionEyebrow>Computational Profile</SectionEyebrow>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-glass-active)] border border-[var(--color-glass-border)]">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-ink-faint" />
                    <span className="text-sm font-medium text-ink-dim">Avg. Runtime</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">{algorithm.avgRuntime} ms</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-glass-active)] border border-[var(--color-glass-border)]">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-ink-faint" />
                    <span className="text-sm font-medium text-ink-dim">Memory Profile</span>
                  </div>
                  <span className="text-sm font-semibold text-ink">{algorithm.memoryMb} MB</span>
                </div>
              </div>
            </Card>

            <div className="pt-4">
              <Button className="w-full" onClick={() => navigate("/experiment/new")}>
                Configure Experiment with {algorithm.short}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
