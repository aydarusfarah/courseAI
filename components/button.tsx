import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
}

const sizeMap = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2"
};

export function Button({
  className, variant = "default", size = "md", loading, disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl font-semibold",
        "transition-all duration-150 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.97]",
        sizeMap[size],
        variant === "default" && [
          "bg-brand-gradient text-white shadow-glow",
          "hover:opacity-90 hover:shadow-glow"
        ],
        variant === "outline" && [
          "border border-slate-200 bg-white text-slate-800",
          "hover:bg-slate-50 hover:border-slate-300",
          "dark:border-slate-700 dark:bg-transparent dark:text-slate-200",
          "dark:hover:bg-slate-800 dark:hover:border-slate-600",
          "shadow-xs"
        ],
        variant === "secondary" && [
          "bg-slate-100 text-slate-800",
          "hover:bg-slate-200",
          "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        ],
        variant === "ghost" && [
          "bg-transparent text-slate-700",
          "hover:bg-slate-100 hover:text-slate-900",
          "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        ],
        variant === "danger" && [
          "bg-rose-600 text-white shadow-sm",
          "hover:bg-rose-700"
        ],
        variant === "success" && [
          "bg-emerald-600 text-white shadow-sm",
          "hover:bg-emerald-700"
        ],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
