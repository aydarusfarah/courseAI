"use client";

import { useState } from "react";
import { Button } from "../button";

export default function PaymentActions({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refund = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setMsg("Refunded");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" onClick={refund} disabled={loading}>{loading ? "..." : "Refund"}</Button>
      {msg ? <p className="text-xs text-slate-500">{msg}</p> : null}
    </div>
  );
}
