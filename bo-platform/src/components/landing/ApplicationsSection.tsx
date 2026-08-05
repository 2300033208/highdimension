import {
  SlidersHorizontal,
  FlaskConical,
  Atom,
  Wrench,
  Bot,
  TrendingUp,
  Truck,
  Cloud,
  Zap,
  BrainCircuit,
} from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const DOMAINS = [
  { icon: SlidersHorizontal, label: "Hyperparameter Optimization" },
  { icon: FlaskConical, label: "Drug Discovery" },
  { icon: Atom, label: "Materials Science" },
  { icon: Wrench, label: "Engineering Design" },
  { icon: Bot, label: "Robotics" },
  { icon: TrendingUp, label: "Finance" },
  { icon: Truck, label: "Supply Chain" },
  { icon: Cloud, label: "Cloud Computing" },
  { icon: Zap, label: "Energy" },
  { icon: BrainCircuit, label: "Neural Architecture Search" },
];

export function ApplicationsSection() {
  return (
    <section className="py-24" aria-labelledby="applications-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Real-World Applications</SectionEyebrow>
          <h2 id="applications-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            High-dimensional optimisation across domains
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {DOMAINS.map((d) => (
            <div
              key={d.label}
              className="card p-5 text-center hover:border-white/[0.12] transition-colors"
            >
              <d.icon className="h-6 w-6 text-accent-soft mx-auto mb-3" aria-hidden="true" />
              <span className="text-sm font-medium text-ink-dim">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
