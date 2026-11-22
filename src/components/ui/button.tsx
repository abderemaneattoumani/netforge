import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent hover:bg-cyan-300 font-semibold shadow-lg",
  secondary:
    "bg-surface-container text-on-surface border border-outline hover:border-accent hover:text-accent",
};

export function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  onClick,
  className = "",
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-label-md font-label transition-colors ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}