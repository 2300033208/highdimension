import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/primitives";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, AlertCircle } from "lucide-react";

type AnimationState = "idle" | "verifying" | "success" | "error";

// Box coordinates relative to the center of the container
const IDLE_POSITIONS = [
  { x: -140, y: 0 },
  { x: -84, y: 0 },
  { x: -28, y: 0 },
  { x: 28, y: 0 },
  { x: 84, y: 0 },
  { x: 140, y: 0 },
];

const DIAMOND_POSITIONS = [
  { x: 0, y: -80 },    // Top
  { x: -60, y: -25 },  // Mid-Top Left
  { x: 60, y: -25 },   // Mid-Top Right
  { x: -60, y: 35 },   // Mid-Bottom Left
  { x: 60, y: 35 },    // Mid-Bottom Right
  { x: 0, y: 90 },     // Bottom
];

// Pairs of indices to connect with SVG lines
const CONNECTIONS = [
  [0, 1], [0, 2], // Top to Mid-Top
  [1, 3], [2, 4], // Mid-Top to Mid-Bottom outer
  [3, 5], [4, 5], // Mid-Bottom to Bottom
  [1, 2], [3, 4], // Horizontal inner
  [1, 4], [2, 3], // Cross inner
];

export default function OtpVerification() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "REGISTRATION";
  const navigate = useNavigate();
  const { verifyRegistrationOtp, verifyForgotPasswordOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  const [animState, setAnimState] = useState<AnimationState>("idle");

  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (animState !== "idle" && animState !== "error") return;
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (animState !== "idle" && animState !== "error") return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animState === "verifying" || animState === "success") return;
    
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setAnimState("verifying");

    // Allow animation to play a bit before actually verifying so user can see it
    setTimeout(async () => {
      let result;
      if (purpose === "PASSWORD_RESET") {
        result = await verifyForgotPasswordOtp(email, code);
        if (result.success) {
          setAnimState("success");
          setSuccess("OTP verified! Redirecting...");
          setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${code}`), 2000);
          return;
        }
      } else {
        result = await verifyRegistrationOtp(email, code);
        if (result.success) {
          setAnimState("success");
          setSuccess("OTP verified! Account activated.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
      }

      // If we reach here, it failed
      setAnimState("error");
      setError(result.error || "Invalid OTP");
      
      // Reset back to idle after showing error for a bit
      setTimeout(() => {
        setAnimState("idle");
        // Clear OTP and focus first input
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }, 1500);
      
    }, 7000); // 7s minimum verifying animation
  };

  const handleResend = async () => {
    setError("");
    const result = await resendOtp(email, purpose);
    if (result.success) {
      setCountdown(60);
    } else {
      setError(result.error || "Failed to resend OTP");
    }
  };

  // Determine line colors based on state
  let strokeColor = "rgba(100, 116, 139, 0.2)"; // faint idle
  if (animState === "verifying") strokeColor = "var(--color-accent)";
  if (animState === "success") strokeColor = "var(--color-success)";
  if (animState === "error") strokeColor = "var(--color-danger)";

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Check your email</h1>
      <p className="text-sm text-ink-dim mb-8">
        We've sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.
      </p>

      {/* Conditionally render error if idle, but if error state, let animation handle it or show text */}
      <AnimatePresence>
        {error && (animState === "idle" || animState === "error") && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && animState === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* Animation Container */}
        <motion.div 
          animate={{ height: animState === "idle" ? 100 : 260 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-full flex items-center justify-center overflow-visible"
        >
          
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: animState !== "idle" ? "drop-shadow(0 0 8px currentColor)" : "none", color: strokeColor }}>
            <g transform="translate(50%, 50%)" style={{ transform: "translate(50%, 50%)" }}>
              <AnimatePresence>
                {animState !== "idle" && CONNECTIONS.map(([start, end], i) => (
                  <motion.line
                    key={`line-${i}`}
                    x1={DIAMOND_POSITIONS[start].x}
                    y1={DIAMOND_POSITIONS[start].y}
                    x2={DIAMOND_POSITIONS[end].x}
                    y2={DIAMOND_POSITIONS[end].y}
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: "easeInOut" }}
                  />
                ))}
              </AnimatePresence>
            </g>
          </svg>

          {/* Success Checkmark in Center */}
          <AnimatePresence>
            {animState === "success" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="absolute z-10 text-success drop-shadow-glow"
              >
                <CheckCircle2 className="w-16 h-16" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Boxes */}
          {otp.map((digit, i) => {
            const isIdle = animState === "idle";
            const pos = isIdle ? IDLE_POSITIONS[i] : DIAMOND_POSITIONS[i];
            
            // Dynamic border/shadow color for boxes
            let boxBorderColor = "rgba(255, 255, 255, 0.2)";
            let boxShadow = "none";
            if (animState === "verifying") {
              boxBorderColor = "var(--color-accent)";
              boxShadow = "0 0 15px rgba(22, 119, 255, 0.4)";
            } else if (animState === "success") {
              boxBorderColor = "var(--color-success)";
              boxShadow = "0 0 20px rgba(16, 185, 129, 0.5)";
            } else if (animState === "error") {
              boxBorderColor = "var(--color-danger)";
              boxShadow = "0 0 15px rgba(239, 68, 68, 0.4)";
            }

            return (
              <motion.input
                key={`box-${i}`}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={animState !== "idle" && animState !== "error"}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                
                // Animation Variants
                initial={false}
                animate={animState === "error" ? "error" : "visible"}
                variants={{
                  visible: { 
                    x: pos.x, 
                    y: pos.y,
                    borderColor: boxBorderColor,
                    boxShadow: boxShadow,
                    opacity: animState === "success" ? 0 : 1,
                    scale: animState === "success" ? 1.2 : 1
                  },
                  error: {
                    x: [pos.x, pos.x - 10, pos.x + 10, pos.x - 10, pos.x + 10, pos.x],
                    y: pos.y,
                    borderColor: boxBorderColor,
                    boxShadow: boxShadow,
                    transition: { duration: 0.5 }
                  }
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 14,
                  // Add subtle pulse when verifying
                  ...(animState === "verifying" ? {
                    boxShadow: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 1
                    }
                  } : {})
                }}
                
                className={`absolute z-10 w-[44px] h-[52px] sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border-[1.5px] shadow-sm outline-none transition-colors 
                  ${animState === "idle" ? 'focus:border-accent focus:ring-1 focus:ring-accent' : ''}`}
                style={{ marginLeft: "-24px", marginTop: "-28px", backgroundColor: "var(--color-surface)" }} // center transform origin offset and force opaque bg
              />
            );
          })}
        </motion.div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={animState !== "idle"}
        >
          {animState === "verifying" ? "Verifying..." : 
           animState === "success" ? "Verified" : "Verify OTP"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-ink-dim">
          Didn't receive the code?{" "}
          {countdown > 0 ? (
            <span className="text-ink-faint">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={animState !== "idle"}
              className="text-accent-soft hover:underline font-medium focus:outline-none disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </AuthShell>
  );
}
