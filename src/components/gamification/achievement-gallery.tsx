"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AchievementBadge } from "./achievement-badge";
import { Trophy } from "lucide-react";
import {
  CATEGORY_NAMES,
  type AchievementCategory,
} from "@/data/achievements";
import type { AchievementProgress } from "@/lib/gamification";

interface AchievementGalleryProps {
  progress: AchievementProgress[];
  stats: {
    totalAchievements: number;
    unlockedCount: number;
    bronzeCount: number;
    silverCount: number;
    goldCount: number;
  };
}

const CATEGORIES: AchievementCategory[] = [
  "streak",
  "workouts",
  "volume",
  "personal_records",
  "consistency",
];

export function AchievementGallery({ progress, stats }: AchievementGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");

  const filteredProgress = selectedCategory === "all"
    ? progress
    : progress.filter(p => p.achievement.category === selectedCategory);

  const unlockedFirst = [...filteredProgress].sort((a, b) => {
    // Unlocked first
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;
    // Then by progress
    return b.percentComplete - a.percentComplete;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {stats.unlockedCount} / {stats.totalAchievements}
            </h3>
            <p className="text-sm text-muted-foreground">Achievements unlocked</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-orange-700/50 text-orange-400">
              {stats.bronzeCount}
            </Badge>
            <Badge variant="outline" className="border-gray-400/50 text-gray-300">
              {stats.silverCount}
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              {stats.goldCount}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 via-gray-400 to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.unlockedCount / stats.totalAchievements) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className="flex-shrink-0"
        >
          All
        </Button>
        {CATEGORIES.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex-shrink-0"
          >
            {CATEGORY_NAMES[category]}
          </Button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {unlockedFirst.map((item, index) => (
            <motion.div
              key={item.achievement.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementBadge
                achievement={item.achievement}
                isUnlocked={item.isUnlocked}
                unlockedAt={item.unlockedAt}
                percentComplete={item.percentComplete}
                showProgress={true}
                size="md"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProgress.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No achievements in this category
        </div>
      )}
    </div>
  );
}
