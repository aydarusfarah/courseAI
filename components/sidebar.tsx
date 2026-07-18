"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./ui/badge";
import {
  BarChart3, BookOpen, CreditCard, FileText, FolderOpen,
  LayoutDashboard, Rocket, Settings, ShieldCheck, Sparkles,
  User, Users, DollarSign, ListChecks, ReceiptText, Zap,
  ChevronRight, TrendingUp
} from "lucide-react";

const navItems: {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  { label: "Overview",      href: "/dashboard",  icon: LayoutDashboard },
  { label: "My Courses",    href: "/courses",    icon: FolderOpen },
  { label: "AI Generator",  href: "/generator",  icon: Rocket, badge: "New" },
  { label: "Templates",     href: "/templates",  icon: Sparkles },
  { label: "Course Editor", href: "/editor",     icon: BookOpen },
  { label: "Exports",       href: "/exports",    icon: FileText },
  { label: "Analytics",     href: "/analytics",  icon: BarChart3 },
  { label: "Billing",       href: "/billing",    icon: CreditCard },
  { label: "Profile",       href: "/profile",    icon: User },
  { label: "Settings",      href: "/settings",   icon: Settings }
];

const adminItems: {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Users",         href: "/admin/users",         icon: Users },
  { label: "Payments",      href: "/admin/payments",      icon: DollarSign },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: ReceiptText },
  { label: "AI Usage",      href: "/admin/usage",         icon: ListChecks },
  { label: "Logs",          href: "/admin/logs",          icon: ShieldCheck }
];

interface BillingState {
  snapshot?: { plan: string; active: boolean; status: string; cancelAtPeriodEnd: boolean };
  usage?: { aiCount: number; aiRemaining: number | string; limits: { aiLimit: number } };
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
        "transition-all duration-150",
        active
          ? [
              "bg-brand-gradient text-white shadow-glow",
            ]
          : [
              "text-slate-600 hover:text-slate-900",
              "hover:bg-slate-100/80",
              "dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            ]
      )}
    >
      <span className={clsx(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
        active
          ? "text-white/90"
          : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
      )}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <Badge variant="success" size="sm" className="shrink-0">{badge}</Badge>
      )}
      {active && (
        <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [billing, setBilling] = useState<BillingState | null>(null);

  useEffect(() => {
    fetch("/api/billing")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setBilling(d))
      .catch(() => null);
  }, []);

  const isPro = billing?.snapshot?.plan === "PRO";
  const aiUsed = billing?.usage?.aiCount ?? 0;
  const aiLimit = billing?.usage?.limits?.aiLimit ?? 50;
  const aiPct = aiLimit === Number.POSITIVE_INFINITY ? 0 : Math.min(100, Math.round((aiUsed / aiLimit) * 100));

  return (
    <aside className={clsx(
      "hidden xl:flex xl:flex-col",
      "w-64 shrink-0 border-r border-slate-200/80 bg-white",
      "dark:border-slate-800 dark:bg-slate-950"
    )}>
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">CourseAI</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">AI Course Platform</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <nav>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
            Workspace
          </p>
          <div className="space-y-0.5">
            {navItems.map(item => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                active={
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                }
              />
            ))}
          </div>
        </nav>

        {/* Usage card */}
        <div className={clsx(
          "rounded-2xl border p-4 space-y-3",
          "border-brand-100 bg-gradient-to-br from-brand-50 to-violet-50",
          "dark:border-brand-900/40 dark:from-brand-950/30 dark:to-violet-950/30"
        )}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {billing ? (isPro ? "Pro Plan" : "Free Plan") : "Loading…"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {billing
                  ? (isPro
                      ? billing.snapshot?.cancelAtPeriodEnd ? "Cancelling soon" : "Active"
                      : `${billing.usage?.aiRemaining === Number.POSITIVE_INFINITY ? "∞" : (billing.usage?.aiRemaining ?? 0)} AI req. left`)
                  : "Checking…"}
              </p>
            </div>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
              <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
            </div>
          </div>
          {!isPro && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>AI usage</span><span>{aiPct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-slate-800/60">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-700"
                  style={{ width: `${aiPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <nav>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
            Administration
          </p>
          <div className="space-y-0.5">
            {adminItems.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
                    "transition-all duration-150",
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
                  )}
                >
                  <Icon className={clsx(
                    "h-4 w-4 shrink-0",
                    active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Upgrade CTA */}
      <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
        <Link
          href="/billing"
          className={clsx(
            "flex w-full items-center justify-center gap-2",
            "rounded-xl bg-brand-gradient px-4 py-2.5",
            "text-sm font-semibold text-white shadow-glow",
            "transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          {isPro ? "Manage billing" : "Upgrade to Pro"}
        </Link>
      </div>
    </aside>
  );
}
