import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/api/sync(.*)",
]);

// Public routes - app works offline-first, only sync API needs auth
// All routes except /api/sync are public

export default clerkMiddleware(async (auth, req) => {
  // Only protect sync API routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
