import type { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
interface RowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}
interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-card",
        "dark:border-slate-700/60 dark:bg-slate-900",
        className
      )}
      {...props}
    >
      <table className="min-w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: CellProps) {
  return (
    <th
      className={clsx(
        "border-b border-slate-100 bg-slate-50/80 px-4 py-3",
        "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500",
        "whitespace-nowrap",
        "dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, className, ...props }: RowProps) {
  return (
    <tr
      className={clsx(
        "border-b border-slate-100 last:border-none",
        "transition-colors duration-100",
        "hover:bg-slate-50/60",
        "dark:border-slate-700/60 dark:hover:bg-slate-800/40",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, ...props }: CellProps) {
  return (
    <td
      className={clsx(
        "px-4 py-3.5 align-middle text-slate-700 dark:text-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}
