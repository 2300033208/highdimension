import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { HeroSection } from "@/components/landing/HeroSection";

export function AuthShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      navigate("/");
    }
  };

  return (
    <>
      {title && (
        <Helmet>
          <title>{title} | HD-BO Bench</title>
        </Helmet>
      )}

      {/* Render the Landing Page Hero Section in the background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-80 overflow-hidden">
        <div className="absolute inset-0 bg-canvas/40 z-10 pointer-events-none" />
        <HeroSection />
      </div>

      <div 
        className="min-h-screen flex items-center justify-center relative z-10 p-4 bg-black/45 backdrop-blur-[20px]"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[430px] bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-[24px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}
