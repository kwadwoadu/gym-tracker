import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// NextRequest available via clerkMiddleware callback
import { decodeClerkJwt } from "@/lib/jwt-utils";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/landing",
  "/api/health",
  "/manifest.json",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Strip any client-sent x-clerk-user-id to prevent header injection
  const incomingHeaders = new Headers(req.headers);
  incomingHeaders.delete("x-clerk-user-id");

  if (isPublicRoute(req)) {
    return;
  }

  if (isApiRoute(req)) {
    // Try Clerk auth() first
    let userId: string | null = null;
    try {
      const result = await auth();
      userId = result.userId;
    } catch (e) {
      console.warn("[middleware] Clerk auth() failed:", (e as Error).message);
    }

    // Fallback: decode JWT directly
    if (!userId) {
      const sessionCookie = req.cookies.get("__session");
      if (sessionCookie?.value) {
        userId = decodeClerkJwt(sessionCookie.value);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pass userId to route handler via header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-clerk-user-id");
    requestHeaders.set("x-clerk-user-id", userId);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Non-API protected routes
  try {
    await auth.protect();
  } catch {
    const sessionCookie = req.cookies.get("__session");
    const userId = sessionCookie?.value
      ? decodeClerkJwt(sessionCookie.value)
      : null;
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*)).*)",
    "/(api|trpc)(.*)",
  ],
};
