import { SectionEyebrow } from "@/components/ui/primitives";

const STEPS = [
  {
    num: "01",
    title: "Registration",
    description: "Create an account and access your research workspace.",
  },
  {
    num: "02",
    title: "Upload Data",
    description: "Upload a dataset and configure the optimization problem.",
  },
  {
    num: "03",
    title: "AI Analysis",
    description: "Analyse dimensions, variable types and problem characteristics.",
  },
  {
    num: "04",
    title: "Configuration",
    description: "Select algorithms, budget, objective and benchmark settings.",
  },
  {
    num: "05",
    title: "Execute",
    description: "Run benchmark experiments using the configured search space.",
  },
  {
    num: "06",
    title: "Compare",
    description: "Compare convergence and performance across algorithms.",
  },
  {
    num: "07",
    title: "Recommend",
    description: "Use benchmark evidence and AI-assisted analysis to identify suitable optimizers.",
  },
  {
    num: "08",
    title: "Generate Reports",
    description: "Generate structured benchmark results for analysis and research.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24" aria-labelledby="workflow-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Benchmark Workflow</SectionEyebrow>
          <h2 id="workflow-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            End-to-end benchmark pipeline
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.num} className="card p-6">
              <div className="text-2xl font-bold text-accent/40 mb-3 font-mono">{step.num}</div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-ink-dim leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
