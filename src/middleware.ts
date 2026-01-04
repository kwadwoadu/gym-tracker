import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes - auth pages, health check, and PWA manifest
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/manifest.json",
]);

// Onboarding routes - accessible but require auth
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)",
]);

// API routes need special handling
const isApiRoute = createRouteMatcher(["/api(.*)"]);

// All other routes require authentication
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  // For API routes, return 401 instead of redirect
  if (isApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return;
  }

  // Protect all non-public routes
  await auth.protect();

  // Note: Onboarding check happens client-side via IndexedDB
  // We can't check IndexedDB from middleware (server-side)
  // The main app page will redirect to /onboarding if needed
});

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
