"use client";

import { ClerkProvider } from "@clerk/nextjs";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProviderRoot({ children }: ClerkProviderProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
