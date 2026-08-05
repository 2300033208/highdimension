import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  ShieldCheck,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";
import { Card, Button, Badge, SectionEyebrow, Divider } from "@/components/ui/primitives";
import { useState, useEffect } from "react";

// Mock data generator for insights based on algorithm
const generateInsights = (algoName: string = "Bayesian Optimization") => ({
  confidence: Math.floor(Math.random() * 15) + 80, // 80-95
  strengths: [
    "High sample efficiency for expensive evaluations",
    "Handles non-convex objective spaces well",
    "Provides uncertainty estimates naturally"
  ],
  weaknesses: [
    "Computational overhead scales cubically with evaluations",
    "May struggle with very high-dimensional spaces (>20 dims)"
  ],
  radarData: [
    { metric: "Efficiency", value: 95, fullMark: 100 },
    { metric: "Scalability", value: 60, fullMark: 100 },
    { metric: "Robustness", value: 85, fullMark: 100 },
    { metric: "Convergence", value: 90, fullMark: 100 },
    { metric: "Usability", value: 75, fullMark: 100 },
  ],
  decisionFactors: [
    { name: "Dataset Size", impact: "High", description: "Small dataset size favors algorithms with high sample efficiency." },
    { name: "Dimensionality", impact: "Medium", description: "Moderate dimensionality allows GP-based models to perform optimally." },
    { name: "Evaluation Cost", impact: "Critical", description: "Simulated high cost heavily penalized random search methods." }
  ],
  summary: `Based on the characteristics of your dataset and problem statement, ${algoName} was selected as the optimal strategy. Its ability to balance exploration and exploitation makes it highly suited for scenarios where objective function evaluations are costly.`
});

export default function RecommendationInsights() {
  const { experimentId } = useParams();
  const { user } = useAuth();
  
  const experiment = user?.experiments?.find((e) => e.id === experimentId);
  const algoName = experiment?.recommended || experiment?.algorithms?.[0] || "Advanced BO Model";
  
  const [insights, setInsights] = useState(generateInsights(algoName));
  
  useEffect(() => {
    if (experiment) {
      setInsights(generateInsights(algoName));
    }
  }, [algoName, experiment]);

  if (!experiment) {
    return (
      <AppShell>
        <div className="flex h-[80vh] flex-col items-center justify-center p-8">
          <AlertTriangle className="h-12 w-12 text-warn mb-4" />
          <h2 className="text-xl font-semibold mb-2">Experiment Not Found</h2>
          <p className="text-ink-dim mb-6 text-center max-w-md">
            We couldn't find the experiment you're looking for. It may have been deleted or you don't have access.
          </p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link 
              to="/recommendation" 
              className="inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Recommendations
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Insights: {algoName}</h1>
                <p className="text-ink-dim mt-1 text-lg">
                  Detailed analysis for experiment "{experiment.name}"
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-2xl px-6 py-4">
            <div className="flex flex-col">
              <span className="text-sm text-ink-dim font-medium uppercase tracking-wider">Confidence Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-accent">{insights.confidence}%</span>
              </div>
            </div>
            <div className="h-12 w-px bg-[var(--color-glass-border)] mx-2"></div>
            <div className="flex items-center justify-center h-12 w-12 rounded-full border-4 border-accent/20 border-t-accent animate-[spin_3s_linear_infinite]" style={{ animationDuration: '4s' }}>
               <Target className="h-5 w-5 text-accent animate-none" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="flex flex-col gap-4 p-8 h-full">
              <SectionEyebrow>Executive Summary</SectionEyebrow>
              <p className="text-lg leading-relaxed text-ink/90">
                {insights.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="accent" className="px-3 py-1.5 text-sm">
                  <Zap className="h-4 w-4 mr-1.5" /> High Efficiency
                </Badge>
                <Badge variant="success" className="px-3 py-1.5 text-sm">
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> Recommended Choice
                </Badge>
              </div>
            </Card>

            <Card className="p-8">
              <SectionEyebrow>Key Decision Factors</SectionEyebrow>
              <div className="mt-6 space-y-6">
                {insights.decisionFactors.map((factor, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        factor.impact === 'Critical' ? 'bg-danger/10 text-danger' : 
                        factor.impact === 'High' ? 'bg-warn/10 text-warn' : 'bg-success/10 text-success'
                      }`}>
                        <Lightbulb className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-semibold">{factor.name}</h4>
                        <Badge variant={
                          factor.impact === 'Critical' ? 'danger' : 
                          factor.impact === 'High' ? 'warn' : 'success'
                        }>{factor.impact} Impact</Badge>
                      </div>
                      <p className="text-ink-dim">{factor.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card className="p-6">
              <SectionEyebrow>Algorithm Profile</SectionEyebrow>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={insights.radarData}>
                    <PolarGrid stroke="var(--color-glass-border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--color-ink-dim)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={algoName}
                      dataKey="value"
                      stroke="var(--color-accent)"
                      fill="var(--color-accent)"
                      fillOpacity={0.3}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-glass)', 
                        borderColor: 'var(--color-glass-border)',
                        borderRadius: '0.75rem',
                        backdropFilter: 'blur(12px)'
                      }} 
                      itemStyle={{ color: 'var(--color-ink)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <SectionEyebrow>Strengths & Limitations</SectionEyebrow>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-success mb-3">
                    <CheckCircle2 className="h-4 w-4" /> 
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {insights.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <Divider />

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-warn mb-3">
                    <AlertTriangle className="h-4 w-4" /> 
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-warn mt-1.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
