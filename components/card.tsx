import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl bg-white p-6 shadow-soft",
        variant === "bordered" && "border border-slate-200",
        className
      )}
      {...props}
    />
  );
}
