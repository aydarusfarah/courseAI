import { clsx } from "clsx";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Switch({ className, label, id, ...props }: SwitchProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer select-none items-center gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full border border-slate-300 bg-slate-200 transition-colors duration-200",
          props.checked ? "bg-brand-600" : "bg-slate-200",
          className
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="absolute h-full w-full cursor-pointer appearance-none opacity-0"
          {...props}
        />
        <span
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform duration-200",
            props.checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </span>
    </label>
  );
}
