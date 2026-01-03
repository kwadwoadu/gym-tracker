import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Get or create user in database from Clerk auth
 * Call this in API routes to get the current user
 */
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { clerkId },
    });
  }

  return user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
