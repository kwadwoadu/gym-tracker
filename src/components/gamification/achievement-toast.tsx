"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Flame,
  Dumbbell,
  Medal,
  Trophy,
  Crown,
  TrendingUp,
  Star,
  Calendar,
  Weight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_COLORS, type AchievementDefinition } from "@/data/achievements";

interface AchievementToastProps {
  achievement: AchievementDefinition;
  onClose: () => void;
  autoCloseMs?: number;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Dumbbell,
  Medal,
  Trophy,
  Crown,
  TrendingUp,
  Star,
  Calendar,
  Weight,
  Zap,
};

export function AchievementToast({
  achievement,
  onClose,
  autoCloseMs = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  const tierColors = TIER_COLORS[achievement.tier];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          <Card
            className={cn(
              "p-4 relative overflow-hidden",
              tierColors.bg,
              tierColors.border,
              "border shadow-xl"
            )}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="relative flex items-center gap-4">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className={cn(
                  "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center",
                  tierColors.bg
                )}
              >
                <Icon className={cn("w-8 h-8", tierColors.text)} />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-muted-foreground uppercase tracking-wider mb-1"
                >
                  Achievement Unlocked!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <h4 className="font-bold text-foreground truncate">
                    {achievement.name}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      tierColors.border,
                      tierColors.text
                    )}
                  >
                    {achievement.tier}
                  </Badge>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-muted-foreground mt-1 truncate"
                >
                  {achievement.description}
                </motion.p>
              </div>
            </div>

            {/* Progress bar (auto-close indicator) */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-primary"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoCloseMs / 1000, ease: "linear" }}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement toasts
interface AchievementUnlock {
  achievement: AchievementDefinition;
  unlockedAt: string;
}

export function useAchievementToasts() {
  const [toasts, setToasts] = useState<AchievementUnlock[]>([]);

  const addToasts = (newUnlocks: AchievementUnlock[]) => {
    setToasts(prev => [...prev, ...newUnlocks]);
  };

  const removeToast = (achievementId: string) => {
    setToasts(prev => prev.filter(t => t.achievement.id !== achievementId));
  };

  return {
    toasts,
    addToasts,
    removeToast,
    currentToast: toasts[0] || null,
  };
}
