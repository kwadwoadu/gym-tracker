import { auth, currentUser } from "@clerk/nextjs/server";
import { headers, cookies } from "next/headers";
import { prisma } from "./prisma";
import { decodeClerkJwt } from "./jwt-utils";

/**
 * Get the Clerk user ID with 3-level fallback.
 *
 * 1. Clerk auth() - standard path
 * 2. x-clerk-user-id header - set by middleware after JWT decode
 * 3. Direct __session JWT decode - last resort
 *
 * Workaround for Vercel middleware detection bug:
 * https://github.com/clerk/javascript/issues/2045
 */
export async function getClerkId(): Promise<string | null> {
  // Method 1: Standard Clerk auth()
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch (e) {
    console.warn("[auth] Clerk auth() failed:", (e as Error).message);
  }

  // Method 2: Middleware-set header
  try {
    const headersList = await headers();
    const clerkId = headersList.get("x-clerk-user-id");
    if (clerkId) return clerkId;
  } catch {
    // headers() not available
  }

  // Method 3: Decode __session JWT cookie directly
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session");
    if (sessionCookie?.value) {
      return decodeClerkJwt(sessionCookie.value);
    }
  } catch {
    // Cookie parsing failed
  }

  return null;
}

/**
 * Get or create user in database from Clerk auth.
 * Use this for routes that need the full User record.
 * For just the user ID, use getClerkId() instead.
 */
export async function getCurrentUser() {
  const clerkId = await getClerkId();

  if (!clerkId) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    try {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
      user = await prisma.user.create({ data: { clerkId, email } });
    } catch {
      user = await prisma.user.create({ data: { clerkId } });
    }
  } else if (!user.email) {
    try {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
      if (email) {
        user = await prisma.user.update({ where: { id: user.id }, data: { email } });
      }
    } catch {
      // skip email sync
    }
  }

  return user;
}
