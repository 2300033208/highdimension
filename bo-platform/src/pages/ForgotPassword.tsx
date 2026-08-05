import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@/components/ui/primitives";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const result = await forgotPassword(data.email);
    setLoading(false);
    
    if (result.success) {
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&purpose=PASSWORD_RESET`);
    } else {
      setError(result.error || "Failed to send reset instructions");
    }
  };

  return (
    <AuthShell>
      <Link to="/login" className="inline-flex items-center text-xs text-ink-faint hover:text-ink mb-6 transition-colors">
        <ArrowLeft className="h-3 w-3 mr-1" /> Back to login
      </Link>
      
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Reset password</h1>
      <p className="text-sm text-ink-dim mb-8">
        Enter your email address and we'll send you a 6-digit code to reset your password.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@institution.edu" {...register("email")} />
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
        </div>
        
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Sending..." : "Send reset code"}
        </Button>
      </form>
    </AuthShell>
  );
}
