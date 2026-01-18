"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "./sidebar";

interface DesktopLayoutProps {
  children: ReactNode;
}

// Routes that should not show the sidebar
const excludedRoutes = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/workout",
];

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Don't show sidebar on excluded routes
  const isExcludedRoute = excludedRoutes.some((route) => pathname.startsWith(route));

  // Don't show sidebar if not signed in or on excluded routes
  if (!isLoaded || !isSignedIn || isExcludedRoute) {
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
    </div>
  );
}
