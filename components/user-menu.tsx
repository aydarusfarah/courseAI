"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, User } from "lucide-react";
import { clsx } from "clsx";

export function UserMenu() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse dark:bg-slate-700" />
    );
  }

  if (isSignedIn) {
    const initials = user?.fullName
      ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
      : user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? "U";

    return (
      <div className="flex items-center gap-2">
        <div className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          "bg-brand-gradient text-xs font-bold text-white shadow-glow-sm"
        )}>
          {initials}
        </div>
        <div className="hidden sm:block max-w-[120px]">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
            {user?.fullName ?? "User"}
          </p>
          <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
            {user?.primaryEmailAddress?.emailAddress ?? ""}
          </p>
        </div>
        <SignOutButton>
          <button
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl",
              "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
              "transition-all dark:hover:bg-slate-800 dark:hover:text-slate-300"
            )}
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push("/auth/sign-in" as Route)}
      className={clsx(
        "flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3",
        "text-sm font-semibold text-slate-700",
        "hover:bg-slate-50 hover:border-slate-300",
        "transition-all shadow-xs",
        "dark:border-slate-700 dark:bg-transparent dark:text-slate-300"
      )}
    >
      <User className="h-3.5 w-3.5" />
      Sign in
    </button>
  );
}
