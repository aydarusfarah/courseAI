import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "glow" | "flat" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({
  className, variant = "default", padding = "md", ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl transition-all duration-200",
        paddingMap[padding],
        variant === "default" && [
          "bg-white border border-slate-200/80 shadow-card",
          "dark:bg-surface-dark dark:border-slate-700/60"
        ],
        variant === "bordered" && [
          "bg-white border border-slate-200 shadow-sm",
          "dark:bg-surface-dark dark:border-slate-700"
        ],
        variant === "glow" && [
          "bg-white border border-brand-200/60 shadow-glow",
          "dark:bg-surface-dark dark:border-brand-800/40"
        ],
        variant === "flat" && [
          "bg-slate-50 border border-slate-100",
          "dark:bg-slate-800/60 dark:border-slate-700/40"
        ],
        variant === "dark" && [
          "bg-slate-900 border border-slate-800 text-white"
        ],
        className
      )}
      {...props}
    />
  );
}
