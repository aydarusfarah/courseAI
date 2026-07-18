import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "blue" | "violet" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

const variantMap = {
  default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  blue:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  violet:  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  outline: "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
};

const dotColorMap = {
  default: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  blue:    "bg-blue-500",
  violet:  "bg-violet-500",
  outline: "bg-slate-400"
};

export function Badge({
  className, variant = "default", size = "sm", dot, children, ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px] tracking-wide" : "px-2.5 py-1 text-xs",
        variantMap[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={clsx("h-1.5 w-1.5 rounded-full", dotColorMap[variant])} />
      )}
      {children}
    </span>
  );
}
