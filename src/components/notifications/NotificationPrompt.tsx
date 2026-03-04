"use client";

import { Bell, Flame, Trophy } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface NotificationPromptProps {
  open: boolean;
  onClose: () => void;
  onEnable: () => void;
}

const PREVIEW_ITEMS = [
  {
    icon: Bell,
    title: "Training Reminders",
    example: '"Time to train - Upper Push day"',
    color: "#CDFF00",
  },
  {
    icon: Flame,
    title: "Streak Protection",
    example: '"14-day streak at risk!"',
    color: "#F59E0B",
  },
  {
    icon: Trophy,
    title: "PR Alerts",
    example: '"2.5kg away from Bench PR"',
    color: "#22C55E",
  },
];

export function NotificationPrompt({
  open,
  onClose,
  onEnable,
}: NotificationPromptProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#0A0A0A] border-[#2A2A2A]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl text-center text-white">
            Stay On Track
          </DrawerTitle>
          <p className="text-sm text-white/40 text-center mt-1">
            Get smart reminders that help you stay consistent
          </p>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-3">
          {PREVIEW_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 bg-[#1A1A1A] rounded-xl p-4"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon
                  className="w-5 h-5"
                  style={{ color: item.color }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-white/40">{item.example}</p>
              </div>
            </div>
          ))}

          <button
            onClick={onEnable}
            className="w-full h-14 rounded-xl bg-[#CDFF00] text-black font-semibold text-lg active:scale-[0.98] transition-transform mt-4"
          >
            Enable Smart Reminders
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-white/30 font-medium"
          >
            Maybe later
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
