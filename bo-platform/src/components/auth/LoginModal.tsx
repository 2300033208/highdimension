import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Lock, Mail, Loader2, AlertCircle, RefreshCw, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input } from "@/components/ui/primitives";

const getCleanApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return "http://localhost:8081/api/v1";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};
const API_BASE_URL = getCleanApiBaseUrl();

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus trap and scroll lock
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";
    
    // Auto focus email input
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        onClose();
        navigate(redirectUrl);
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError("Google authentication failed. No credential received.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      if (res.success) {
        onClose();
        navigate(redirectUrl);
      } else {
        setError(res.error || "Google authentication failed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during Google sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[20px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-[430px] bg-[var(--color-surface)] border border-[var(--color-glass-border)] rounded-[24px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        // Trap focus inside modal basics (for simple trap, we rely on autofocus and not putting elements behind it)
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ink-dim hover:text-ink transition-colors p-1 rounded-full hover:bg-[var(--color-glass-hover)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent-soft p-0.5 shadow-lg shadow-accent/20 mb-4">
            <div className="h-full w-full bg-[var(--color-surface)] rounded-[14px] flex items-center justify-center">
              <Activity className="h-6 w-6 text-accent" />
            </div>
          </div>
          <h1 id="modal-title" className="text-2xl font-bold tracking-tight text-ink mb-1">Welcome Back</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-dim" htmlFor="email">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-faint pointer-events-none" />
              <Input
                ref={emailInputRef}
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 w-full bg-[var(--color-glass-input)] rounded-xl"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-dim" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-ink-faint pointer-events-none" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 w-full bg-[var(--color-glass-input)] rounded-xl"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Custom Secure CAPTCHA removed */}

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11 text-[15px] font-semibold rounded-xl bg-gradient-to-r from-accent to-accent-soft hover:opacity-90 shadow-[0_4px_14px_rgba(22,119,255,0.25)] transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Divider (Implicit spacing) / Google Sign In */}
          <div className="pt-2 flex justify-center w-full relative">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In was unsuccessful. Please try again.")}
                theme="filled_black"
                size="large"
                shape="rectangular"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>
          
        </form>
      </motion.div>
    </motion.div>
  );
}
