import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ALGORITHMS = [
  {
    id: "vanilla-bo",
    name: "Vanilla BO",
    category: "Bayesian Optimization",
    description:
      "Standard Gaussian Process-based Bayesian Optimization with acquisition function maximization.",
  },
  {
    id: "saasbo",
    name: "SAASBO",
    category: "High-Dimensional BO",
    description:
      "Sparse Axis-Aligned Subspace BO for high-dimensional problems with sparsity priors.",
  },
  {
    id: "turbo",
    name: "TuRBO",
    category: "Trust Region BO",
    description:
      "Trust Region BO using local probabilistic models within adaptive trust regions.",
  },
  {
    id: "baxus",
    name: "BAxUS",
    category: "Adaptive Subspace BO",
    description:
      "BO with Adaptively Expanding Subspaces for efficient high-dimensional search.",
  },
  {
    id: "hebo",
    name: "HEBO",
    category: "Heteroscedastic BO",
    description:
      "Heteroscedastic Evolutionary BO combining input/output warping with multi-objective acquisition.",
  },
  {
    id: "optuna",
    name: "Optuna",
    category: "Hyperparameter Framework",
    description:
      "Define-by-run optimization framework with pruning, TPE sampling and CMA-ES.",
  },
  {
    id: "random-search",
    name: "Random Search",
    category: "Baseline",
    description:
      "Uniform random sampling across the search space as a baseline for comparisons.",
  },
  {
    id: "grid-search",
    name: "Grid Search",
    category: "Baseline",
    description:
      "Exhaustive grid-based evaluation over discretized parameter combinations.",
  },
];

export function AlgorithmsPanel() {
  return (
    <div>
      <p className="text-sm text-ink-dim mb-6 leading-relaxed">
        HD-BO Bench supports nine optimization algorithms spanning Bayesian
        Optimization, hyperparameter frameworks and baseline methods.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALGORITHMS.map((algo) => (
          <div
            key={algo.id}
            className="rounded-2xl p-5 bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] hover:border-[var(--color-glass-active)] transition-colors flex flex-col"
          >
            <span className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--color-accent-soft)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-full px-2.5 py-0.5 w-fit mb-3">
              {algo.category}
            </span>
            <h3 className="text-sm font-semibold text-ink mb-1.5">
              {algo.name}
            </h3>
            <p className="text-xs text-ink-dim leading-relaxed flex-1">
              {algo.description}
            </p>
            <Link
              to={`/algorithms/${algo.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors mt-3"
            >
              Learn More
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
