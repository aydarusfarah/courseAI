import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError();
  }
  return userId;
}

export async function ensurePrismaUser(): Promise<User> {
  const clerkId = await requireAuth();
  const clerkUser = await currentUser();

  const email =
    clerkUser?.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    `${clerkId}@users.courseai.local`;

  return prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name: clerkUser?.fullName ?? null,
      avatarUrl: clerkUser?.imageUrl ?? null
    },
    update: {
      email,
      name: clerkUser?.fullName ?? null,
      avatarUrl: clerkUser?.imageUrl ?? null
    }
  });
}
