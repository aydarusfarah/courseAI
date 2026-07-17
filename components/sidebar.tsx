"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./button";
import {
  Bell, Grid, Rocket, Sparkles, CreditCard, ChartBar, Cog,
  FolderOpen, User, ShieldCheck, ReceiptText, Users, DollarSign,
  ListChecks, BookOpenText, FileText, Zap
} from "lucide-react";

const navItems: { label: string; href: Route; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { label: "Overview",      href: "/dashboard",  icon: Grid },
  { label: "My Courses",    href: "/courses",    icon: FolderOpen },
  { label: "AI Generator",  href: "/generator",  icon: Rocket },
  { label: "Templates",     href: "/templates",  icon: Sparkles },
  { label: "Course Editor", href: "/editor",     icon: BookOpenText },
  { label: "Exports",       href: "/exports",    icon: FileText },
  { label: "Billing",       href: "/billing",    icon: CreditCard },
  { label: "Analytics",     href: "/analytics",  icon: ChartBar },
  { label: "Profile",       href: "/profile",    icon: User },
  { label: "Settings",      href: "/settings",   icon: Cog }
];

const adminItems: { label: string; href: Route; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { label: "Users",         href: "/admin/users",         icon: Users },
  { label: "Payments",      href: "/admin/payments",      icon: DollarSign },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: ReceiptText },
  { label: "AI Usage",      href: "/admin/usage",         icon: ListChecks },
  { label: "Logs",          href: "/admin/logs",          icon: ShieldCheck }
];

export function Sidebar() {
  const pathname = usePathname();
  const [billing, setBilling] = useState<{
    snapshot?: { plan: string; active: boolean; status: string; cancelAtPeriodEnd: boolean };
    usage?: { aiCount: number; aiRemaining: number | string; limits: { aiLimit: number } };
  } | null>(null);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const response = await fetch("/api/billing");
        if (response.ok) {
          const data = await response.json();
          setBilling(data);
        }
      } catch {
        // ignore
      }
    }
    void fetchBilling();
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white xl:flex xl:flex-col">
      {/* ── Brand header ── */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-900">CourseAI</p>
            <p className="text-[11px] text-slate-500">AI Course Platform</p>
          </div>
        </div>
      </div>

      {/* ── Scrollable nav ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* Workspace nav */}
        <nav>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-brand-gradient text-white shadow-glow"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-600"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.label === "AI Generator" && (
                    <Badge className="ml-auto text-[9px]" variant="success">New</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Subscription status card */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {billing ? (billing.snapshot?.plan === "PRO" ? "Pro Plan" : "Free Plan") : "Loading…"}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                {billing ? (
                  billing.snapshot?.plan === "PRO" ? (
                    billing.snapshot.cancelAtPeriodEnd ? "Cancelling soon" : "Active subscription"
                  ) : (
                    `${billing.usage?.aiRemaining === Number.POSITIVE_INFINITY ? "∞" : (billing.usage?.aiRemaining ?? 0)} AI requests left`
                  )
                ) : "Checking status…"}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Bell className="h-3.5 w-3.5 text-violet-500" />
            </div>
          </div>
          {billing?.snapshot?.plan !== "PRO" && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full rounded-full bg-brand-gradient transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round(((billing?.usage?.aiCount ?? 0) / 50) * 100))}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Admin nav */}
        <nav>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Administration</p>
          <div className="space-y-0.5">
            {adminItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    active
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Upgrade button ── */}
      <div className="px-4 py-4 border-t border-slate-100">
        <Link href="/billing" className="block w-full">
          <Button variant="default" className="w-full bg-brand-gradient shadow-glow hover:opacity-90 hover:shadow-glow">
            {billing?.snapshot?.plan === "PRO" ? "Manage billing" : "Upgrade to Pro"}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
