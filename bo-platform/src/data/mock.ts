export type Algorithm = {
  id: string;
  name: string;
  short: string;
  family: "Trust Region" | "Sparse Axis-Aligned" | "Bandit" | "Classical" | "Baseline";
  bestFor: string;
  avgRuntime: number;
  avgAccuracy: number;
  convergenceSpeed: number;
  memoryMb: number;
  scalability: number;
  description: string;
  pros: string[];
  cons: string[];
  workflowDiagram?: string;
  mathConcept?: string;
  idealUseCases?: string[];
  computationalComplexity?: string;
  implementationLibraries?: string[];
};

export const ALGORITHMS: Algorithm[] = [
  {
    id: "vanilla-bo",
    name: "Vanilla Bayesian Optimisation",
    short: "Vanilla BO",
    family: "Baseline",
    bestFor: "Baseline optimization method.",
    avgRuntime: 142,
    avgAccuracy: 0.81,
    convergenceSpeed: 58,
    memoryMb: 210,
    scalability: 34,
    description:
      "Standard GP-based BO with expected improvement acquisition. Reliable baseline but degrades sharply as dimensionality grows past ~20.",
    pros: ["Simple, well understood", "Strong in low dimensions", "Few hyperparameters"],
    cons: ["Poor scaling beyond 20D", "GP cost grows cubically with samples", "Struggles with mixed variable types"],
    mathConcept: "Models the objective function as a Gaussian Process prior and updates it with observations to form a posterior. Uses Expected Improvement (EI) to balance exploration and exploitation.",
    idealUseCases: ["Low-dimensional hyperparameter tuning", "Smooth expensive-to-evaluate functions", "Continuous optimization"],
    computationalComplexity: "O(n³) where n is the number of observations, due to matrix inversion in GP fitting.",
    implementationLibraries: ["BoTorch", "GPyOpt", "Scikit-Optimize"],
  },
  {
    id: "saasbo",
    name: "Sparse Axis-Aligned Subspace BO",
    short: "SAASBO",
    family: "Sparse Axis-Aligned",
    bestFor: "Sparse Axis-Aligned Bayesian Optimization for high-dimensional search.",
    avgRuntime: 486,
    avgAccuracy: 0.93,
    convergenceSpeed: 71,
    memoryMb: 340,
    scalability: 88,
    description:
      "Places a sparsity-inducing prior on GP lengthscales, automatically discovering which of the high-dimensional inputs actually matter.",
    pros: ["Excellent for sparse effective dimensionality", "Strong sample efficiency", "Robust to irrelevant features"],
    cons: ["Fully Bayesian inference is slow", "Assumes axis-aligned sparsity", "Higher compute per iteration"],
    mathConcept: "Applies a sparsity-inducing prior (e.g., Horseshoe prior) on the lengthscales of the GP kernel, driving irrelevant dimensions to large lengthscales (zero impact).",
    idealUseCases: ["High-dimensional optimization", "Problems with many irrelevant features (sparse effective dimensionality)"],
    computationalComplexity: "High due to fully Bayesian inference (NUTS/HMC) needed to integrate over hyperparameters.",
    implementationLibraries: ["BoTorch", "Ax Platform"],
  },
  {
    id: "turbo",
    name: "Trust Region Bayesian Optimisation",
    short: "TuRBO",
    family: "Trust Region",
    bestFor: "Trust Region Bayesian Optimization for scalable optimization.",
    avgRuntime: 208,
    avgAccuracy: 0.91,
    convergenceSpeed: 84,
    memoryMb: 260,
    scalability: 90,
    description:
      "Maintains multiple local trust regions with independent GPs, using a bandit strategy to allocate evaluations. Scales well past 100D.",
    pros: ["Fast convergence", "Scales to 100D+", "Handles multi-modality via local models"],
    cons: ["Multiple trust regions add tuning complexity", "Can under-explore globally", "Restart heuristics need care"],
    mathConcept: "Maintains independent GPs within local trust regions that expand on success and contract on failure. Evaluates points via Thompson Sampling in a multi-armed bandit framework.",
    idealUseCases: ["High-dimensional, multi-modal landscapes", "Large evaluation budgets", "Robotics and reinforcement learning"],
    computationalComplexity: "Scales better than standard BO as GPs are trained on smaller local datasets.",
    implementationLibraries: ["BoTorch", "TuRBO reference implementation"],
  },
  {
    id: "baxus",
    name: "Bayesian Adaptive Random Subspace",
    short: "BAxUS",
    family: "Trust Region",
    bestFor: "Adaptive Random Subspace Optimization.",
    avgRuntime: 312,
    avgAccuracy: 0.89,
    convergenceSpeed: 76,
    memoryMb: 298,
    scalability: 95,
    description:
      "Combines adaptive random embeddings with trust regions, expanding embedding dimensionality as evidence accumulates.",
    pros: ["Best for extreme dimensionality", "Adaptive embedding avoids fixed-size random projection pitfalls", "Good anytime performance"],
    cons: ["Embedding adaptation adds variance across seeds", "Less interpretable subspace", "Requires more iterations to shine"],
    mathConcept: "Projects the high-dimensional space into a lower-dimensional target space using a random matrix. Adapts the size of the target space based on local trust region performance.",
    idealUseCases: ["Extreme dimensionality (500D - 10,000D+)", "Embedded subspace optimization"],
    computationalComplexity: "O(n³) on the target subspace dimension, vastly cheaper than the ambient dimension.",
    implementationLibraries: ["BAxUS reference implementation"],
  },
  {
    id: "hebo",
    name: "Heteroscedastic Evolutionary Bayesian Optimisation",
    short: "HEBO",
    family: "Sparse Axis-Aligned",
    bestFor: "Bayesian Optimization for heterogeneous search spaces.",
    avgRuntime: 264,
    avgAccuracy: 0.90,
    convergenceSpeed: 69,
    memoryMb: 275,
    scalability: 80,
    description:
      "Combines input/output warping with multi-objective acquisition ensembling; winner of the 2020 NeurIPS black-box optimisation challenge.",
    pros: ["Handles noisy objectives well", "Supports categorical/integer inputs natively", "Ensembled acquisition reduces model risk"],
    cons: ["More moving parts to tune", "Warping can be unstable on tiny datasets", "Moderate compute overhead"],
    mathConcept: "Employs Input and Output warping (e.g., Box-Cox transformations) to handle non-stationary and heteroscedastic noise. Combines multiple acquisition functions as a multi-objective optimization problem.",
    idealUseCases: ["Noisy, heteroscedastic objectives", "Mixed variable types (continuous, integer, categorical)", "Real-world engineering problems"],
    computationalComplexity: "Moderate, requires training multiple GPs and solving a multi-objective acquisition problem.",
    implementationLibraries: ["HEBO (Huawei Noah's Ark Lab)"],
  },
  {
    id: "optuna",
    name: "Optuna (TPE Sampler)",
    short: "Optuna",
    family: "Baseline",
    bestFor: "Hyperparameter optimization framework.",
    avgRuntime: 96,
    avgAccuracy: 0.85,
    convergenceSpeed: 74,
    memoryMb: 150,
    scalability: 62,
    description:
      "Tree-structured Parzen Estimator with pruning and define-by-run search spaces. Fast, lightweight and framework agnostic.",
    pros: ["Very fast per-iteration cost", "Great tooling & pruning support", "Handles conditional search spaces"],
    cons: ["No true probabilistic surrogate", "Weaker in continuous high-D spaces", "Less sample efficient than GP methods"],
    mathConcept: "Models the densities of good and bad evaluations using Parzen-window estimators. Selects next points by maximizing the ratio between these densities.",
    idealUseCases: ["Deep learning hyperparameter tuning", "Conditional search spaces", "When fast execution is preferred over sample efficiency"],
    computationalComplexity: "O(n log n) per iteration, extremely fast compared to GP models.",
    implementationLibraries: ["Optuna", "Hyperopt"],
  },
  {
    id: "random-search",
    name: "Random Search",
    short: "Random",
    family: "Classical",
    bestFor: "Baseline optimization method.",
    avgRuntime: 12,
    avgAccuracy: 0.62,
    convergenceSpeed: 20,
    memoryMb: 40,
    scalability: 55,
    description: "Uniform random sampling across the search space. Cheap, trivially parallel, useful as a sanity-check baseline.",
    pros: ["Zero overhead", "Perfectly parallel", "No assumptions about the objective"],
    cons: ["No learning from past evaluations", "Sample-inefficient", "Weak in high dimensions without huge budgets"],
    mathConcept: "Samples points uniformly or logarithmically at random from the search space without any historical memory.",
    idealUseCases: ["Baseline benchmarking", "Embarrassingly parallel budgets with thousands of workers"],
    computationalComplexity: "O(1) per iteration.",
    implementationLibraries: ["Any language/framework"],
  },
  {
    id: "grid-search",
    name: "Grid Search",
    short: "Grid",
    family: "Baseline",
    bestFor: "Exhaustive parameter search.",
    avgRuntime: 18,
    avgAccuracy: 0.58,
    convergenceSpeed: 15,
    memoryMb: 35,
    scalability: 12,
    description: "Exhaustive evaluation over a fixed grid. Combinatorial cost makes it impractical past a handful of dimensions.",
    pros: ["Deterministic & reproducible", "Easy to parallelise", "No hyperparameters"],
    cons: ["Combinatorial explosion with dimensionality", "Wastes budget on irrelevant regions", "Grid resolution is a hidden hyperparameter"],
    mathConcept: "Evaluates the objective function on a predefined Cartesian grid covering the search space.",
    idealUseCases: ["Very low-dimensional problems (1D - 3D)", "Exhaustive sweeps for ground-truth visualization"],
    computationalComplexity: "O(k^d) where k is points per dimension and d is dimensionality.",
    implementationLibraries: ["Scikit-Learn (GridSearchCV)"],
  },
];

export function convergenceSeries(finalValue: number, iterations = 60, noise = 0.02) {
  const data: { iter: number; value: number }[] = [];
  let current = finalValue * 0.35;
  for (let i = 0; i <= iterations; i++) {
    const progress = i / iterations;
    const target = finalValue * (0.35 + 0.65 * (1 - Math.pow(1 - progress, 2.4)));
    current = current + (target - current) * 0.4 + (Math.random() - 0.5) * noise * finalValue * (1 - progress);
    data.push({ iter: i, value: Math.min(finalValue, Math.round(current * 10000) / 10000) });
  }
  data[data.length - 1].value = finalValue;
  return data;
}

export const REFERENCES = [
  { authors: "Eriksson, D. et al.", title: "Scalable Global Optimization via Local Bayesian Optimization (TuRBO)", venue: "NeurIPS 2019" },
  { authors: "Eriksson, D. & Jankowiak, M.", title: "High-Dimensional Bayesian Optimization with Sparse Axis-Aligned Subspaces (SAASBO)", venue: "UAI 2021" },
  { authors: "Papenmeier, L. et al.", title: "Increasing the Scope as You Learn: Adaptive Bayesian Optimization in Nested Subspaces (BAxUS)", venue: "NeurIPS 2022" },
  { authors: "Cowen-Rivers, A. I. et al.", title: "HEBO: Pushing the Limits of Sample-Efficient Hyperparameter Optimisation", venue: "JAIR 2022" },
  { authors: "Akiba, T. et al.", title: "Optuna: A Next-generation Hyperparameter Optimization Framework", venue: "KDD 2019" },
];

export const BENCHMARK_PROBLEMS = [
  {
    id: "ackley",
    name: "Ackley Function",
    category: "Mathematical Optimization",
    dimensionality: "d-dimensional",
    constraints: "None (Box bound)",
    difficulty: "Medium",
    objectiveFunction: "f(x) = -20 exp(-0.2 \\sqrt{1/d \\sum x_i^2}) - exp(1/d \\sum \\cos(2\\pi x_i)) + 20 + e",
    description: "A widely used multimodal test function. It has a nearly flat outer region and a large hole at the centre, posing a risk for optimization algorithms to be trapped in one of its many local minima."
  },
  {
    id: "rosenbrock",
    name: "Rosenbrock Function",
    category: "Mathematical Optimization",
    dimensionality: "d-dimensional",
    constraints: "None (Box bound)",
    difficulty: "Hard",
    objectiveFunction: "f(x) = \\sum_{i=1}^{d-1} [100(x_{i+1} - x_i^2)^2 + (1 - x_i)^2]",
    description: "Also known as the Valley or Banana function, this has a global minimum located inside a long, narrow, parabolic shaped flat valley. Finding the valley is easy, but converging to the global minimum is difficult."
  },
  {
    id: "xgboost",
    name: "XGBoost Hyperparameter Tuning",
    category: "Machine Learning",
    dimensionality: "7D",
    constraints: "Integer & Continuous",
    difficulty: "Medium",
    objectiveFunction: "Maximize AUC / Minimize Log Loss",
    description: "Tuning the key hyperparameters of an XGBoost classifier (learning_rate, max_depth, min_child_weight, subsample, colsample_bytree, gamma, reg_alpha) on a synthetic binary classification dataset."
  },
  {
    id: "svm",
    name: "SVM Hyperparameter Optimization",
    category: "Machine Learning",
    dimensionality: "2D",
    constraints: "Continuous",
    difficulty: "Easy",
    objectiveFunction: "Maximize Accuracy",
    description: "Optimizing the C (regularization parameter) and gamma (kernel coefficient) for a Support Vector Machine with an RBF kernel."
  },
  {
    id: "robot-arm",
    name: "Robot Arm Kinematics",
    category: "Robotics",
    dimensionality: "6D",
    constraints: "Joint limits",
    difficulty: "Hard",
    objectiveFunction: "Minimize End-Effector Distance",
    description: "Finding the optimal joint angles for a 6-DOF robotic arm to reach a specific target position in 3D space while avoiding self-collision."
  }
];

export const DOCS_TOC = [
  {
    section: "Getting Started",
    items: [
      { id: "overview", title: "Project Overview" },
      { id: "guide", title: "User Guide" },
      { id: "quickstart", title: "Quick Start" }
    ]
  },
  {
    section: "Core Concepts",
    items: [
      { id: "bo-basics", title: "Bayesian Optimization Basics" },
      { id: "high-dim", title: "High-Dimensional Concepts" },
      { id: "methodology", title: "Benchmarking Methodology" }
    ]
  },
  {
    section: "Algorithms",
    items: [
      { id: "saasbo-doc", title: "SAASBO" },
      { id: "turbo-doc", title: "TuRBO" },
      { id: "hebo-doc", title: "HEBO" },
      { id: "baxus-doc", title: "BAxUS" }
    ]
  },
  {
    section: "Reference",
    items: [
      { id: "api", title: "API Documentation" },
      { id: "architecture", title: "System Architecture" },
      { id: "faq", title: "Frequently Asked Questions" }
    ]
  }
];
