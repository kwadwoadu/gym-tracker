"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, User, Dumbbell, UtensilsCrossed, Database, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HEADING } from "@/lib/typography";

const SETTINGS_TABS = [
  { href: "/settings", label: "Profile", icon: User },
  { href: "/settings/training", label: "Training", icon: Dumbbell },
  { href: "/settings/nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { href: "/settings/data", label: "Data", icon: Database },
];

const SEARCH_INDEX = [
  { label: "Display Name", description: "Change your profile name", tab: "/settings" },
  { label: "Handle", description: "Your @username", tab: "/settings" },
  { label: "Bio", description: "Profile description", tab: "/settings" },
  { label: "Sign Out", description: "Log out of your account", tab: "/settings" },
  { label: "Privacy", description: "Share streak, volume, workouts", tab: "/settings" },
  { label: "Notifications", description: "Reminders and alerts", tab: "/settings/notifications" },
  { label: "Rest Timer", description: "Default rest timer duration", tab: "/settings/training" },
  { label: "Weight Unit", description: "kg or lbs preference", tab: "/settings/training" },
  { label: "Calorie Goal", description: "Daily calorie target", tab: "/settings/nutrition" },
  { label: "Protein Goal", description: "Daily protein target", tab: "/settings/nutrition" },
  { label: "Meal Times", description: "Meal schedule preferences", tab: "/settings/nutrition" },
  { label: "Export Data", description: "Download your workout data", tab: "/settings/data" },
  { label: "Import Data", description: "Restore from backup", tab: "/settings/data" },
  { label: "Clear Data", description: "Delete local data", tab: "/settings/data" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen pb-44 lg:pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={cn(HEADING.h3, "text-foreground flex-1")}>Settings</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="h-10 w-10"
          >
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>
        {showSearch && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-card border border-border rounded-lg divide-y divide-border">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(result.tab);
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                    className="w-full px-4 py-3 text-left"
                  >
                    <p className="text-sm font-medium text-white">{result.label}</p>
                    <p className="text-xs text-white/40">{result.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
      <div className="gradient-divider" />

      {/* Tab navigation */}
      <div className="px-4 py-3 gradient-divider">
        <div className="flex items-center gap-1 bg-card-alt rounded-lg p-1">
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
                    ? "bg-primary text-black"
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
