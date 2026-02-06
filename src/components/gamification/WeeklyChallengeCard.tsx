"use client";

import { motion } from "framer-motion";
import {
  Dumbbell,
  Flame,
  UtensilsCrossed,
  Sunrise,
  Trophy,
  Star,
  Pill,
  Hash,
  Zap,
  Crown,
  BarChart3,
  Target,
  Check,
  Weight,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Map icon names to Lucide components
const ICON_MAP: Record<string, typeof Dumbbell> = {
  Dumbbell,
  Flame,
  UtensilsCrossed,
  Sunrise,
  Trophy,
  Star,
  Pill,
  Hash,
  Zap,
  Crown,
  BarChart3,
  Target,
  Weight,
};

interface WeeklyChallengeCardProps {
  challengeId: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    type: string;
    value: number;
  };
  progress: number;
  isComplete: boolean;
  daysRemaining: number;
  className?: string;
}

export function WeeklyChallengeCard({
  title,
  description,
  icon,
  xpReward,
  requirement,
  progress,
  isComplete,
  daysRemaining,
  className,
}: WeeklyChallengeCardProps) {
  const Icon = ICON_MAP[icon] || Target;
  const progressPercent = Math.min(100, (progress / requirement.value) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card
        className={cn(
          "p-4 transition-all duration-300",
          isComplete
            ? "bg-success/10 border-success/30"
            : "bg-card border-border hover:border-primary/30",
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isComplete ? "bg-success/20" : "bg-primary/20"
            )}
          >
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Check className="w-5 h-5 text-success" />
              </motion.div>
            ) : (
              <Icon className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate",
                    isComplete ? "text-success" : "text-foreground"
                  )}
                >
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {description}
                </p>
              </div>

              {/* XP badge */}
              <Badge
                variant={isComplete ? "default" : "secondary"}
                className={cn(
                  "shrink-0",
                  isComplete && "bg-success text-success-foreground"
                )}
              >
                <Zap className="w-3 h-3 mr-1" />
                {xpReward} XP
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {progress} / {requirement.value}
                </span>
                <div className="flex items-center gap-2">
                  {!isComplete && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      isComplete ? "text-success" : "text-primary"
                    )}
                  >
                    {isComplete ? "Complete!" : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
              </div>
              <Progress
                value={progressPercent}
                className={cn("h-2", isComplete && "[&>div]:bg-success")}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Compact version for lists
export function WeeklyChallengeCardCompact({
  title,
  icon,
  xpReward,
  requirement,
  progress,
  isComplete,
  daysRemaining,
  className,
}: Omit<WeeklyChallengeCardProps, "description" | "challengeId">) {
  const Icon = ICON_MAP[icon] || Target;
  const progressPercent = Math.min(100, (progress / requirement.value) * 100);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isComplete
          ? "bg-success/10 border-success/30"
          : "bg-card border-border",
        className
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isComplete ? "bg-success/20" : "bg-primary/20"
        )}
      >
        {isComplete ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Icon className="w-4 h-4 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isComplete && "text-success"
            )}
          >
            {title}
          </p>
          {!isComplete && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {daysRemaining}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Progress
            value={progressPercent}
            className={cn("h-1.5 flex-1", isComplete && "[&>div]:bg-success")}
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {progress}/{requirement.value}
          </span>
        </div>
      </div>

      <Badge
        variant={isComplete ? "default" : "secondary"}
        className={cn(
          "shrink-0 text-xs",
          isComplete && "bg-success text-success-foreground"
        )}
      >
        {xpReward} XP
      </Badge>
    </div>
  );
}
