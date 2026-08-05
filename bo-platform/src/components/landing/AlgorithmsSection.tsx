import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const ALGORITHMS = [
  {
    id: "vanilla-bo",
    name: "Vanilla BO",
    category: "Bayesian Optimization",
    description: "Standard Gaussian Process-based Bayesian Optimization with acquisition function maximization.",
  },
  {
    id: "saasbo",
    name: "SAASBO",
    category: "High-Dimensional BO",
    description: "Sparse Axis-Aligned Subspace Bayesian Optimization for high-dimensional problems with sparsity priors.",
  },
  {
    id: "turbo",
    name: "TuRBO",
    category: "Trust Region BO",
    description: "Trust Region Bayesian Optimization using local probabilistic models within adaptive trust regions.",
  },
  {
    id: "baxus",
    name: "BAxUS",
    category: "Adaptive Subspace BO",
    description: "Bayesian Optimization with Adaptively Expanding Subspaces for efficient high-dimensional search.",
  },
  {
    id: "hebo",
    name: "HEBO",
    category: "Heteroscedastic BO",
    description: "Heteroscedastic Evolutionary Bayesian Optimization combining input and output warping with multi-objective acquisition.",
  },
  {
    id: "optuna",
    name: "Optuna",
    category: "Hyperparameter Framework",
    description: "Define-by-run hyperparameter optimization framework with pruning, TPE sampling and CMA-ES.",
  },
  {
    id: "random-search",
    name: "Random Search",
    category: "Baseline",
    description: "Uniform random sampling across the search space, used as a baseline for optimization comparisons.",
  },
  {
    id: "grid-search",
    name: "Grid Search",
    category: "Baseline",
    description: "Exhaustive grid-based evaluation over discretized parameter combinations across the search space.",
  },
];

export function AlgorithmsSection() {
  return (
    <section id="algorithms" className="py-24" aria-labelledby="algorithms-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Supported Algorithms</SectionEyebrow>
          <h2 id="algorithms-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Bayesian Optimization algorithm ecosystem
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALGORITHMS.map((algo) => (
            <div key={algo.id} className="card card-hover p-6 flex flex-col">
              <span className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase text-accent-soft bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1 w-fit mb-4">
                {algo.category}
              </span>
              <h3 className="text-base font-semibold mb-2">{algo.name}</h3>
              <p className="text-sm text-ink-dim leading-relaxed flex-1">{algo.description}</p>
              <Link
                to={`/algorithms/${algo.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-soft hover:text-accent transition-colors mt-4"
              >
                Learn More
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
