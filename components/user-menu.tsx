"use client";

import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "./button";

export function UserMenu() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="h-10 w-10 rounded-full bg-slate-100" />;
  }

  return (
    <div className="flex items-center gap-3">
      {isSignedIn ? (
        <>
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 md:inline-block">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress || "CourseAI user"}
          </span>
          <SignOutButton>
            <Button variant="outline">Sign out</Button>
          </SignOutButton>
        </>
      ) : (
        <Button variant="outline" onClick={() => router.push("/auth/sign-in")}>Sign in</Button>
      )}
    </div>
  );
}
