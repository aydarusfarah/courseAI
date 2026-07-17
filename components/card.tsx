import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "glow";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white p-6 shadow-card border border-slate-200/80 transition-shadow duration-200",
        variant === "glow" && "hover:shadow-glow",
        className
      )}
      {...props}
    />
  );
}
