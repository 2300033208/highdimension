import { Navbar, type SectionId } from "@/components/layout/Navbar";

import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

import { HeroSection } from "@/components/landing/HeroSection";

import { LoginModal } from "@/components/auth/LoginModal";
import { GlassSectionModal } from "@/components/landing/GlassSectionModal";
import { HowItWorksPanel } from "@/components/landing/HowItWorksPanel";
import { AlgorithmsPanel } from "@/components/landing/AlgorithmsPanel";
import { ResearchPanel } from "@/components/landing/ResearchPanel";
import { AboutUsPanel } from "@/components/landing/AboutUsPanel";
import { ContactUsPanel } from "@/components/landing/ContactUsPanel";

const PANEL_CONFIG: Record<
  SectionId,
  { title: string; direction: "left" | "right" | "bottom"; labelId: string }
> = {
  "how-it-works": {
    title: "How It Works",
    direction: "left",
    labelId: "glass-how-it-works",
  },
  algorithms: {
    title: "Algorithms",
    direction: "right",
    labelId: "glass-algorithms",
  },
  research: {
    title: "Research",
    direction: "bottom",
    labelId: "glass-research",
  },
  "about-us": {
    title: "About Us",
    direction: "left",
    labelId: "glass-about-us",
  },
  "contact-us": {
    title: "Contact Us",
    direction: "right",
    labelId: "glass-contact-us",
  },
};

export default function Landing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showLogin = searchParams.get("login") === "true";
  const [activePanel, setActivePanel] = useState<SectionId | null>(null);

  const closeLogin = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSectionClick = useCallback((section: SectionId | null) => {
    setActivePanel(section);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <Helmet>
        <title>HyperBench — High-Dimensional Bayesian Optimisation Benchmark Platform</title>
        <meta name="description" content="HyperBench is a research platform for benchmarking Bayesian Optimization algorithms across high-dimensional search spaces." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="HyperBench — High-Dimensional Bayesian Optimisation Benchmark Platform" />
        <meta property="og:description" content="HyperBench is a research platform for benchmarking Bayesian Optimization algorithms across high-dimensional search spaces." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HyperBench" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HyperBench — High-Dimensional Bayesian Optimisation Benchmark Platform" />
        <meta name="twitter:description" content="HyperBench is a research platform for benchmarking Bayesian Optimization algorithms across high-dimensional search spaces." />
      </Helmet>
      
      <AnimatePresence>
        {showLogin && <LoginModal onClose={closeLogin} />}
      </AnimatePresence>

      <Navbar
        onSectionClick={handleSectionClick}
        activeSection={activePanel}
      />
      
      <main>
        <HeroSection />
      </main>

      {/* Glass section modals */}
      {(Object.keys(PANEL_CONFIG) as SectionId[]).map((sectionId) => {
        const config = PANEL_CONFIG[sectionId];
        return (
          <GlassSectionModal
            key={sectionId}
            isOpen={activePanel === sectionId}
            onClose={handleClosePanel}
            direction={config.direction}
            title={config.title}
            labelId={config.labelId}
          >
            {sectionId === "how-it-works" && <HowItWorksPanel />}
            {sectionId === "algorithms" && <AlgorithmsPanel />}
            {sectionId === "research" && <ResearchPanel />}
            {sectionId === "about-us" && <AboutUsPanel />}
            {sectionId === "contact-us" && <ContactUsPanel />}
          </GlassSectionModal>
        );
      })}
    </div>
  );
}
