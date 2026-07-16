import type { HTMLAttributes, ReactNode } from "react";

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`} {...props}>
      <table className="min-w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-100">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: TableCellProps) {
  return (
    <th className={`border-b border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 ${className ?? ""}`} {...props}>
      {children}
    </th>
  );
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={`border-b border-slate-200 last:border-none ${className ?? ""}`} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-4 align-top ${className ?? ""}`} {...props}>
      {children}
    </td>
  );
}
