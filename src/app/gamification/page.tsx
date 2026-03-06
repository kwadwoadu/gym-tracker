"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Flame,
  Zap,
  Lock,
  Trophy,
  Calendar,
  Dumbbell,
  Medal,
  Crown,
  TrendingUp,
  Star,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBarUnified } from "@/components/shared/progress-bar-unified";
import { HEADING } from "@/lib/typography";
import { ACHIEVEMENTS, TIER_COLORS } from "@/data/achievements";
import type { AchievementDefinition } from "@/data/achievements";
import { getLevelInfo, getStreakMultiplier } from "@/lib/gamification";
import {
  useGamification,
  useDailyChallenges,
  useWeeklyChallenges,
  useStats,
  useAchievements,
} from "@/lib/queries";

type IconComponent = React.ComponentType<{ className?: string }>;
const ICON_MAP: Record<string, IconComponent> = {
  Flame, Dumbbell, Medal, Trophy, Crown, TrendingUp, Star, Calendar, Weight, Zap,
};
const TIER_ICONS: Record<string, IconComponent> = {
  Novice: Dumbbell, Regular: Medal, Dedicated: Star, Committed: Trophy, Elite: Crown, Legend: Zap,
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

export default function GamificationPage() {
  const router = useRouter();
  const { data: gData, isLoading: gLoading } = useGamification();
  const { data: dailyChallenges, isLoading: dLoading } = useDailyChallenges();
  const { data: weeklyChallenges, isLoading: wLoading } = useWeeklyChallenges();
  const { data: stats, isLoading: sLoading } = useStats("all");
  const { data: unlockedAchievements } = useAchievements();

  const isLoading = gLoading || dLoading || wLoading || sLoading;

  const gamification = gData?.gamification;
  const totalXP = gamification?.totalXP ?? 0;
  const levelInfo = useMemo(() => getLevelInfo(totalXP), [totalXP]);
  const streakDays = gamification?.streakDays ?? stats?.currentStreak ?? 0;
  const { multiplier } = useMemo(() => getStreakMultiplier(streakDays), [streakDays]);

  const TierIcon = TIER_ICONS[levelInfo.title] || Dumbbell;

  const unlockedIds = useMemo(() => {
    if (!unlockedAchievements) return new Set<string>();
    return new Set(unlockedAchievements.map((a) => a.achievementId));
  }, [unlockedAchievements]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={HEADING.h3}>Achievements</h1>
        </div>
      </div>

      <motion.div
        className="px-4 pt-6 space-y-6 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Centered Level Badge (large) */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2">
          <div
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center font-bold relative"
            style={{
              backgroundColor: `${levelInfo.color}20`,
              border: `3px solid ${levelInfo.color}`,
              color: levelInfo.color,
            }}
          >
            <TierIcon className="w-8 h-8" />
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background text-foreground text-xs font-bold border"
              style={{ borderColor: levelInfo.color }}
            >
              {levelInfo.level}
            </span>
          </div>
          <p className="text-sm font-semibold" style={{ color: levelInfo.color }}>{levelInfo.title}</p>
          <p className="text-xs text-muted-foreground">{totalXP.toLocaleString()} Total XP</p>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">Level {levelInfo.level}</span>
            <span className="text-xs font-medium text-muted-foreground">Level {levelInfo.level + 1}</span>
          </div>
          <ProgressBarUnified
            value={levelInfo.xpInLevel}
            max={levelInfo.xpInLevel + levelInfo.xpToNext}
            variant="xp"
            glow
          />
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs tabular-nums text-muted-foreground">{levelInfo.xpInLevel.toLocaleString()} XP</span>
            <span className="text-xs tabular-nums text-muted-foreground">{(levelInfo.xpInLevel + levelInfo.xpToNext).toLocaleString()} XP</span>
          </div>
        </motion.div>

        {/* Streak Multiplier Card */}
        <motion.div
          variants={fadeUp}
          className="bg-card rounded-xl border border-primary/20 p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{streakDays} Day Streak</p>
            <p className="text-xs text-muted-foreground">Keep it going to earn more XP</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-orange-500/20">
            <span className="text-sm font-bold text-orange-500">x{multiplier}</span>
          </div>
        </motion.div>

        {/* Daily Challenges */}
        <motion.div variants={fadeUp}>
          <h2 className="text-base font-semibold text-foreground mb-3">Daily Challenges</h2>
          <div className="space-y-3">
            {(dailyChallenges ?? []).map((dc) => {
              const c = dc.challenge;
              const Icon = ICON_MAP[c.icon] || Zap;
              return (
                <div
                  key={dc.challengeId}
                  className={`bg-card rounded-xl border p-4 transition-all ${
                    dc.isComplete
                      ? "border-gym-success/20 opacity-65"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        dc.isComplete ? "bg-gym-success/20" : "bg-primary/20"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${dc.isComplete ? "text-gym-success" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${dc.isComplete ? "text-gym-success" : "text-foreground"}`}>
                        {c.title}
                      </p>
                      <ProgressBarUnified
                        value={dc.progress}
                        max={c.requirement.value}
                        variant="challenge"
                        showValue
                        className="mt-1.5"
                      />
                    </div>
                    <Badge variant={dc.isComplete ? "default" : "secondary"} className={dc.isComplete ? "bg-gym-success text-black" : ""}>
                      <Zap className="w-3 h-3 mr-1" />
                      {c.xpReward}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {(!dailyChallenges || dailyChallenges.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No daily challenges available</p>
            )}
          </div>
        </motion.div>

        {/* Weekly Challenge */}
        <motion.div variants={fadeUp}>
          <h2 className="text-base font-semibold text-foreground mb-3">Weekly Challenge</h2>
          <div className="space-y-3">
            {(weeklyChallenges ?? []).map((wc) => {
              const c = wc.challenge;
              const Icon = ICON_MAP[c.icon] || Zap;
              return (
                <div
                  key={wc.challengeId}
                  className={`rounded-xl border p-4 transition-all ${
                    wc.isComplete
                      ? "bg-gym-success/10 border-gym-success/20"
                      : "bg-gym-blue/10 border-gym-blue/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${wc.isComplete ? "bg-gym-success/20" : "bg-gym-blue/20"}`}>
                      <Icon className={`w-5 h-5 ${wc.isComplete ? "text-gym-success" : "text-gym-blue"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${wc.isComplete ? "text-gym-success" : "text-foreground"}`}>
                        {c.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                    <Badge variant={wc.isComplete ? "default" : "secondary"} className={wc.isComplete ? "bg-gym-success text-black" : ""}>
                      <Zap className="w-3 h-3 mr-1" />
                      {c.xpReward}
                    </Badge>
                  </div>
                  <ProgressBarUnified
                    value={wc.progress}
                    max={c.requirement.value}
                    variant="challenge"
                    showValue
                  />
                  {!wc.isComplete && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{wc.daysRemaining} {wc.daysRemaining === 1 ? "day" : "days"} remaining</span>
                    </div>
                  )}
                </div>
              );
            })}
            {(!weeklyChallenges || weeklyChallenges.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No weekly challenges available</p>
            )}
          </div>
        </motion.div>

        {/* Achievement Gallery */}
        <motion.div variants={fadeUp}>
          <h2 className="text-base font-semibold text-foreground mb-3">All Achievements</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => (
              <AchievementTile key={a.id} achievement={a} isUnlocked={unlockedIds.has(a.id)} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AchievementTile({ achievement, isUnlocked }: { achievement: AchievementDefinition; isUnlocked: boolean }) {
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  const tier = TIER_COLORS[achievement.tier];

  return (
    <motion.div
      className={`rounded-xl border p-3 flex flex-col items-center text-center gap-1.5 transition-all ${
        isUnlocked
          ? `bg-gym-warning/20 border-gym-warning/30`
          : "bg-card opacity-50 border-border"
      }`}
      whileTap={{ scale: 0.97 }}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUnlocked ? tier.bg : "bg-muted"}`}>
        {isUnlocked ? (
          <Icon className={`w-5 h-5 ${tier.text}`} />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <p className={`text-xs font-medium leading-tight line-clamp-2 ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
        {achievement.name}
      </p>
      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
        {achievement.description}
      </p>
    </motion.div>
  );
}
