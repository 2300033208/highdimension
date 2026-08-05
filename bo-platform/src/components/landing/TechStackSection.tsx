import { SectionEyebrow } from "@/components/ui/primitives";

const TECH = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Spring Boot", category: "Backend" },
  { name: "Java", category: "Backend" },
  { name: "Python", category: "AI Engine" },
  { name: "PostgreSQL", category: "Database" },
  { name: "JWT", category: "Security" },
  { name: "Swagger", category: "API" },
  { name: "Docker", category: "Deployment" },
];

export function TechStackSection() {
  return (
    <section className="py-24" aria-labelledby="tech-heading">
      <div className="container">
        <div className="text-center mb-16">
          <SectionEyebrow>Powered By</SectionEyebrow>
          <h2 id="tech-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
            Modern research technology stack
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {TECH.map((t) => (
            <div
              key={t.name}
              className="card px-5 py-3 flex items-center gap-3 hover:border-white/[0.12] transition-colors"
            >
              <span className="text-sm font-medium">{t.name}</span>
              <span className="text-[10px] text-ink-faint uppercase tracking-wider">{t.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
