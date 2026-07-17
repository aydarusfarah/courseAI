"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { Search, Moon, Sun, Bell, Menu, X, Zap } from "lucide-react";
import { Input } from "./ui/input";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className={`flex h-screen overflow-hidden ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950"}`}>

      {/* ── Sidebar (desktop) ── */}
      <Sidebar />

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-900">CourseAI</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
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

      {/* ── Right column: topbar + scrollable content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur backdrop-saturate-150 dark:bg-slate-950/90 dark:border-slate-800 z-30">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 xl:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-all duration-200 focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-glow">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <Input
                placeholder="Search courses, requests, reports…"
                className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-slate-400"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
              </button>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8 space-y-6">

            {/* ── Breadcrumb bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-card">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                  <Link href="/dashboard" className="font-medium text-violet-600 hover:text-violet-700 transition-colors">Home</Link>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500">Overview</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/generator"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  New course
                </Link>
                <button className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all duration-200">
                  Invite team
                </button>
              </div>
            </div>

            {children}

            {/* ── Footer ── */}
            <footer className="rounded-2xl border border-slate-200/80 bg-white px-6 py-4 shadow-card">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
                <p>CourseAI © 2026 — Built for modern course creators.</p>
                <p>Version 0.1.0</p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
