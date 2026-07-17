import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "blue" | "violet";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]",
        variant === "default" && "bg-slate-100 text-slate-600",
        variant === "success" && "bg-emerald-100 text-emerald-700",
        variant === "warning" && "bg-amber-100 text-amber-700",
        variant === "danger"  && "bg-rose-100 text-rose-700",
        variant === "blue"    && "bg-blue-100 text-blue-700",
        variant === "violet"  && "bg-violet-100 text-violet-700",
        className
      )}
      {...props}
    />
  );
}
