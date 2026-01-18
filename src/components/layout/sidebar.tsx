"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  BarChart3,
  ClipboardList,
  Settings,
  UtensilsCrossed,
  Home,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useNutritionAccess } from "@/hooks/use-nutrition-access";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/program", icon: ClipboardList, label: "Program" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { hasAccess: hasNutritionAccess } = useNutritionAccess();
  const [collapsed, setCollapsed] = useState(false);

  const allNavItems = hasNutritionAccess
    ? [...navItems.slice(0, 4), { href: "/nutrition", icon: UtensilsCrossed, label: "Nutrition" }, navItems[navItems.length - 1]]
    : navItems;

  // Add settings at the end
  const navWithSettings = [...allNavItems, { href: "/settings", icon: Settings, label: "Settings" }];

  return (
    <div
      className={`flex flex-col h-full bg-[#0A0A0A] border-r border-white/10 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#CDFF00] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl">SetFlow</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-10 h-10 rounded-full bg-[#CDFF00] flex items-center justify-center mx-auto">
            <Dumbbell className="w-5 h-5 text-black" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navWithSettings.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#CDFF00]/10 text-[#CDFF00]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-white/40 hover:text-white hover:bg-white/5"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-white/60" />
              )}
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <div className="text-sm font-medium truncate">
                    {user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0]}
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
