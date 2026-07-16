"use client";

import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";

interface BillingCardProps {
  planName: string;
  status: string;
  usage: {
    aiCount: number;
    aiRemaining: number | string;
    courseCount: number;
    courseRemaining: number | string;
    exportCount: number;
    plan: string;
    planName: string;
    limits: { courseLimit: number; aiLimit: number; exportFormats: string[]; premiumTemplates: boolean; watermark: boolean };
  };
  nextRenewal?: string | null;
}

export function BillingCard({ planName, status, usage, nextRenewal }: BillingCardProps) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);

  async function handleCheckout(plan: "monthly" | "yearly") {
    setLoading("checkout");
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await response.json();
    if (data?.sessionUrl) window.location.href = data.sessionUrl;
    setLoading(null);
  }

  async function handlePortal() {
    setLoading("portal");
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = await response.json();
    if (data?.url) window.location.href = data.url;
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("portal");
    const response = await fetch("/api/billing/cancel", { method: "POST" });
    const data = await response.json();
    if (data?.success) window.location.reload();
    setLoading(null);
  }

  const aiPercent = typeof usage.aiRemaining === "number" && usage.limits.aiLimit !== Number.POSITIVE_INFINITY
    ? Math.min(100, Math.round((usage.aiCount / usage.limits.aiLimit) * 100))
    : 0;
  const coursePercent = typeof usage.courseRemaining === "number" && usage.limits.courseLimit !== Number.POSITIVE_INFINITY
    ? Math.min(100, Math.round((usage.courseCount / usage.limits.courseLimit) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Current plan</p>
            <h3 className="text-2xl font-semibold text-slate-950">{planName}</h3>
            <p className="text-sm text-slate-600">Status: {status}</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {nextRenewal ? `Renews ${nextRenewal}` : "No active renewal"}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">AI generations</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{usage.aiCount} used</p>
            <p className="text-sm text-slate-600">{usage.aiRemaining} remaining</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${aiPercent}%` }} />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Courses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{usage.courseCount} created</p>
            <p className="text-sm text-slate-600">{usage.courseRemaining} remaining</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${coursePercent}%` }} />
            </div>
          </div>
        </div>
      </Card>
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-950">Upgrade or manage billing</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleCheckout("monthly")} disabled={loading !== null}>{loading === "checkout" ? "Preparing…" : "Upgrade to Pro (Monthly)"}</Button>
          <Button variant="outline" onClick={() => handleCheckout("yearly")} disabled={loading !== null}>Upgrade to Pro (Yearly)</Button>
          <Button variant="secondary" onClick={handlePortal} disabled={loading !== null}>Manage billing</Button>
          <Button variant="outline" onClick={handleCancel} disabled={loading !== null}>Cancel subscription</Button>
        </div>
        <p className="text-sm text-slate-600">Pro includes unlimited courses, unlimited AI generations, all export formats, premium templates, and no watermarks.</p>
      </Card>
    </div>
  );
}
