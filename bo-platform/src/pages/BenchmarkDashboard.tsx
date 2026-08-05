import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Download } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ScatterChart,
  Scatter,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, Button } from "@/components/ui/primitives";
import { ALGORITHMS, convergenceSeries } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["#0a84ff", "#5ac8fa", "#30d158", "#ff9f0a", "#bf5af2", "#ff453a", "#a1a1a6", "#64d2ff"];

const selectedAlgos = ALGORITHMS.slice(0, 5);

const convergenceData = (() => {
  const series = selectedAlgos.map((a) => convergenceSeries(a.avgAccuracy, 40));
  return Array.from({ length: 41 }).map((_, i) => {
    const row: Record<string, number> = { iter: i };
    selectedAlgos.forEach((a, idx) => (row[a.short] = series[idx][i].value));
    return row;
  });
})();

const radarData = ["Speed", "Accuracy", "Scalability", "Memory Eff.", "Stability"].map((metric) => {
  const row: Record<string, any> = { metric };
  selectedAlgos.forEach((a) => {
    const base = { Speed: a.convergenceSpeed, Accuracy: a.avgAccuracy * 100, Scalability: a.scalability, "Memory Eff.": 100 - a.memoryMb / 4, Stability: 60 + a.scalability / 3 }[metric];
    row[a.short] = Math.round(base as number);
  });
  return row;
});

const scatterData = ALGORITHMS.map((a, i) => ({ x: a.avgRuntime, y: a.avgAccuracy * 100, z: a.memoryMb, name: a.short, color: COLORS[i] }));

const ranking = [...ALGORITHMS]
  .sort((a, b) => b.avgAccuracy * b.convergenceSpeed - a.avgAccuracy * a.convergenceSpeed)
  .map((a, i) => ({ ...a, rank: i + 1, score: Math.round(a.avgAccuracy * a.convergenceSpeed) }));

export default function BenchmarkDashboard() {
  const [tab, setTab] = useState<"convergence" | "radar" | "scatter" | "heatmap">("convergence");
  const { user } = useAuth();
  const latest = user?.experiments?.[0];
  const title = latest ? (latest.name || latest.datasetName || "Benchmark Experiment") : "Materials bandgap sweep · exp-1042 · 314 dimensions";
  const bestValue = latest?.bestObjective ? latest.bestObjective.toFixed(4) : "0.9421";
  const wallTime = latest?.duration || "14m 22s";
  const algosCount = latest?.algorithms?.length ? latest.algorithms.length.toString() : "5";

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Benchmark Dashboard</h1>
          <p className="text-sm text-ink-dim mt-1">{title}</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" /> Export Results
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          ["Best Objective", bestValue],
          ["Iterations", "150"],
          ["Wall Time", wallTime],
          ["Memory Peak", "340MB"],
          ["Confidence", "94.2%"],
          ["Algorithms", algosCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-4">
            <div className="text-xs text-ink-faint mb-1.5">{label}</div>
            <div className="text-lg font-semibold font-mono">{value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden mb-8">
        <div className="flex items-center gap-1 p-2 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          {[
            ["convergence", "Convergence Plot"],
            ["radar", "Radar Comparison"],
            ["scatter", "Runtime vs Accuracy"],
            ["heatmap", "Ranking Heatmap"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                tab === key ? "bg-white/[0.08] text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "convergence" && (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={convergenceData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="iter" stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#17171b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {selectedAlgos.map((a, i) => (
                  <Line key={a.short} type="monotone" dataKey={a.short} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {tab === "radar" && (
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" stroke="#a1a1a6" fontSize={12} />
                {selectedAlgos.map((a, i) => (
                  <Radar key={a.short} name={a.short} dataKey={a.short} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.08} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#17171b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {tab === "scatter" && (
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" dataKey="x" name="Runtime (s)" stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Accuracy (%)" stroke="#6e6e73" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#17171b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Scatter data={scatterData} fill="#0a84ff">
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {tab === "heatmap" && (
            <div className="grid grid-cols-1 gap-1.5">
              {ranking.map((a) => (
                <div key={a.id} className="flex items-center gap-4 py-2">
                  <span className="w-6 text-xs text-ink-faint font-mono">{a.rank}</span>
                  <span className="w-28 text-sm truncate">{a.short}</span>
                  <div className="flex-1 h-6 rounded-md overflow-hidden bg-white/[0.04]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-md"
                      style={{ background: `linear-gradient(90deg, #0a84ff, #5ac8fa)`, opacity: 0.4 + a.score / 200 }}
                    />
                  </div>
                  <span className="w-10 text-xs font-mono text-right">{a.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 pt-6 pb-4">
          <Trophy className="h-4 w-4 text-warn" />
          <h3 className="font-semibold">Algorithm Ranking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint text-xs border-y border-white/[0.06]">
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Algorithm</th>
                <th className="px-6 py-3 font-medium">Runtime</th>
                <th className="px-6 py-3 font-medium">Accuracy</th>
                <th className="px-6 py-3 font-medium">Convergence</th>
                <th className="px-6 py-3 font-medium">Memory</th>
                <th className="px-6 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((a) => (
                <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    {a.rank === 1 ? <Badge variant="accent">#1</Badge> : <span className="text-ink-faint">#{a.rank}</span>}
                  </td>
                  <td className="px-6 py-4 font-medium">{a.short}</td>
                  <td className="px-6 py-4 font-mono text-xs">{a.avgRuntime}s</td>
                  <td className="px-6 py-4 font-mono text-xs">{(a.avgAccuracy * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 font-mono text-xs">{a.convergenceSpeed}/100</td>
                  <td className="px-6 py-4 font-mono text-xs">{a.memoryMb}MB</td>
                  <td className="px-6 py-4 font-mono text-xs text-accent-soft">{a.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
