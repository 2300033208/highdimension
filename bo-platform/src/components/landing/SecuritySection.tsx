import { KeyRound, Lock, ShieldCheck, DatabaseZap } from "lucide-react";
import { SectionEyebrow } from "@/components/ui/primitives";

const SECURITY_CARDS = [
  {
    icon: KeyRound,
    title: "JWT Authentication",
    description: "Secure token-based authentication for API access.",
  },
  {
    icon: Lock,
    title: "Password Security",
    description: "Use secure password hashing and credential protection.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description: "Control access based on user roles and permissions.",
  },
  {
    icon: DatabaseZap,
    title: "Data Protection",
    description: "Protect datasets, experiments and benchmark results.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-24" aria-labelledby="security-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Enterprise Security</SectionEyebrow>
          <h2 id="security-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Your research data, securely protected
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {SECURITY_CARDS.map((card) => (
            <div key={card.title} className="card p-6 text-center">
              <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <card.icon className="h-5 w-5 text-accent-soft" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold mb-2">{card.title}</h3>
              <p className="text-xs text-ink-dim leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
