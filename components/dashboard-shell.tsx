"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { ThemeSwitcher, useTheme } from "./theme-provider";
import { Input } from "./ui/input";
import {
  Search, Bell, Menu, X, Zap, ChevronRight
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
  const pathname = usePathname();
  const pageLabel = routeLabels[pathname] ?? "Dashboard";
  useTheme(); // keep ThemeProvider in context tree; dark state handled via CSS class on <html>

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <div className={clsx(
      "flex h-screen overflow-hidden",
      "bg-slate-100 dark:bg-[#0B1220]"
    )}>

      {/* ── Desktop sidebar ── */}
      <Sidebar />

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <button
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="relative z-10 flex w-64 flex-col bg-white shadow-xl dark:bg-slate-950 animate-fade-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-gradient">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">CourseAI</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Close menu"
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
        )} role="banner">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all xl:hidden dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm xl:flex">
              <span className="text-slate-400 dark:text-slate-600">Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-700" aria-hidden="true" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{pageLabel}</span>
            </nav>

            {/* Search */}
            <div className={clsx(
              "hidden md:flex flex-1 items-center gap-2 max-w-md ml-4",
              "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5",
              "transition-all duration-150",
              "focus-within:bg-white",
              "dark:border-slate-700 dark:bg-slate-800/60 dark:focus-within:bg-slate-800"
            )} role="search">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <Input
                placeholder="Search courses, templates, reports…"
                aria-label="Search"
                className="h-auto border-0 bg-transparent p-0 text-sm ring-0 shadow-none focus:ring-0 dark:bg-transparent"
              />
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Theme switcher — desktop only */}
              <div className="hidden lg:block">
                <ThemeSwitcher />
              </div>

              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-theme-accent ring-1 ring-white dark:ring-slate-900" aria-hidden="true" />
              </button>
              <div className="ml-1">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* ── Scrollable main ── */}
        <main className="flex-1 overflow-y-auto" id="main-content">
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
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400">v0.1.0</p>
                {/* Mobile theme switcher */}
                <div className="lg:hidden">
                  <ThemeSwitcher />
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
