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
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-card ${className ?? ""}`} {...props}>
      <table className="min-w-full border-collapse text-left text-sm text-slate-700">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: TableCellProps) {
  return (
    <th
      className={`border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 whitespace-nowrap ${className ?? ""}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr
      className={`border-b border-slate-100 last:border-none transition-colors duration-150 hover:bg-slate-50/70 ${className ?? ""}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3.5 align-middle ${className ?? ""}`} {...props}>
      {children}
    </td>
  );
}
