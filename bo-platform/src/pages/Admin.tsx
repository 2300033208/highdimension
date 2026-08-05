import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Users, Activity, FlaskConical, FileText, Search, MoreVertical, MessageSquareText, Database } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, Input } from "@/components/ui/primitives";
import { useAuth } from "@/contexts/AuthContext";

const statusVariant: Record<string, "default" | "success" | "warn" | "danger"> = {
  Active: "success",
  Suspended: "danger",
};

const expStatusVariant: Record<string, "default" | "success" | "warn" | "danger" | "accent"> = {
  Completed: "success",
  Running: "accent",
  Queued: "warn",
  Failed: "danger",
};

export default function Admin() {
  const { users } = useAuth();
  const [tab, setTab] = useState<"users" | "experiments">("users");
  const [query, setQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const totalExperiments = users.reduce((sum, u) => sum + u.experiments.length, 0);
  const totalDatasets = users.reduce((sum, u) => sum + u.datasets.length, 0);
  const totalReports = users.reduce((sum, u) => sum + u.reports.length, 0);
  const totalProblemStatements = users.reduce((sum, u) => sum + u.problemStatements.length, 0);

  const allExperiments = users.flatMap((u) =>
    u.experiments.map((e) => ({ ...e, userName: u.name, userEmail: u.email }))
  );

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-ink-dim mt-1">Manage users, experiments, and platform overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          ["Total Users", String(users.length), Users],
          ["Total Experiments", String(totalExperiments), FlaskConical],
          ["Datasets Uploaded", String(totalDatasets), Database],
          ["Problem Statements", String(totalProblemStatements), MessageSquareText],
          ["Reports Generated", String(totalReports), FileText],
        ].map(([label, value, Icon]: any) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Icon className="h-4 w-4 text-accent-soft" />
              </div>
            </div>
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-xs text-ink-faint mt-1">{label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-[var(--color-glass-border)]">
          {(["users", "experiments"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm capitalize transition-colors ${
                tab === t ? "bg-[var(--color-glass-active)] text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
          {tab === "users" && (
            <div className="relative ml-auto mr-2 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" className="h-9 pl-9 w-56" />
            </div>
          )}
        </div>

        {tab === "users" && (
          <div className="overflow-x-auto">
            {filteredUsers.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-faint text-xs border-b border-[var(--color-glass-border)]">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Registered</th>
                    <th className="px-6 py-3 font-medium">Last Login</th>
                    <th className="px-6 py-3 font-medium">Experiments</th>
                    <th className="px-6 py-3 font-medium">Datasets</th>
                    <th className="px-6 py-3 font-medium">Problems</th>
                    <th className="px-6 py-3 font-medium">Reports</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]">
                      <td className="px-6 py-4">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-ink-faint">{u.institution}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{u.email}</td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{new Date(u.registeredAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{new Date(u.lastLogin).toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-xs">{u.experiments.length}</td>
                      <td className="px-6 py-4 font-mono text-xs">{u.datasets.length}</td>
                      <td className="px-6 py-4 font-mono text-xs">{u.problemStatements.length}</td>
                      <td className="px-6 py-4 font-mono text-xs">{u.reports.length}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[u.status] || "default"}>{u.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-8 w-8 text-ink-faint mx-auto mb-3" />
                <p className="text-sm text-ink-faint">{query ? "No users match your search" : "No registered users yet"}</p>
              </div>
            )}
          </div>
        )}

        {tab === "experiments" && (
          <div className="overflow-x-auto">
            {allExperiments.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-faint text-xs border-b border-[var(--color-glass-border)]">
                    <th className="px-6 py-3 font-medium">Experiment</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Mode</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Started</th>
                    <th className="px-6 py-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {allExperiments.map((e) => (
                    <tr key={e.id} className="border-b border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]">
                      <td className="px-6 py-4">{e.name}</td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{e.userName}</td>
                      <td className="px-6 py-4 text-xs capitalize">{e.mode === "problem-statement" ? "Problem" : "Dataset"}</td>
                      <td className="px-6 py-4"><Badge variant={expStatusVariant[e.status] || "default"}>{e.status}</Badge></td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{e.started}</td>
                      <td className="px-6 py-4 text-xs text-ink-dim">{e.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FlaskConical className="h-8 w-8 text-ink-faint mx-auto mb-3" />
                <p className="text-sm text-ink-faint">No experiments have been run yet</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
