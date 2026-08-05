import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Terminal, 
  Code, 
  Cpu, 
  Search,
  ChevronRight
} from "lucide-react";
import { Card, Input } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

// Types
type DocSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
};

const DOC_SECTIONS: DocSection[] = [
  {
    id: "guide",
    title: "User Guide",
    icon: Terminal,
    content: (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-4">User Guide</h1>
        <p className="text-lg text-ink-dim leading-relaxed">
          Follow these steps to configure and run your first Bayesian Optimization experiment.
        </p>

        <div className="mt-8 space-y-8">
          <div className="flex gap-4 bg-[var(--color-glass)] p-6 rounded-2xl border border-[var(--color-glass-border)]">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold text-sm shadow-glow">1</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Upload Dataset</h3>
              <p className="text-ink-dim">Navigate to the Data Upload section and provide a clean CSV containing your objective metrics and parameter spaces. Ensure proper headers are provided.</p>
            </div>
          </div>
          <div className="flex gap-4 bg-[var(--color-glass)] p-6 rounded-2xl border border-[var(--color-glass-border)]">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold text-sm shadow-glow">2</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Configure Parameters</h3>
              <p className="text-ink-dim">Select your acquisition function (e.g., Expected Improvement, UCB) and base estimator (e.g., Gaussian Process). Set the bounds carefully.</p>
            </div>
          </div>
          <div className="flex gap-4 bg-[var(--color-glass)] p-6 rounded-2xl border border-[var(--color-glass-border)]">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold text-sm shadow-glow">3</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Run & Analyze</h3>
              <p className="text-ink-dim">Execute the experiment and monitor the visualisations in real-time as the algorithm explores the bounds and exploits promising areas.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState<string>(DOC_SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = DOC_SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-6rem)] md:flex-row gap-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-6">
        
        {/* Sidebar */}
        <Card className="w-full md:w-72 flex-shrink-0 flex flex-col p-4 h-full overflow-hidden">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input 
              placeholder="Search docs..." 
              className="pl-9 h-10 bg-[var(--color-glass-input)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="text-xs font-semibold tracking-wider text-ink-dim uppercase mb-3 px-2">
            Contents
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeSection === section.id 
                    ? "bg-accent/10 text-accent" 
                    : "text-ink-dim hover:bg-[var(--color-glass-hover)] hover:text-ink"
                )}
              >
                <section.icon className={cn(
                  "h-4 w-4", 
                  activeSection === section.id ? "text-accent" : "text-ink-dim"
                )} />
                {section.title}
              </button>
            ))}
            
            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-sm text-ink-dim">
                No sections found.
              </div>
            )}
          </nav>
        </Card>

        {/* Main Content Area */}
        <Card className="flex-1 overflow-hidden relative p-0">
          <div className="absolute inset-0 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
            <AnimatePresence mode="wait">
              {DOC_SECTIONS.map((section) => (
                activeSection === section.id && (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {section.content}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
