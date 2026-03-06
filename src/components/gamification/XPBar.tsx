"use client";

import { motion } from "framer-motion";
import { Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBarProps {
  level: number;
  title: string;
  color: string;
  totalXP: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number; // 0-1
  streakDays?: number;
  streakMultiplier?: number;
  className?: string;
}

export function XPBar({
  level,
  title,
  color,
  totalXP,
  xpInLevel,
  xpToNext,
  progress,
  streakDays: _streakDays = 0,
  streakMultiplier = 1,
  className,
}: XPBarProps) {
  const hasStreakBonus = streakMultiplier > 1;

  return (
    <div className={cn("px-4 py-5 bg-muted/30", className)}>
      {/* Level and XP info row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Level badge */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {level}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Level {level}
            </p>
            <p className="text-xs text-muted-foreground" style={{ color }}>
              {title}
            </p>
          </div>
        </div>

        {/* XP and streak info */}
        <div className="flex items-center gap-3">
          {hasStreakBonus && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-medium text-orange-500">
                {streakMultiplier}x
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-semibold text-foreground">
              {totalXP.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar with gradient */}
      <div className="relative h-3 bg-card rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-gym-success to-gym-success animate-xp-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* XP progress text */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {xpInLevel.toLocaleString()} XP
        </span>
        <span className="text-xs text-muted-foreground">
          {xpToNext.toLocaleString()} to next level
        </span>
      </div>
    </div>
  );
}
