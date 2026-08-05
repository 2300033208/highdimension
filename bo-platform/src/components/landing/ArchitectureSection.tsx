import { Monitor, Server, Cpu, Database, ChevronDown } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const LAYERS = [
  {
    icon: Monitor,
    title: "React Frontend",
    description: "UI, visualisations and data input",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: Server,
    title: "Spring Boot Backend",
    description: "Authentication, business logic and orchestration",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    icon: Cpu,
    title: "Python AI Engine",
    description: "Bayesian Optimization execution and AI recommendations",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: Database,
    title: "PostgreSQL Database",
    description: "Users, datasets, experiments and benchmark results",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24" aria-labelledby="architecture-heading">
      <div className="container max-w-2xl">
        <div className="text-center mb-16">
          <SectionEyebrow>System Architecture</SectionEyebrow>
          <h2 id="architecture-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Research-grade distributed processing
          </h2>
        </div>

        <div className="space-y-0">
          {LAYERS.map((layer, i) => (
            <div key={layer.title}>
              <div className="card p-5 flex items-center gap-5">
                <div className={`h-12 w-12 rounded-xl ${layer.bg} border ${layer.border} flex items-center justify-center shrink-0`}>
                  <layer.icon className={`h-5 w-5 ${layer.color}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{layer.title}</h3>
                  <p className="text-xs text-ink-dim mt-0.5">{layer.description}</p>
                </div>
              </div>
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="h-4 w-4 text-ink-faint" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
