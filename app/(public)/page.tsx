"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  "AI-powered course outlines",
  "Editable lessons, quizzes, flashcards",
  "Export to PDF, Markdown, SCORM",
  "Stripe billing and subscription management",
  "Role-based access and admin controls"
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12 lg:px-24">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl"
            >
              Build premium online courses with AI, faster.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
            >
              CourseAI helps instructors, coaches, and creators generate complete course content, marketing pages, and export-ready assets using guided AI workflows.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                Open dashboard
              </Link>
              <Link href="/auth/sign-in" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Sign in
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-soft"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-brand-500">CourseAI preview</p>
            <div className="mt-8 space-y-6">
              {features.map((feature) => (
                <div key={feature} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
