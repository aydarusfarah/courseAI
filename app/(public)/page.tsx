"use client";

import type { Route } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket, Sparkles, FileText, BarChart3, ShieldCheck,
  ArrowRight, Zap, CheckCircle2, BookOpen, Globe
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "AI-Powered Generation",
    description: "Create full course outlines, lessons, quizzes, and flashcards with one prompt."
  },
  {
    icon: BookOpen,
    title: "Rich Course Editor",
    description: "Edit every lesson, reorder modules, and add custom content with the built-in editor."
  },
  {
    icon: FileText,
    title: "Multi-Format Exports",
    description: "Export to PDF, Markdown, SCORM, HTML, DOCX, and CSV — ready for any LMS."
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "Track AI generation usage, course performance, and subscription metrics."
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Admin dashboard, user management, audit logs, and subscription controls."
  },
  {
    icon: Globe,
    title: "Stripe Billing",
    description: "Built-in subscription management with monthly, yearly, and free tiers."
  }
];

const highlights = [
  "Unlimited AI generations on Pro",
  "Export to 8+ formats including SCORM",
  "Role-based admin controls",
  "Stripe subscription billing",
  "Real-time analytics dashboard",
  "Enterprise-grade security"
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1220] overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl backdrop-saturate-150 dark:border-slate-800/60 dark:bg-[#0B1220]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">CourseAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={"/auth/sign-in" as Route}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 bg-hero-gradient" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />

        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <motion.div {...fade(0)}>
            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800/40 dark:bg-brand-950/40 dark:text-brand-400">
              <Sparkles className="h-3 w-3" />
              AI-powered course creation
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.06)}
            className="mt-4 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white"
          >
            Build premium courses
            <span className="block mt-1">
              <span className="gradient-text">with AI, faster.</span>
            </span>
          </motion.h1>

          <motion.p
            {...fade(0.12)}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400"
          >
            CourseAI helps instructors, coaches, and creators generate complete course content — lessons, quizzes, flashcards — and export to any format using guided AI workflows.
          </motion.p>

          <motion.div
            {...fade(0.18)}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all active:scale-[0.97]"
            >
              <Zap className="h-4 w-4" />
              Open dashboard
            </Link>
            <Link
              href={"/auth/sign-in" as Route}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              Sign in to your account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div {...fade(0.24)} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {["No credit card required", "Free plan available", "Deploy in minutes"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-slate-100 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div {...fade(0)} className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything you need to create professional courses
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              From generation to export, CourseAI handles the entire workflow.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fade(i * 0.05)}>
                <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                    <f.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Pro plan unlocks everything
                </h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  Upgrade to Pro for unlimited generations, all export formats, and enterprise controls.
                </p>
                <Link
                  href="/billing"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all"
                >
                  See pricing
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ul className="space-y-3">
                {highlights.map(h => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-100 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Start building your first course
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Free to start. No credit card needed.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all active:scale-[0.97]"
            >
              <Rocket className="h-4 w-4" />
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-gradient">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-slate-600 dark:text-slate-400">CourseAI</span>
          </div>
          <p>© 2026 CourseAI. Built for modern course creators.</p>
        </div>
      </footer>
    </div>
  );
}
