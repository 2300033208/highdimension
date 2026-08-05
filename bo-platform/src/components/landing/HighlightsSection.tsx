import { Brain, GitCompareArrows, BarChart3, FolderOpen } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const HIGHLIGHTS = [
  {
    icon: Brain,
    title: "AI Recommendation Engine",
    description:
      "Analyse problem characteristics and benchmark results to identify suitable optimization algorithms.",
  },
  {
    icon: GitCompareArrows,
    title: "Multi-Algorithm Benchmarking",
    description:
      "Compare multiple Bayesian Optimization and baseline algorithms under consistent benchmark configurations.",
  },
  {
    icon: BarChart3,
    title: "Interactive Analytics",
    description:
      "Visualise convergence, performance, variance and benchmark results through interactive analytics.",
  },
  {
    icon: FolderOpen,
    title: "Research Workspace",
    description:
      "Keep datasets, configurations, seeds and benchmark results organised for reproducible research.",
  },
];

export function HighlightsSection() {
  return (
    <section id="features" className="py-24" aria-labelledby="highlights-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Platform Highlights</SectionEyebrow>
          <h2 id="highlights-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Everything you need to evaluate your optimiser
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="card card-hover p-6">
              <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                <item.icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-ink-dim leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
