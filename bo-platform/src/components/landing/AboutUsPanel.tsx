import { Card } from "@/components/ui/primitives";
import { Users, Target, Shield, Zap } from "lucide-react";

export function AboutUsPanel() {
  const values = [
    {
      title: "Research-Driven",
      description: "Built by researchers for researchers. We understand the nuances of high-dimensional optimization.",
      icon: Target,
      bgColor: "var(--color-accent)/20",
      textColor: "var(--color-accent)"
    },
    {
      title: "Performance First",
      description: "Optimized infrastructure ensuring minimal overhead during expensive benchmark evaluations.",
      icon: Zap,
      bgColor: "var(--color-warn)/20",
      textColor: "var(--color-warn)"
    },
    {
      title: "Transparent & Open",
      description: "We believe in open science. Our benchmark methodologies and baseline results are fully documented.",
      icon: Shield,
      bgColor: "var(--color-success)/20",
      textColor: "var(--color-success)"
    }
  ];

  return (
    <div className="h-full flex flex-col p-6 sm:p-10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink mb-4">About HyperBench</h2>
        <p className="text-ink-dim text-lg max-w-2xl mx-auto leading-relaxed">
          We are a dedicated team of machine learning researchers and software engineers on a mission to standardise the evaluation of Bayesian Optimization algorithms in complex, high-dimensional search spaces.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <Card key={i} className="bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)] transition-colors p-6">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: value.bgColor }}>
                  <Icon className="h-6 w-6" style={{ color: value.textColor }} />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{value.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{value.description}</p>
              </Card>
            );
          })}
        </div>


      </div>
    </div>
  );
}
