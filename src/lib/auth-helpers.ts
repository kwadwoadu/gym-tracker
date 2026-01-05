import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Get or create user in database from Clerk auth
 * Call this in API routes to get the current user
 * Also syncs email from Clerk for feature gating
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
    // Get email from Clerk when creating user
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

    user = await prisma.user.create({
      data: { clerkId, email },
    });
  } else if (!user.email) {
    // Sync email if missing (for existing users)
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

    if (email) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
    }
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
