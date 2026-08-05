import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Github, Chrome, CheckCircle2, Check, X } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    institution: z.string().min(2, "Enter your institution"),
    email: z.string().email("Enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password") || "";

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
    { label: "One special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const result = await authRegister(data.name, data.institution, data.email, data.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Registration failed");
      return;
    }
    setSuccess(true);
    // Registration now logs in user directly (no OTP), redirect to dashboard
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h1>
      <p className="text-sm text-ink-dim mb-8">Start benchmarking high-dimensional optimisers.</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Account created successfully! Redirecting to login…
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
            {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" placeholder="MIT" {...register("institution")} />
            {errors.institution && <p className="text-xs text-danger mt-1.5">{errors.institution.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@institution.edu" {...register("email")} />
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
            
            {/* Password requirements checklist */}
            {password && (
              <div className="mt-3 space-y-1.5 p-3 bg-canvas-elevated/50 rounded-xl border border-[var(--color-glass-border)]">
                {passwordRequirements.map((req, i) => {
                  const met = req.test(password);
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-ink-faint"}`}>
                      {met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
            {errors.confirm && <p className="text-xs text-danger mt-1.5">{errors.confirm.message}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading || success}>
          {loading ? "Creating account…" : success ? "Account created!" : "Create account"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-7">
        <div className="h-px flex-1 bg-[var(--color-glass-border)]" />
        <span className="text-xs text-ink-faint">or continue with</span>
        <div className="h-px flex-1 bg-[var(--color-glass-border)]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          <Chrome className="h-4 w-4" /> Google
        </Button>
        <Button variant="secondary" className="w-full">
          <Github className="h-4 w-4" /> GitHub
        </Button>
      </div>

      <p className="text-sm text-ink-dim text-center mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-accent-soft hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
