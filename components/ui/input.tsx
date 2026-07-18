import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900",
        "placeholder:text-slate-400 outline-none transition-all duration-150",
        "hover:border-slate-300",
        "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
        "dark:placeholder:text-slate-500",
        "dark:focus:border-brand-400 dark:focus:ring-brand-400/10",
        "dark:hover:border-slate-600",
        className
      )}
      {...props}
    />
  );
}
