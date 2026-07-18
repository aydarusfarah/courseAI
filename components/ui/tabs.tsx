"use client";

import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items }: { items: TabItem[] }) {
  const [value, setValue] = useState(items[0]?.value ?? "");
  const selected = items.find((i) => i.value === value) ?? items[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setValue(item.value)}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150",
              item.value === value
                ? [
                    "bg-white text-slate-900 shadow-sm",
                    "dark:bg-slate-700 dark:text-white"
                  ]
                : [
                    "text-slate-500 hover:text-slate-800",
                    "dark:text-slate-400 dark:hover:text-slate-200"
                  ]
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        {selected?.content}
      </div>
    </div>
  );
}
