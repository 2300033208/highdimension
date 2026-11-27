import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical, Database, FileText, MessageSquareText, Mail, CalendarDays, Plus, Edit2,
  Camera, Activity, Cpu, Clock, ShieldCheck, HardDrive, Zap, Sparkles, Trophy, CheckCircle2,
  Lock, ChevronRight, TrendingUp, X
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Badge, Button, Input } from "@/components/ui/primitives";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

// --- TYPES ---
interface MonthlyStat { month: string; runs: number; }
interface RecentExperiment { id: number; name: string; status: string; mode: string; started: string; }

interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  institution: string;
  organization: string | null;
  department: string | null;
  bio: string | null;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  membershipType: string;
  lastLogin: string | null;
  createdAt: string;
  
  experimentCount: number;
  datasetCount: number;
  algorithmsUsedCount: number;
  aiChatCount: number;
  reportsCount: number;
  totalRuntimeHours: number;
  storageUsedMb: number;
  apiStatus: string;
  
  researchInterests: string[];
  achievements: string[];
  monthlyStats: MonthlyStat[];
  recentExperiments: RecentExperiment[];
}

// --- UTILS ---
function getInitials(name?: string): string {
  if (!name || typeof name !== "string") return "??";
  return name.trim().split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const statusVariant: Record<string, "default" | "success" | "warn" | "danger" | "accent"> = {
  Completed: "success",
  Running: "accent",
  Queued: "warn",
  Failed: "danger",
};

const getCleanApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return "http://localhost:8081/api/v1";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};
const API_BASE_URL = getCleanApiBaseUrl();
const getAuthHeader = () => {
  const token = localStorage.getItem("hdbo_auth");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- MAIN COMPONENT ---
export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Fetch Profile Data
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", user?.email],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/profile/me`, { headers: getAuthHeader() });
      return res.data.data as UserProfileResponse;
    },
    enabled: !!user?.email,
  });

  // Edit Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await axios.put(`${API_BASE_URL}/profile/me`, updatedData, { headers: getAuthHeader() });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditModalOpen(false);
    }
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-ink-dim font-medium">Loading premium profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh] text-danger">Failed to load profile data. Ensure backend is running.</div>
      </AppShell>
    );
  }

  const initials = getInitials(data.name);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not Available";
    const d = new Date(dateString);
    if (isNaN(d.getTime()) || d.getFullYear() === 1970) return "First Login";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  
  const registeredDate = new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  const hasFirstExp = data.achievements.includes("First Run");
  const hasFirstData = data.achievements.includes("Data Pioneer");
  const isPowerUser = data.achievements.includes("Power User");
  const isAIWhisperer = data.achievements.includes("AI Whisperer");

  const trendPositive = data.monthlyStats.length >= 2 && data.monthlyStats[data.monthlyStats.length-1].runs >= data.monthlyStats[data.monthlyStats.length-2].runs;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* --- HERO SECTION --- */}
        <Card className="relative overflow-hidden border-[var(--color-glass-border)] bg-gradient-to-b from-[var(--color-glass-bg)] to-transparent p-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-soft to-accent opacity-50" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
            {/* Avatar & Ring */}
            <div className="relative shrink-0">
              <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="var(--color-glass-border)" strokeWidth="3" />
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeDasharray="100 100" strokeDashoffset="20" strokeLinecap="round" className="text-accent transition-all duration-1000" />
              </svg>
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-accent to-accent-soft flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_40px_rgba(10,132,255,0.3)] border-4 border-[var(--color-surface)] bg-cover bg-center overflow-hidden" style={data.profilePicture ? { backgroundImage: `url(${data.profilePicture})` } : {}}>
                {!data.profilePicture && initials}
              </div>
              <div className="absolute bottom-1 right-1 h-5 w-5 bg-success rounded-full border-[3px] border-[var(--color-surface)] shadow-[0_0_10px_rgba(48,209,88,0.5)]" title="Online" />
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-ink">{data.name}</h1>
                <Badge variant="accent" className="bg-accent/10 text-accent border-accent/20 capitalize">{data.role.replace("ROLE_", "").toLowerCase()}</Badge>
                {data.emailVerified && <Badge variant="success" className="bg-success/10 text-success border-success/20">Verified</Badge>}
              </div>
              <p className="text-lg text-ink-dim font-medium">{data.organization || data.institution}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-ink-faint mt-2">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {data.email}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Joined {registeredDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-6 sm:mt-0">
              <Button variant="secondary" className="px-6 rounded-xl h-11"><Camera className="h-4 w-4" /> Avatar</Button>
              <Button onClick={() => setEditModalOpen(true)} className="w-full sm:w-auto px-6 rounded-xl h-11"><Edit2 className="h-4 w-4" /> Edit Profile</Button>
            </div>
          </div>
        </Card>

        {/* --- PREMIUM STATS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Experiments", value: data.experimentCount, icon: FlaskConical, color: "text-accent" },
            { label: "Datasets", value: data.datasetCount, icon: Database, color: "text-success" },
            { label: "Algorithms Used", value: data.algorithmsUsedCount, icon: Cpu, color: "text-warn" },
            { label: "AI Chats", value: data.aiChatCount, icon: MessageSquareText, color: "text-accent-soft" },
            { label: "Reports", value: data.reportsCount, icon: FileText, color: "text-ink" },
            { label: "Total Runtime", value: `${data.totalRuntimeHours.toFixed(1)}h`, icon: Clock, color: "text-danger" },
          ].map((stat) => (
            <Card key={stat.label} className="relative group overflow-hidden p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 hover:border-ink/20">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity" style={{ color: "var(--color-accent)" }} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-[var(--color-glass-active)] ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-ink mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-ink-dim uppercase tracking-wider">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            
            {/* Account Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-ink">
                <ShieldCheck className="h-5 w-5 text-accent" /> Account Overview
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-glass-border)]">
                  <span className="text-ink-dim font-medium">Membership</span>
                  <Badge variant="accent">{data.membershipType}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-glass-border)]">
                  <span className="text-ink-dim font-medium">Storage Used</span>
                  <span className="font-semibold text-ink flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-ink-faint" /> {data.storageUsedMb > 0 ? `${data.storageUsedMb.toFixed(1)} MB` : "0 MB"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-glass-border)]">
                  <span className="text-ink-dim font-medium">API Status</span>
                  <span className="flex items-center gap-1.5 text-success font-medium"><div className="h-2 w-2 rounded-full bg-success animate-pulse" /> {data.apiStatus}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-ink-dim font-medium">Last Login</span>
                  <span className="text-ink-faint text-xs font-mono">{formatDate(data.lastLogin)}</span>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-ink">
                <Trophy className="h-5 w-5 text-warn" /> Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border transition-all ${hasFirstExp ? "border-accent/30 bg-accent/5 text-accent shadow-[0_0_15px_rgba(22,119,255,0.1)]" : "border-[var(--color-glass-border)] bg-[var(--color-glass-active)] text-ink-dim opacity-60 grayscale"}`}>
                  <FlaskConical className="h-6 w-6 mb-2" />
                  <div className="text-sm font-semibold">First Run</div>
                </div>
                <div className={`p-4 rounded-xl border transition-all ${hasFirstData ? "border-success/30 bg-success/5 text-success shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-[var(--color-glass-border)] bg-[var(--color-glass-active)] text-ink-dim opacity-60 grayscale"}`}>
                  <Database className="h-6 w-6 mb-2" />
                  <div className="text-sm font-semibold">Data Pioneer</div>
                </div>
                <div className={`p-4 rounded-xl border transition-all ${isPowerUser ? "border-warn/30 bg-warn/5 text-warn shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-[var(--color-glass-border)] bg-[var(--color-glass-active)] text-ink-dim opacity-60 grayscale"}`}>
                  <Zap className="h-6 w-6 mb-2" />
                  <div className="text-sm font-semibold">Power User</div>
                </div>
                <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${isAIWhisperer ? "border-accent-soft/30 bg-accent-soft/5 text-accent-soft shadow-[0_0_15px_rgba(10,95,234,0.1)]" : "border-[var(--color-glass-border)] bg-[var(--color-glass-active)] text-ink-dim opacity-60 grayscale"}`}>
                  {!isAIWhisperer && <Lock className="h-4 w-4 absolute top-2 right-2 text-ink-faint" />}
                  <MessageSquareText className="h-6 w-6 mb-2" />
                  <div className="text-sm font-semibold">AI Whisperer</div>
                </div>
              </div>
            </Card>

            {/* Research Interests */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-ink">Research Interests</h3>
                <button onClick={() => setEditModalOpen(true)} className="text-xs text-accent hover:underline">Edit</button>
              </div>
              {data.researchInterests && data.researchInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.researchInterests.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-glass-active)] text-ink-dim border border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)] hover:text-ink transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-faint">No research interests added yet.</p>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { to: "/experiment/new", icon: Plus, label: "New Benchmark", color: "bg-gradient-to-br from-accent to-accent-soft text-white border-none shadow-[0_8px_20px_rgba(22,119,255,0.2)]" },
                { to: "/upload", icon: Database, label: "Upload Data", color: "bg-[var(--color-glass-active)] text-ink border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]" },
                { to: "/algorithms", icon: Cpu, label: "Explore Algos", color: "bg-[var(--color-glass-active)] text-ink border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]" },
                { to: "/research", icon: Sparkles, label: "AI Insights", color: "bg-[var(--color-glass-active)] text-ink border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]" }
              ].map(action => (
                <Link key={action.label} to={action.to} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${action.color}`}>
                  <action.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-semibold">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Platform Usage Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-ink">Platform Usage</h3>
                  <p className="text-sm text-ink-dim">Benchmark runs over the last 12 months</p>
                </div>
                {trendPositive && (
                  <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-sm font-medium border border-success/20">
                    <TrendingUp className="h-4 w-4" /> Positive Trend
                  </div>
                )}
              </div>
              <div className="h-[250px] w-full">
                {data.monthlyStats.some(m => m.runs > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-glass-border)" />
                      <XAxis dataKey="month" stroke="var(--color-ink-faint)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-ink-faint)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-glass-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                        itemStyle={{ color: 'var(--color-ink)' }}
                      />
                      <Area type="monotone" dataKey="runs" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRuns)" activeDot={{ r: 6, fill: 'var(--color-accent)', stroke: 'var(--color-surface)', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink-dim">
                    <TrendingUp className="h-8 w-8 mb-3 text-ink-faint opacity-50" />
                    <p className="font-medium">No benchmark activity yet.</p>
                    <p className="text-xs text-ink-faint">Your chart will appear here once you run experiments.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Experiment History */}
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--color-glass-border)]">
                <h3 className="text-lg font-semibold text-ink">Recent Experiments</h3>
                <Link to="/experiments" className="text-sm font-medium text-accent hover:text-accent-soft transition-colors flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              {data.recentExperiments.length > 0 ? (
                <div className="divide-y divide-[var(--color-glass-border)]">
                  {data.recentExperiments.map((e) => (
                    <div key={e.id} className="p-5 flex items-center justify-between hover:bg-[var(--color-glass-hover)] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-[var(--color-glass-active)] rounded-lg text-ink-dim">
                          <FlaskConical className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ink">{e.name}</h4>
                          <p className="text-sm text-ink-faint mt-0.5 capitalize">{e.mode.replace("-", " ")} · {e.started}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[e.status] || "default"} className="px-3 py-1 text-xs shadow-sm">{e.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-[var(--color-glass-active)] rounded-full flex items-center justify-center mb-4">
                    <FlaskConical className="h-8 w-8 text-ink-dim" />
                  </div>
                  <h4 className="text-lg font-semibold text-ink mb-2">No Experiments Yet</h4>
                  <p className="text-sm text-ink-faint mb-6 max-w-sm">You haven't run any optimization benchmarks yet. Create your first experiment to see results here.</p>
                  <Link to="/experiment/new">
                    <Button className="rounded-xl px-6"><Plus className="h-4 w-4" /> Create Experiment</Button>
                  </Link>
                </div>
              )}
            </Card>

          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-ink">Edit Profile</h2>
                <button onClick={() => setEditModalOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--color-glass-hover)] text-ink-dim"><X className="h-5 w-5" /></button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updates = {
                    name: formData.get("name"),
                    bio: formData.get("bio"),
                    organization: formData.get("organization"),
                    researchInterests: formData.get("interests")?.toString().split(",").map(i => i.trim()).filter(Boolean),
                  };
                  updateProfileMutation.mutate(updates);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1">Full Name</label>
                  <Input name="name" defaultValue={data.name} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1">Organization / Institution</label>
                  <Input name="organization" defaultValue={data.organization || data.institution} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1">Bio</label>
                  <textarea name="bio" defaultValue={data.bio || ""} className="w-full h-24 rounded-xl bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] p-3 text-sm text-ink outline-none focus:border-accent/60 resize-none" placeholder="Write a short bio..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1">Research Interests (comma separated)</label>
                  <Input name="interests" defaultValue={data.researchInterests?.join(", ")} placeholder="e.g. Deep Learning, Optimization" />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
