import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Palette, Globe, KeyRound, ShieldCheck, Lock, Copy, Check, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Button, Input, Label } from "@/components/ui/primitives";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${checked ? "bg-accent" : "bg-[var(--color-glass-input-border)]"}`}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function Settings() {
  const [notifs, setNotifs] = useState({ email: true, push: false, digest: true });
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState("English");
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-dim mt-1">Manage notifications, appearance, security and API access.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-4 w-4 text-accent-soft" />
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              ["email", "Email notifications", "Experiment completion and recommendations"],
              ["push", "Push notifications", "Real-time alerts in-browser"],
              ["digest", "Weekly digest", "Summary of platform activity"],
            ].map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm">{label}</p>
                  <p className="text-xs text-ink-faint">{desc}</p>
                </div>
                <Toggle checked={(notifs as any)[key]} onChange={() => setNotifs((n) => ({ ...n, [key]: !(n as any)[key] }))} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Palette className="h-4 w-4 text-accent-soft" />
            <h3 className="font-semibold text-sm">Appearance</h3>
          </div>
          <p className="text-xs text-ink-faint mb-3">Theme</p>
          <div className="flex gap-2 mb-6">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl border py-2 text-sm capitalize transition-all ${
                  theme === t ? "border-accent/60 bg-accent/[0.06]" : "border-[var(--color-glass-input-border)] text-ink-dim hover:bg-[var(--color-glass-hover)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-3.5 w-3.5 text-ink-faint" />
            <p className="text-xs text-ink-faint">Language</p>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-11 w-full rounded-xl bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] px-4 text-sm text-ink outline-none focus:border-accent/60"
          >
            {["English", "Hindi", "German", "Japanese", "Spanish"].map((l) => (
              <option key={l} value={l} className="bg-[var(--color-surface)]">{l}</option>
            ))}
          </select>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="h-4 w-4 text-accent-soft" />
            <h3 className="font-semibold text-sm">API Keys</h3>
          </div>
          <Label>Your API key</Label>
          <div className="flex gap-2">
            <Input readOnly value={`hdbo_sk_${user?.id || "anon"}_${Date.now().toString(36).slice(-6)}`} className="font-mono text-xs" />
            <Button variant="secondary" onClick={copyKey} className="shrink-0 w-11 px-0">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-ink-faint mt-2">Use this key to trigger benchmarks programmatically via the REST API.</p>
          <Button variant="outline" size="sm" className="mt-4">Regenerate key</Button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="h-4 w-4 text-accent-soft" />
            <h3 className="font-semibold text-sm">Account Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Two-factor authentication</p>
                <p className="text-xs text-ink-faint">Add an extra layer of security</p>
              </div>
              <Toggle checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-ink-faint" />
                <p className="text-sm">Change password</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
            <div className="pt-2 border-t border-[var(--color-glass-border)]">
              <Button variant="danger" size="sm" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button size="lg">Save Changes</Button>
      </div>
    </AppShell>
  );
}
