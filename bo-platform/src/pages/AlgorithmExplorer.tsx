import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Cpu, Layers, LayoutGrid, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Badge, Input, SectionEyebrow } from "@/components/ui/primitives";
import { ALGORITHMS } from "@/data/mock";

export default function AlgorithmExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("All");

  const families = ["All", ...Array.from(new Set(ALGORITHMS.map((a) => a.family)))];

  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS.filter((algo) => {
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.short.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFamily = selectedFamily === "All" || algo.family === selectedFamily;
      return matchesSearch && matchesFamily;
    });
  }, [searchQuery, selectedFamily]);

  const getFamilyIcon = (family: string) => {
    switch (family) {
      case "Trust Region":
        return <LayoutGrid className="h-4 w-4" />;
      case "Sparse Axis-Aligned":
        return <Layers className="h-4 w-4" />;
      case "Bandit":
        return <Zap className="h-4 w-4" />;
      case "Baseline":
      case "Classical":
        return <Cpu className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
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
      <Helmet>
        <title>Algorithm Explorer | HyperBench</title>
        <meta name="description" content="Explore state-of-the-art Bayesian Optimization algorithms, their mathematical foundations, and ideal use cases." />
        <meta property="og:title" content="Algorithm Explorer | HyperBench" />
      </Helmet>
      <div className="space-y-8">
        <header>
          <SectionEyebrow>Knowledge Base</SectionEyebrow>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Algorithm Explorer</h1>
          <p className="mt-4 text-lg text-ink-dim max-w-3xl">
            Browse and understand the state-of-the-art optimisation strategies available in HyperBench. Select an algorithm to dive deeper into its mathematical foundations, trade-offs, and ideal use cases.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input
              placeholder="Search algorithms by name, acronym, or description..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {families.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFamily === family
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "bg-[var(--color-glass-active)] text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)]"
                }`}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <Link to={`/algorithms/${algo.id}`} className="block h-full group">
                  <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-glow hover:border-accent/40 bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-hover)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge variant={getFamilyColor(algo.family) as any} className="mb-3">
                          {getFamilyIcon(algo.family)}
                          <span className="ml-1">{algo.family}</span>
                        </Badge>
                        <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                          {algo.short}
                        </h3>
                        <p className="text-sm text-ink-dim mt-1">{algo.name}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-[var(--color-glass-active)] flex items-center justify-center text-ink-faint group-hover:bg-accent group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-ink-dim flex-1 mb-6 line-clamp-3">
                      {algo.description}
                    </p>

                    <div className="pt-4 border-t border-[var(--color-glass-border)] grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-ink-faint mb-1">Avg Accuracy</div>
                        <div className="font-semibold text-ink text-sm">{(algo.avgAccuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-faint mb-1">Scalability</div>
                        <div className="font-semibold text-ink text-sm">{algo.scalability}/100</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredAlgorithms.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-glass-active)] mb-4">
              <Search className="h-8 w-8 text-ink-faint" />
            </div>
            <h3 className="text-lg font-medium text-ink">No algorithms found</h3>
            <p className="text-ink-dim mt-2 max-w-md mx-auto">
              We couldn't find any algorithms matching your search criteria. Try adjusting your filters or search query.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearchQuery("");
                setSelectedFamily("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
