"use client";

import { SignIn } from "@clerk/nextjs";
import { Zap, Sparkles, BookOpen, BarChart3 } from "lucide-react";

const perks = [
  { icon: Sparkles, text: "AI-powered course generation" },
  { icon: BookOpen, text: "Rich editor with quizzes & flashcards" },
  { icon: BarChart3, text: "Analytics and usage dashboard" }
];

export default function SignInPage() {
  return (
    <main className="flex min-h-screen bg-slate-50 dark:bg-[#0B1220]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[420px] lg:shrink-0 lg:flex-col lg:justify-between bg-brand-gradient p-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CourseAI</span>
          </div>
          <h2 className="mt-12 text-3xl font-bold leading-snug text-white">
            Build professional courses with AI.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Generate complete course outlines, lessons, quizzes, and flashcards — ready to export to any format.
          </p>
        </div>
        <ul className="space-y-4">
          {perks.map(p => (
            <li key={p.text} className="flex items-center gap-3 text-sm text-white/80">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <p.icon className="h-3.5 w-3.5 text-white" />
              </div>
              {p.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — Clerk form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">CourseAI</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue building your courses.
          </p>

          <div className="mt-8">
            <SignIn path="/auth/sign-in" routing="path" fallbackRedirectUrl="/dashboard" />
          </div>
        </div>
      </div>
    </main>
  );
}
