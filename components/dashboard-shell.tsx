"use client";

import type { Route } from "next";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { UserMenu } from "./user-menu";
import { Button } from "./button";
import { Search, Moon, Sun, Bell, Menu } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";

const breadcrumbs: { label: string; href: Route }[] = [
  { label: "Home", href: "/dashboard" as Route },
  { label: "Overview", href: "/dashboard" as Route }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"}`}>
      <div className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm sticky top-0 z-40 backdrop-blur backdrop-saturate-150 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="md:hidden" onClick={() => setDrawerOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">CourseAI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin dashboard</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center gap-3 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-4 w-4 text-slate-500" />
            <Input placeholder="Search courses, requests, reports..." className="border-0 bg-transparent px-0 focus-visible:ring-0" />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => setTheme(theme === "light" ? "dark" : "light")}> 
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" className="hidden sm:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 xl:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/95 border border-slate-200 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Breadcrumbs</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.href} className="inline-flex items-center gap-2">
                    <Link href={crumb.href} className="font-medium text-brand-600 hover:underline dark:text-brand-400">{crumb.label}</Link>
                    {index < breadcrumbs.length - 1 && <span>/</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary">New course</Button>
              <Button variant="secondary">Invite team</Button>
            </div>
          </div>

          {children}

          <footer className="mt-10 rounded-3xl border border-slate-200 bg-white/95 p-6 text-sm text-slate-600 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>CourseAI © 2026. Built for modern course creators.</p>
              <p>Version 0.1.0</p>
            </div>
          </footer>
        </main>
      </div>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Navigation</p>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          </div>
          <div className="mt-8">
            <Sidebar />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
