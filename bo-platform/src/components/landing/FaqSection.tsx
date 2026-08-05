import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const FAQS = [
  {
    q: "What is high-dimensional Bayesian Optimization?",
    a: "High-dimensional Bayesian Optimization extends standard BO to efficiently optimize expensive black-box functions with hundreds or thousands of input variables, using techniques like subspace embeddings, trust regions and sparsity priors to overcome the curse of dimensionality.",
  },
  {
    q: "What algorithms are supported?",
    a: "HD-BO Bench supports nine algorithms: Vanilla BO, SAASBO, TuRBO, BAxUS, HEBO, Optuna, Random Search, and Grid Search. Each algorithm can be configured and compared under consistent benchmark settings.",
  },
  {
    q: "Can I upload my own dataset?",
    a: "Yes. You can upload CSV datasets, define variable types, specify the objective column and configure the optimization problem directly through the platform interface.",
  },
  {
    q: "How are algorithms compared?",
    a: "Algorithms are evaluated under identical benchmark configurations including the same dataset, budget, seeds and objective. The platform tracks convergence curves, best-found values, variance and runtime to produce fair comparisons.",
  },
  {
    q: "How does the recommendation system work?",
    a: "The AI recommendation engine analyses problem characteristics such as dimensionality, variable types and search space structure, combined with benchmark results, to suggest the most suitable optimization algorithms for your specific problem.",
  },
  {
    q: "Can I generate benchmark reports?",
    a: "Yes. After running benchmarks, you can generate structured reports containing convergence plots, algorithm rankings, configuration details and performance summaries for use in research documentation.",
  },
  {
    q: "Is my research data protected?",
    a: "Yes. The platform uses JWT-based authentication, secure password hashing, role-based access control and encrypted data storage to protect your datasets, experiments and benchmark results.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24" aria-labelledby="faq-heading">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left text-sm font-medium hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-ink-faint shrink-0 ml-4 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {openIndex === i && (
                <div id={`faq-answer-${i}`} className="px-5 pb-5 text-sm text-ink-dim leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
