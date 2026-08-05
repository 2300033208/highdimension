import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4";

export function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden" aria-labelledby="hero-heading">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        src={BG_VIDEO}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-[var(--color-canvas)]/40" aria-hidden="true" />

      {/* Bottom gradient fade into canvas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--color-canvas)] to-transparent"
        aria-hidden="true"
      />

      {/* Hero content — bottom-left */}
      <div className="absolute bottom-0 left-0 z-20 px-6 sm:px-12 pb-6 sm:pb-8 max-w-2xl">
        <p className="text-accent-soft text-xs font-medium tracking-[0.18em] uppercase mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" aria-hidden="true" />
          Benchmark · Compare · Recommend
        </p>

        <h1
          id="hero-heading"
          className="text-ink text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight tracking-tight mb-4"
        >
          High-Dimensional
          <br />
          Bayesian Optimisation
          <br />
          Benchmark Platform
        </h1>



        <div className="flex flex-wrap items-center gap-3">
          <Link to="/?login=true&redirect=/benchmark">
            <button className="bg-[var(--color-accent)] text-white text-sm sm:text-base font-medium px-6 sm:px-7 py-3 rounded-full hover:opacity-90 transition-colors inline-flex items-center gap-2 group">
              Run a Benchmark
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </Link>
          <Link to="/?login=true&redirect=/algorithms">
            <button className="liquid-glass text-ink text-sm sm:text-base font-medium px-6 sm:px-7 py-3 rounded-full hover:bg-[var(--color-glass-hover)] transition-colors inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Explore Algorithms
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex flex-wrap gap-8">
          <div>
            <div className="text-2xl font-medium text-ink">9</div>
            <div className="text-xs text-ink-faint mt-0.5">BO Algorithms</div>
          </div>
          <div>
            <div className="text-2xl font-medium text-ink">500+</div>
            <div className="text-xs text-ink-faint mt-0.5">Dimensions</div>
          </div>
          <div>
            <div className="text-2xl font-medium text-ink">Real-time</div>
            <div className="text-xs text-ink-faint mt-0.5">Benchmark Analytics</div>
          </div>
          <div>
            <div className="text-2xl font-medium text-ink">AI-assisted</div>
            <div className="text-xs text-ink-faint mt-0.5">Recommendations</div>
          </div>
        </div>
      </div>
    </section>
  );
}
