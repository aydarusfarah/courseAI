"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 md:px-12 lg:px-24">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-950">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Join CourseAI and start generating professional courses with AI.</p>
        <div className="mt-8">
          <SignUp path="/auth/sign-up" routing="path" fallbackRedirectUrl="/dashboard" />
        </div>
      </div>
    </main>
  );
}
