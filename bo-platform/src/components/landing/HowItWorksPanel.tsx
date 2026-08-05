export function HowItWorksPanel() {
  const steps = [
    {
      num: "01",
      title: "Registration",
      description:
        "Create an account and access your research workspace.",
    },
    {
      num: "02",
      title: "Upload Dataset",
      description:
        "Upload a dataset and configure the optimization problem.",
    },
    {
      num: "03",
      title: "AI Analysis",
      description:
        "Analyse dimensions, variable types and problem characteristics.",
    },
    {
      num: "04",
      title: "Configure Benchmark",
      description:
        "Select algorithms, budget, objective and benchmark settings.",
    },
    {
      num: "05",
      title: "Execute Benchmark",
      description:
        "Run benchmark experiments using the configured search space.",
    },
    {
      num: "06",
      title: "Compare Results",
      description:
        "Compare convergence and performance across algorithms.",
    },
    {
      num: "07",
      title: "AI Recommendation",
      description:
        "Use benchmark evidence and AI-assisted analysis to identify suitable optimizers.",
    },
    {
      num: "08",
      title: "Generate Report",
      description:
        "Generate structured benchmark results for analysis and research.",
    },
  ];

  return (
    <div>
      <p className="text-sm text-ink-dim mb-6 leading-relaxed">
        HD-BO Bench provides an end-to-end benchmark pipeline — from dataset
        upload to AI-assisted algorithm recommendation and report generation.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-2xl p-5 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] hover:border-[var(--color-glass-active)] transition-colors"
          >
            <div className="text-xl font-bold text-[var(--color-accent)]/40 font-mono mb-2 opacity-40">
              {step.num}
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">
              {step.title}
            </h3>
            <p className="text-xs text-ink-dim leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
