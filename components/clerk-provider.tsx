"use client";

import { ClerkProvider } from "@clerk/nextjs";

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProviderRoot({ children }: ClerkProviderProps) {
  return (
    <ClerkProvider
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
