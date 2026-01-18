"use client";

import { useRouter, usePathname } from "next/navigation";
import { Dumbbell, UtensilsCrossed, Settings } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useNutritionAccess } from "@/hooks/use-nutrition-access";
import { cn } from "@/lib/utils";

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItem {
  href: string;
  icon: typeof Dumbbell;
  label: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/exercises",
    icon: Dumbbell,
    label: "Exercises",
    description: "Browse exercise library",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    description: "App preferences",
  },
];

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasAccess: hasNutritionAccess } = useNutritionAccess();

  // Build menu items with conditional nutrition
  const allItems: MenuItem[] = hasNutritionAccess
    ? [
        menuItems[0],
        {
          href: "/nutrition",
          icon: UtensilsCrossed,
          label: "Nutrition",
          description: "Meal tracking & macros",
        },
        menuItems[1],
      ]
    : menuItems;

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#0A0A0A] border-[#2A2A2A]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg text-center text-white">More</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8">
          <div className="space-y-1">
            {allItems.map((item) => {
              const isActive = pathname === item.href ||
                pathname.startsWith(item.href + "/");

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "flex items-center gap-4 w-full p-4 rounded-xl transition-colors",
                    isActive
                      ? "bg-[#CDFF00]/10 text-[#CDFF00]"
                      : "text-white hover:bg-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isActive ? "bg-[#CDFF00]/20" : "bg-white/10"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p
                      className={cn(
                        "text-sm",
                        isActive ? "text-[#CDFF00]/70" : "text-white/50"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
