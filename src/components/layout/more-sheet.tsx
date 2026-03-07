"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { MORE_ROUTES } from "@/config/navigation";

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg text-center text-white">More</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8">
          <div className="space-y-1">
            {MORE_ROUTES.map((item) => {
              const isActive = pathname === item.href ||
                pathname?.startsWith(item.href + "/");

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "flex items-center gap-4 w-full p-4 rounded-xl transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-white hover:bg-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isActive ? "bg-primary/20" : "bg-white/10"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p
                      className={cn(
                        "text-sm",
                        isActive ? "text-primary/70" : "text-white/50"
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
