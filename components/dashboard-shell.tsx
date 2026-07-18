"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { Input } from "./ui/input";
import {
  Search, Moon, Sun, Bell, Menu, X, Zap,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

const routeLabels: Record<string, string> = {
  "/dashboard":           "Overview",
  "/courses":             "My Courses",
  "/generator":           "AI Generator",
  "/templates":           "Templates",
  "/editor":              "Course Editor",
  "/exports":             "Exports",
  "/analytics":           "Analytics",
  "/billing":             "Billing",
  "/profile":             "Profile",
  "/settings":            "Settings",
  "/admin":               "Admin",
  "/admin/users":         "Users",
  "/admin/payments":      "Payments",
  "/admin/subscriptions": "Subscriptions",
  "/admin/usage":         "AI Usage",
  "/admin/logs":          "Audit Logs"
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark]           = useState(false);
  const pathname = usePathname();
  const pageLabel = routeLabels[pathname] ?? "Dashboard";

  // Apply dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <div className={clsx(
      "flex h-screen overflow-hidden",
      dark ? "dark" : "",
      "bg-slate-100 dark:bg-[#0B1220]"
    )}>

      {/* ── Desktop sidebar ── */}
      <Sidebar />

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          />
          {/* Panel */}
          <div className="relative z-10 flex w-64 flex-col bg-white shadow-xl dark:bg-slate-950 animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">CourseAI</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* ── Content column ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className={clsx(
          "glass shrink-0 z-30",
          "border-b border-slate-200/80 dark:border-slate-800",
          "px-4 py-3"
        )}>
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all xl:hidden dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden items-center gap-1.5 text-sm xl:flex">
              <span className="text-slate-400 dark:text-slate-600">Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{pageLabel}</span>
            </div>

            {/* Search */}
            <div className={clsx(
              "hidden md:flex flex-1 items-center gap-2 max-w-md ml-4",
              "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5",
              "transition-all duration-150",
              "focus-within:border-brand-400 focus-within:bg-white focus-within:shadow-glow-sm",
              "dark:border-slate-700 dark:bg-slate-800/60 dark:focus-within:bg-slate-800"
            )}>
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <Input
                placeholder="Search courses, templates, reports…"
                className="h-auto border-0 bg-transparent p-0 text-sm ring-0 shadow-none focus:ring-0 dark:bg-transparent"
              />
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => setDark(!dark)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 ring-1 ring-white dark:ring-slate-900" />
              </button>
              <div className="ml-1">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable main ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 md:px-8 md:py-8">
            {children}

            {/* Footer */}
            <footer className={clsx(
              "flex flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white",
              "px-6 py-4 shadow-card",
              "sm:flex-row sm:items-center sm:justify-between",
              "dark:border-slate-800 dark:bg-slate-900"
            )}>
              <p className="text-xs text-slate-400">CourseAI © 2026 — Built for modern course creators.</p>
              <p className="text-xs text-slate-400">v0.1.0</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
