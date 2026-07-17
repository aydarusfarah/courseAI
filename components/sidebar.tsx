"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./button";
import { Bell, Grid, Rocket, Sparkles, CreditCard, ChartBar, Cog, FolderOpen, User, ShieldCheck, ReceiptText, Users, DollarSign, ListChecks, BookOpenText, FileText } from "lucide-react";

const navItems: { label: string; href: Route; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { label: "Overview", href: "/dashboard", icon: Grid },
  { label: "My Courses", href: "/courses", icon: FolderOpen },
  { label: "AI Generator", href: "/generator", icon: Rocket },
  { label: "Templates", href: "/templates", icon: Sparkles },
  { label: "Course Editor", href: "/editor", icon: BookOpenText },
  { label: "Exports", href: "/exports", icon: FileText },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: ChartBar },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Cog }
];

const adminItems: { label: string; href: Route; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: DollarSign },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: ReceiptText },
  { label: "AI Usage", href: "/admin/usage", icon: ListChecks },
  { label: "Logs", href: "/admin/logs", icon: ShieldCheck }
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
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white/95 p-5 xl:block">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">CourseAI</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">Your AI course workspace with modern analytics, billing, and content management.</p>
        </div>

        <nav className="space-y-1">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  active ? "bg-brand-600 text-white shadow-soft" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 group-hover:bg-slate-200",
                  active ? "bg-white/10 text-white" : "bg-slate-100"
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
                {item.label === "AI Generator" && <Badge className="ml-auto" variant="success">New</Badge>}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Workspace status</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">All systems operational</p>
            </div>
            <Bell className="h-5 w-5 text-brand-600" />
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Subscription</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {billing ? (billing.snapshot?.plan === "PRO" ? "Pro" : "Free") : "Loading…"}
            </p>
            <p className="text-xs text-slate-600">
              {billing ? (
                billing.snapshot?.plan === "PRO" ? (
                  billing.snapshot.cancelAtPeriodEnd ? "Cancelling at period end" : "Active subscription"
                ) : (
                  `${billing.usage?.aiRemaining === Number.POSITIVE_INFINITY ? "∞" : (billing.usage?.aiRemaining ?? 0)} AI requests left`
                )
              ) : "Checking status…"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <div className="space-y-1">
            {adminItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <Link href="/billing" className="w-full block">
          <Button variant="secondary" className="w-full">
            {billing?.snapshot?.plan === "PRO" ? "Manage billing" : "Upgrade plan"}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
