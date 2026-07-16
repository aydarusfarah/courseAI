"use client";

import { useState } from "react";
import { Card } from "../card";
import { Badge } from "../ui/badge";
import { Toast } from "../ui/toast";

interface Flag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  updatedAt: Date | string;
}

interface Props {
  initialFlags: Flag[];
}

export default function FeatureFlagList({ initialFlags }: Props) {
  const [flags, setFlags] = useState<Flag[]>(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "danger" } | null>(null);

  const toggle = async (flag: Flag) => {
    setLoading(flag.id);
    try {
      const res = await fetch(`/api/admin/flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !flag.enabled })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: json.flag.enabled } : f)));
      setToast({ message: `${flag.name} ${json.flag.enabled ? "enabled" : "disabled"}`, variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Card>
        {flags.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No feature flags configured.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {flags.map((flag) => (
              <li key={flag.id} className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-950">{flag.name}</p>
                    <Badge variant={flag.enabled ? "success" : "default"}>
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  {flag.description && <p className="text-sm text-slate-500">{flag.description}</p>}
                  <p className="text-xs text-slate-400">Updated {new Date(flag.updatedAt).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(flag)}
                  disabled={loading === flag.id}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 ${
                    flag.enabled ? "bg-brand-600" : "bg-slate-200"
                  }`}
                  aria-label={`Toggle ${flag.name}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      flag.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {toast && (
        <Toast open message={toast.message} variant={toast.variant} onOpenChange={() => setToast(null)} />
      )}
    </>
  );
}
