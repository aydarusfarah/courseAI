import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-3xl border border-transparent bg-transparent text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-0 dark:text-slate-100",
        className
      )}
      {...props}
    />
  );
}
