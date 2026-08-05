import {
  FlaskConical,
  BarChart3,
  GitCompareArrows,
  Repeat,
  FileText,
  Brain,
} from "lucide-react";

const RESEARCH_AREAS = [
  {
    icon: FlaskConical,
    title: "Research Applications",
    description:
      "Apply Bayesian Optimization to hyperparameter tuning, materials science, drug discovery and engineering design problems.",
  },
  {
    icon: BarChart3,
    title: "Benchmarking",
    description:
      "Evaluate and compare optimization algorithms under consistent conditions with controlled seeds, budgets and configurations.",
  },
  {
    icon: GitCompareArrows,
    title: "Optimization Analysis",
    description:
      "Analyse convergence behaviour, regret curves, variance and performance across different algorithms and problem types.",
  },
  {
    icon: Repeat,
    title: "Experimental Reproducibility",
    description:
      "Ensure reproducible experiments with fixed seeds, versioned configurations and structured result storage.",
  },
  {
    icon: FileText,
    title: "Benchmark Reports",
    description:
      "Generate structured reports with convergence plots, algorithm rankings and performance summaries for research documentation.",
  },
  {
    icon: Brain,
    title: "AI-Assisted Recommendations",
    description:
      "Leverage AI analysis of problem characteristics and benchmark evidence to identify suitable optimization algorithms.",
  },
];

export function ResearchPanel() {
  return (
    <div>
      <p className="text-sm text-ink-dim mb-6 leading-relaxed">
        HD-BO Bench supports rigorous optimization research through structured
        benchmarking, reproducible experiments and AI-assisted analysis.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESEARCH_AREAS.map((area) => (
          <div
            key={area.title}
            className="rounded-2xl p-5 bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] hover:border-[var(--color-glass-active)] transition-colors"
          >
            <div className="h-10 w-10 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mb-4">
              <area.icon
                size={18}
                className="text-[var(--color-accent-soft)]"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">
              {area.title}
            </h3>
            <p className="text-xs text-ink-dim leading-relaxed">
              {area.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
