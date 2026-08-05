import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { OptimizationLandscape } from "@/components/OptimizationLandscape";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden dot-grid">
      <div className="absolute inset-0 opacity-20">
        <OptimizationLandscape className="w-full h-full" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center"
      >
        <h1 className="text-7xl font-bold text-gradient mb-4">404</h1>
        <p className="text-ink-dim mb-8">This search never converged — the page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button size="lg">
            <Home className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
