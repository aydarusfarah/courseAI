"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 md:px-12 lg:px-24">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to CourseAI and continue building your course projects.</p>
        <div className="mt-8">
          <SignIn path="/auth/sign-in" routing="path" />
        </div>
      </div>
    </main>
  );
}
