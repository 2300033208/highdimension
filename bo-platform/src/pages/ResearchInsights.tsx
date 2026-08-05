import { BookOpen, FlaskConical, GitBranch, Target, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, SectionEyebrow } from "@/components/ui/primitives";
import { REFERENCES } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";

export default function ResearchInsights() {
  const { user } = useAuth();
  const datasets = user?.datasets || [];
  return (
    <AppShell>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Research Insights</h1>
        <p className="text-sm text-ink-dim mt-1">Background, methodology and references underpinning this platform.</p>
      </div>

      <section className="mb-10">
        <SectionEyebrow>Literature Review</SectionEyebrow>
        <Card>
          <p className="text-sm text-ink-dim leading-relaxed">
            Bayesian Optimisation (BO) is a sample-efficient strategy for optimising expensive
            black-box objectives using a probabilistic surrogate model, typically a Gaussian
            Process, paired with an acquisition function. Classical BO is well studied for
            problems with fewer than roughly 20 dimensions, but its Gaussian Process surrogate
            scales cubically with the number of observations and its acquisition landscape
            becomes increasingly flat and multi-modal as dimensionality grows. This has driven
            a distinct line of research into high-dimensional BO, spanning sparsity-inducing
            priors (SAASBO), local trust-region methods (TuRBO), adaptive embeddings (BAxUS),
            and ensembled acquisition strategies (HEBO), alongside bandit-style samplers such
            as Optuna's Tree-structured Parzen Estimator. No single method dominates across
            problem types, motivating a benchmark-and-recommend approach rather than a single
            default optimiser.
          </p>
        </Card>
      </section>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <section>
          <SectionEyebrow>Problem Statement</SectionEyebrow>
          <Card className="h-full">
            <Target className="h-5 w-5 text-accent-soft mb-3" />
            <p className="text-sm text-ink-dim leading-relaxed">
              Practitioners working on high-dimensional black-box problems — materials
              composition search, neural architecture search, robotic controller tuning —
              lack a principled, reproducible way to compare optimisers under identical
              budgets and choose the one best suited to their problem's shape. Manual
              comparison is time-consuming, rarely reproducible, and biased toward whichever
              method the researcher already knows.
            </p>
          </Card>
        </section>
        <section>
          <SectionEyebrow>Methodology</SectionEyebrow>
          <Card className="h-full">
            <GitBranch className="h-5 w-5 text-accent-soft mb-3" />
            <p className="text-sm text-ink-dim leading-relaxed">
              Each benchmark run evaluates all selected algorithms against the same objective,
              dataset split and evaluation budget across multiple seeds. We record best
              objective value, convergence trajectory, wall-clock runtime, peak memory and
              variance across seeds, then combine these into a confidence-scored ranking that
              accounts for problem dimensionality and estimated effective sparsity.
            </p>
          </Card>
        </section>
      </div>

      <section className="mb-10">
        <SectionEyebrow>Benchmark Datasets</SectionEyebrow>
        {datasets.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((d) => (
              <Card key={d.id} className="card-hover">
                <Layers className="h-4 w-4 text-accent-soft mb-3" />
                <p className="text-sm font-medium truncate">{d.name}</p>
                <p className="text-xs text-ink-faint mt-1">{d.dimensionality}D · target: {d.target}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <Layers className="h-6 w-6 text-ink-faint mx-auto mb-2" />
            <p className="text-sm text-ink-faint">Upload datasets to see them here.</p>
          </Card>
        )}
      </section>

      <section className="mb-10">
        <SectionEyebrow>Comparison of BO Methods</SectionEyebrow>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-faint text-xs border-b border-white/[0.06]">
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium">Core idea</th>
                  <th className="px-6 py-3 font-medium">Best suited to</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["SAASBO", "Sparsity-inducing lengthscale priors", "Sparse effective dimensionality"],
                  ["TuRBO", "Multiple local trust regions", "Multi-modal, 100D+ landscapes"],
                  ["BAxUS", "Adaptive random subspace embeddings", "Extreme dimensionality (500D+)"],
                  ["HEBO", "Input/output warping + ensembled acquisition", "Noisy, mixed-type objectives"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-white/[0.04]">
                    {row.map((cell, i) => (
                      <td key={i} className={`px-6 py-4 ${i === 0 ? "font-medium" : "text-ink-dim"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mb-10">
        <SectionEyebrow>Future Research Scope</SectionEyebrow>
        <Card>
          <FlaskConical className="h-5 w-5 text-accent-soft mb-3" />
          <ul className="text-sm text-ink-dim space-y-2.5 leading-relaxed list-disc list-inside">
            <li>Meta-learning across historical benchmarks to warm-start recommendations for new problem shapes.</li>
            <li>Multi-fidelity benchmarking to reduce evaluation cost on expensive real-world objectives.</li>
            <li>Extending the recommendation engine to multi-objective and constrained optimisation settings.</li>
          </ul>
        </Card>
      </section>

      <section>
        <SectionEyebrow>References</SectionEyebrow>
        <div className="space-y-3">
          {REFERENCES.map((r) => (
            <Card key={r.title} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <BookOpen className="h-4 w-4 text-accent-soft shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{r.authors} — <span className="text-ink-dim">{r.title}</span></p>
              </div>
              <Badge className="shrink-0 w-fit">{r.venue}</Badge>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
