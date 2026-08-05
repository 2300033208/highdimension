import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@/components/ui/primitives";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Eye, EyeOff, Check, X } from "lucide-react";

const schema = z
  .object({
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password") || "";

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    // Maximum score is 5 based on 5 requirements. We'll map this to a 4-segment bar later.
    return score;
  };
  const strength = getStrength(password);
  
  const passwordRequirements = [
    { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
    { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
    { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
    { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
    { label: "One special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
  ];
  
  const onSubmit = async (data: FormData) => {
    if (!email || !otp) {
      setError("Missing email or OTP in URL");
      return;
    }
    
    setLoading(true);
    setError("");
    const result = await resetPassword(email, otp, data.password);
    setLoading(false);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error || "Failed to reset password");
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Set new password</h1>
      <p className="text-sm text-ink-dim mb-8">
        Create a new, strong password for your account.
      </p>

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
          Password reset successfully! Redirecting...
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" {...register("password")} />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
          
          {/* Password strength meter & checklist */}
          {password && (
            <div className="mt-3">
              <div className="flex gap-1 h-1.5 w-full mb-3">
                <div className={`h-full flex-1 rounded-full transition-colors ${strength >= 1 ? 'bg-danger' : 'bg-canvas-elevated'}`} />
                <div className={`h-full flex-1 rounded-full transition-colors ${strength >= 3 ? 'bg-warning' : 'bg-canvas-elevated'}`} />
                <div className={`h-full flex-1 rounded-full transition-colors ${strength >= 4 ? 'bg-success' : 'bg-canvas-elevated'}`} />
                <div className={`h-full flex-1 rounded-full transition-colors ${strength === 5 ? 'bg-success' : 'bg-canvas-elevated'}`} />
              </div>
              
              <div className="space-y-1.5 p-3 bg-canvas-elevated/50 rounded-xl border border-[var(--color-glass-border)]">
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
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type={showPw ? "text" : "password"} placeholder="••••••••" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-danger mt-1.5">{errors.confirm.message}</p>}
        </div>
        
        <Button type="submit" className="w-full" size="lg" disabled={loading || success}>
          {loading ? "Resetting..." : success ? "Reset complete" : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}
