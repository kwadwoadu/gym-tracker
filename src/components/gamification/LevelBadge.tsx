"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Award,
  Star,
  Trophy,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  title: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showTitle?: boolean;
  animate?: boolean;
  className?: string;
}

// Map tier titles to icons
const TIER_ICONS: Record<string, typeof Dumbbell> = {
  Novice: Dumbbell,
  Regular: Award,
  Dedicated: Star,
  Committed: Trophy,
  Elite: Crown,
  Legend: Sparkles,
};

export function LevelBadge({
  level,
  title,
  color,
  size = "md",
  showTitle = true,
  animate = false,
  className,
}: LevelBadgeProps) {
  const Icon = TIER_ICONS[title] || Dumbbell;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const badge = (
    <div
      className={cn(
        "relative rounded-full flex flex-col items-center justify-center font-bold",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        border: `2px solid ${color}`,
        color,
      }}
    >
      <Icon className={iconSizes[size]} />
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-background text-foreground text-[10px] font-bold border"
        style={{ borderColor: color }}
      >
        {level}
      </span>
    </div>
  );

  if (animate) {
    return (
      <div className="flex flex-col items-center gap-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {badge}
        </motion.div>
        {showTitle && (
          <motion.p
            className="text-xs font-medium"
            style={{ color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {badge}
      {showTitle && (
        <p className="text-xs font-medium" style={{ color }}>
          {title}
        </p>
      )}
    </div>
  );
}

// Compact version for inline use
export function LevelBadgeCompact({
  level,
  title,
  color,
  className,
}: Omit<LevelBadgeProps, "size" | "showTitle" | "animate">) {
  const Icon = TIER_ICONS[title] || Dumbbell;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>Lv. {level}</span>
    </div>
  );
}
