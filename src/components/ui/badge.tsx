type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "error";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "bg-surface-container text-outline-variant border-outline",
  accent:
    "bg-surface-container text-accent border-outline",
  success:
    "bg-emerald-950 text-emerald-300 border-emerald-800/40",
  warning:
    "bg-amber-950 text-amber-300 border-amber-800/40",
  error:
    "bg-red-950 text-red-300 border-red-800/40",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-label-xs font-label ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}