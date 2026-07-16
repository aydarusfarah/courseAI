"use client";

import { useState } from "react";
import { Button } from "../button";

export default function SubscriptionActions({ subscriptionId, cancelAt }: { subscriptionId: string; cancelAt?: string | Date | null }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async (action: string) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setMsg("Done");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {cancelAt ? (
        <Button onClick={() => run("reactivate")} disabled={loading}>Reactivate</Button>
      ) : (
        <Button variant="outline" onClick={() => run("cancel")} disabled={loading}>Cancel</Button>
      )}
      {msg ? <p className="text-xs text-slate-500">{msg}</p> : null}
    </div>
  );
}
