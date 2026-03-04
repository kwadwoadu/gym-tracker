"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, User, Dumbbell, UtensilsCrossed, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { href: "/settings", label: "Profile", icon: User },
  { href: "/settings/training", label: "Training", icon: Dumbbell },
  { href: "/settings/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/settings/data", label: "Data", icon: Database },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen pb-44 lg:pb-8">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 gradient-divider">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="px-4 py-3 gradient-divider">
        <div className="flex items-center gap-1 bg-[#111111] rounded-lg p-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== "/settings" && pathname?.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors touch-target",
                  isActive
                    ? "bg-[#CDFF00] text-black"
                    : "text-white/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
