import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Filter, Download, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { ALGORITHMS, convergenceSeries } from "@/data/mock";

const COLORS = ["#0a84ff", "#5ac8fa", "#30d158", "#ff9f0a", "#bf5af2", "#ff453a", "#a1a1a6", "#64d2ff"];

// Parallel-coordinates style: normalised metrics per algorithm across axes
const AXES = ["Runtime", "Accuracy", "Convergence", "Scalability", "Memory"];
function normalize(a: (typeof ALGORITHMS)[number], key: string) {
  switch (key) {
    case "Runtime": return 100 - Math.min(100, (a.avgRuntime / 500) * 100);
    case "Accuracy": return a.avgAccuracy * 100;
    case "Convergence": return a.convergenceSpeed;
    case "Scalability": return a.scalability;
    case "Memory": return 100 - Math.min(100, (a.memoryMb / 500) * 100);
    default: return 0;
  }
}

export default function Visualisations() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = ALGORITHMS.filter((a) => filter === "all" || a.family === filter);
  const families = ["all", ...Array.from(new Set(ALGORITHMS.map((a) => a.family)))];

  const runtimeSeries = filtered.slice(0, 5).map((a) => convergenceSeries(a.avgAccuracy, 30));
  const areaData = Array.from({ length: 31 }).map((_, i) => {
    const row: Record<string, number> = { iter: i };
    filtered.slice(0, 5).forEach((a, idx) => (row[a.short] = runtimeSeries[idx][i].value));
    return row;
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visualisations</h1>
          <p className="text-sm text-ink-dim mt-1">Interactive analytics across all benchmark runs.</p>
        </div>
        <Button variant="secondary"><Download className="h-4 w-4" /> Export charts</Button>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        <Filter className="h-4 w-4 text-ink-faint shrink-0" />
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
              filter === f ? "border-accent/60 bg-accent/10 text-accent-soft" : "border-white/[0.1] text-ink-dim hover:text-ink"
            }`}
          >
            {f === "all" ? "All families" : f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold mb-1">Runtime Comparison</h3>
          <p className="text-xs text-ink-faint mb-6">Convergence area across selected algorithms</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData}>
              <defs>
                {filtered.slice(0, 5).map((a, i) => (
                  <linearGradient key={a.short} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[i]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="iter" stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#17171b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {filtered.slice(0, 5).map((a, i) => (
                <Area key={a.short} type="monotone" dataKey={a.short} stroke={COLORS[i]} fill={`url(#grad-${i})`} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold mb-1">Parallel Coordinates</h3>
          <p className="text-xs text-ink-faint mb-6">Normalised metric profile per algorithm (higher is better)</p>
          <svg viewBox="0 0 480 300" className="w-full h-[300px]">
            {AXES.map((axis, i) => (
              <g key={axis}>
                <line x1={40 + i * 100} y1={20} x2={40 + i * 100} y2={260} stroke="rgba(255,255,255,0.1)" />
                <text x={40 + i * 100} y={280} fill="#6e6e73" fontSize="10" textAnchor="middle">{axis}</text>
              </g>
            ))}
            {filtered.map((a, ai) => {
              const points = AXES.map((axis, i) => {
                const val = normalize(a, axis);
                const y = 260 - (val / 100) * 240;
                return `${40 + i * 100},${y}`;
              }).join(" ");
              return (
                <polyline
                  key={a.id}
                  points={points}
                  fill="none"
                  stroke={COLORS[ai % COLORS.length]}
                  strokeWidth={1.5}
                  opacity={0.75}
                />
              );
            })}
          </svg>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-6 pb-4">
          <Trophy className="h-4 w-4 text-warn" />
          <h3 className="font-semibold">Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint text-xs border-y border-white/[0.06]">
                <th className="px-6 py-3 font-medium">Algorithm</th>
                <th className="px-6 py-3 font-medium">Family</th>
                <th className="px-6 py-3 font-medium">Runs</th>
                <th className="px-6 py-3 font-medium">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].sort((a, b) => b.avgAccuracy - a.avgAccuracy).map((a, i) => (
                <tr key={a.id} className="border-b border-white/[0.04]">
                  <td className="px-6 py-4 font-medium">{a.short}</td>
                  <td className="px-6 py-4"><Badge>{a.family}</Badge></td>
                  <td className="px-6 py-4 font-mono text-xs">{34 - i * 3}</td>
                  <td className="px-6 py-4 font-mono text-xs text-accent-soft">{Math.round((a.avgAccuracy) * 60)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
