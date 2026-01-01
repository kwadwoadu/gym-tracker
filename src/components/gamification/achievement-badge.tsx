"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  Lock,
} from "lucide-react";
import { TIER_COLORS, type AchievementDefinition, type AchievementTier } from "@/data/achievements";

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt?: string;
  percentComplete?: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
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

export function AchievementBadge({
  achievement,
  isUnlocked,
  unlockedAt,
  percentComplete = 0,
  showProgress = true,
  size = "md",
  onClick,
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  const tierColors = TIER_COLORS[achievement.tier];

  const sizeClasses = {
    sm: {
      card: "p-3",
      icon: "w-6 h-6",
      title: "text-sm",
      desc: "text-xs",
    },
    md: {
      card: "p-4",
      icon: "w-8 h-8",
      title: "text-base",
      desc: "text-sm",
    },
    lg: {
      card: "p-6",
      icon: "w-12 h-12",
      title: "text-lg",
      desc: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      <Card
        className={cn(
          sizes.card,
          "relative overflow-hidden transition-all cursor-pointer",
          isUnlocked
            ? cn(tierColors.bg, tierColors.border, "border")
            : "bg-muted/30 border-border opacity-60"
        )}
        onClick={onClick}
      >
        {/* Progress bar background for locked achievements */}
        {!isUnlocked && showProgress && percentComplete > 0 && (
          <div
            className="absolute inset-0 bg-primary/10"
            style={{ width: `${percentComplete}%` }}
          />
        )}

        <div className="relative flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 rounded-full p-2",
              isUnlocked ? tierColors.bg : "bg-muted"
            )}
          >
            {isUnlocked ? (
              <Icon className={cn(sizes.icon, tierColors.text)} />
            ) : (
              <Lock className={cn(sizes.icon, "text-muted-foreground")} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  sizes.title,
                  "font-semibold truncate",
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {achievement.name}
              </h4>
              <TierBadge tier={achievement.tier} size={size} />
            </div>
            <p
              className={cn(
                sizes.desc,
                isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
              )}
            >
              {achievement.description}
            </p>

            {/* Progress indicator for locked achievements */}
            {!isUnlocked && showProgress && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {percentComplete}% complete
                </p>
              </div>
            )}

            {/* Unlocked date */}
            {isUnlocked && unlockedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Unlocked {new Date(unlockedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function TierBadge({ tier, size }: { tier: AchievementTier; size: "sm" | "md" | "lg" }) {
  const tierColors = TIER_COLORS[tier];

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        tierColors.border,
        tierColors.text,
        size === "sm" && "text-[10px] px-1.5 py-0"
      )}
    >
      {tier}
    </Badge>
  );
}
