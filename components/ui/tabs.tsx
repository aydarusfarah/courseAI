"use client";

import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
}

export function Tabs({ items }: TabsProps) {
  const [value, setValue] = useState(items[0]?.value ?? "");
  const selected = items.find((item) => item.value === value) ?? items[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={clsx(
              "rounded-3xl px-4 py-2 text-sm font-semibold transition",
              item.value === value
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
            onClick={() => setValue(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        {selected?.content}
      </div>
    </div>
  );
}
