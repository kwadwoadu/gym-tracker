"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./sidebar";
import { BottomTabBar } from "./bottom-tab-bar";

interface DesktopLayoutProps {
  children: ReactNode;
}

// Routes that should not show navigation (sidebar or tab bar)
const excludedRoutes = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/workout",
  "/focus-session",
];

// Routes that also hide the landing page (for non-authenticated users)
const landingRoutes = ["/"];

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Don't show navigation on excluded routes
  const isExcludedRoute = excludedRoutes.some((route) => pathname.startsWith(route));

  // Check if on landing page (for non-signed in users)
  const isLandingPage = landingRoutes.includes(pathname) && !isSignedIn;

  // Don't show navigation if not signed in or on excluded routes
  if (!isLoaded || isExcludedRoute || isLandingPage) {
    return <>{children}</>;
  }

  // Not signed in and not on landing - show children only
  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on mobile, visible on lg+ */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-50">
        <Sidebar />
      </aside>

      {/* Main content - full width on mobile, offset on lg+ */}
      <main className="flex-1 lg:pl-64">
        {children}
      </main>

      {/* Bottom Tab Bar - visible on mobile only */}
      <BottomTabBar />
    </div>
  );
}
