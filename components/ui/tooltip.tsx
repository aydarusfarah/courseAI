import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex" title={content}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
        {content}
      </span>
    </span>
  );
}
