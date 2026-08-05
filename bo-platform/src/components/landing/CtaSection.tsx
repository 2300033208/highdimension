import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/primitives";

export function CtaSection() {
  return (
    <section className="py-24" aria-labelledby="cta-heading">
      <div className="container max-w-2xl text-center">
        <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-gradient">
          Start Benchmarking Smarter
        </h2>
        <p className="mt-4 text-ink-dim leading-relaxed">
          Upload your dataset, configure your optimization problem and compare
          algorithms using HD-BO Bench.
        </p>
        <div className="mt-8">
          <Link to="/register">
            <Button size="lg" className="group">
              Create Free Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
