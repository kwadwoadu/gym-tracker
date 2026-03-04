"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, ClipboardList, BarChart3, Users, MoreHorizontal } from "lucide-react";
import { MoreSheet } from "./more-sheet";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  icon: typeof Home;
  label: string;
}

const tabs: TabItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/program", icon: ClipboardList, label: "Program" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/community", icon: Users, label: "Community" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  // Check if current route is in "More" menu items
  const isMoreActive = ["/exercises", "/nutrition", "/settings", "/timer", "/form-library", "/body", "/trainer"].some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Calculate active tab index for sliding indicator
  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex(
      (tab) =>
        pathname === tab.href ||
        (tab.href !== "/" && pathname.startsWith(tab.href + "/"))
    );
    if (idx >= 0) return idx;
    if (isMoreActive) return tabs.length; // "More" tab
    return 0; // Default to home
  }, [pathname, isMoreActive]);

  return (
    <>
      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        {/* Glass background with blur */}
        <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-xl backdrop-saturate-[1.8] border-t border-white/8 shadow-[var(--shadow-glass)] glass-bg" />

        <div
          className="relative flex items-center justify-around px-2"
          style={{
            height: "calc(49px + env(safe-area-inset-bottom, 0px))",
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          {/* Sliding active indicator */}
          <motion.div
            className="absolute top-0 h-[2px] bg-[#CDFF00] rounded-full"
            style={{ width: `${100 / (tabs.length + 1)}%` }}
            animate={{ left: `${(activeIndex * 100) / (tabs.length + 1)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {tabs.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href + "/"));

            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-[49px] transition-colors",
                  isActive ? "text-[#CDFF00]" : "text-[#666666]"
                )}
              >
                <tab.icon
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}

          {/* More Tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-[49px] transition-colors",
              isMoreActive || moreOpen ? "text-[#CDFF00]" : "text-[#666666]"
            )}
          >
            <MoreHorizontal
              className="w-6 h-6"
              strokeWidth={isMoreActive || moreOpen ? 2.5 : 2}
            />
            <span className="text-[11px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Sheet */}
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
