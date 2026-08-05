import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white hover:opacity-90 shadow-[0_0_0_1px_var(--color-accent)] hover:shadow-glow",
    secondary: "bg-[var(--color-glass-active)] text-ink hover:bg-[var(--color-glass-hover)] border border-[var(--color-glass-border)]",
    ghost: "bg-transparent text-ink-dim hover:text-ink hover:bg-[var(--color-glass-hover)]",
    outline: "bg-transparent border border-[var(--color-glass-input-border)] text-ink hover:bg-[var(--color-glass-hover)]",
    danger: "bg-danger/90 text-white hover:bg-danger",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-7 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-6", className)} {...props} />;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warn" | "danger" | "accent";
}) {
  const variants: Record<string, string> = {
    default: "bg-[var(--color-glass-active)] text-ink-dim border-[var(--color-glass-border)]",
    success: "bg-success/10 text-success border-success/30",
    warn: "bg-warn/10 text-warn border-warn/30",
    danger: "bg-danger/10 text-danger border-danger/30",
    accent: "bg-accent/10 text-accent-soft border-accent/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl bg-[var(--color-glass-input)] border border-[var(--color-glass-input-border)] px-4 text-sm text-ink placeholder:text-ink-faint outline-none transition-all focus:border-accent/60 focus:bg-[var(--color-glass-hover)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-ink-dim mb-1.5 block", className)} {...props} />;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-[var(--color-glass-active)] overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-soft to-accent transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-accent-soft mb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--color-glass-border)]", className)} />;
}
