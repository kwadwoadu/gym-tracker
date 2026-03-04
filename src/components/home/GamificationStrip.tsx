"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { XPBar, DailyChallengeCardCompact, WeeklyChallengeCardCompact } from "@/components/gamification";
import { getTierFromLevel, getStreakMultiplier } from "@/lib/gamification";

interface GamificationStripProps {
  streakDays: number;
  level: number;
  totalXP: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number;
  dailyChallenges: Array<{
    challengeId: string;
    challenge: { title: string; icon: string; xpReward: number; requirement: { type: string; value: number } };
    progress: number;
    isComplete: boolean;
  }>;
  weeklyChallenges: Array<{
    challengeId: string;
    challenge: { title: string; icon: string; xpReward: number; requirement: { type: string; value: number } };
    progress: number;
    isComplete: boolean;
    daysRemaining: number;
  }>;
}

export function GamificationStrip({
  streakDays,
  level,
  totalXP,
  xpInLevel,
  xpToNext,
  progress,
  dailyChallenges,
  weeklyChallenges,
}: GamificationStripProps) {
  const [expanded, setExpanded] = useState(false);
  const tierInfo = getTierFromLevel(level);
  const streakInfo = getStreakMultiplier(streakDays);

  const dailyComplete = dailyChallenges.filter((c) => c.isComplete).length;
  const weeklyComplete = weeklyChallenges.filter((c) => c.isComplete).length;

  return (
    <div className="gradient-divider">
      {/* Collapsed strip */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-[#111111] active:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Streak */}
          {streakDays > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-white">{streakDays}</span>
            </div>
          )}

          {/* Level */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: `${tierInfo.color}30`, color: tierInfo.color }}
            >
              {level}
            </div>
            <span className="text-sm text-[#A0A0A0]">Lv.{level}</span>
          </div>

          {/* Challenge progress */}
          {(dailyChallenges.length > 0 || weeklyChallenges.length > 0) && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#A0A0A0]" />
              <span className="text-sm text-[#A0A0A0]">
                {dailyComplete}/{dailyChallenges.length} daily
                {weeklyChallenges.length > 0 && `, ${weeklyComplete}/${weeklyChallenges.length} weekly`}
              </span>
            </div>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#666666] transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* XP Bar */}
            <XPBar
              level={level}
              title={tierInfo.title}
              color={tierInfo.color}
              totalXP={totalXP}
              xpInLevel={xpInLevel}
              xpToNext={xpToNext}
              progress={progress}
              streakDays={streakDays}
              streakMultiplier={streakInfo.multiplier}
            />

            {/* Challenges */}
            {(dailyChallenges.length > 0 || weeklyChallenges.length > 0) && (
              <div className="px-4 py-3 space-y-3">
                {dailyChallenges.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-[#666666] uppercase tracking-[0.08em]">
                        Daily Challenges
                      </h3>
                      <span className="text-xs text-[#666666]">
                        {dailyComplete}/{dailyChallenges.length}
                      </span>
                    </div>
                    {dailyChallenges.map((c) => (
                      <DailyChallengeCardCompact
                        key={c.challengeId}
                        title={c.challenge.title}
                        icon={c.challenge.icon}
                        xpReward={c.challenge.xpReward}
                        requirement={c.challenge.requirement}
                        progress={c.progress}
                        isComplete={c.isComplete}
                      />
                    ))}
                  </div>
                )}

                {weeklyChallenges.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-[#666666] uppercase tracking-[0.08em]">
                        Weekly Challenges
                      </h3>
                      <span className="text-xs text-[#666666]">
                        {weeklyComplete}/{weeklyChallenges.length}
                      </span>
                    </div>
                    {weeklyChallenges.map((c) => (
                      <WeeklyChallengeCardCompact
                        key={c.challengeId}
                        title={c.challenge.title}
                        icon={c.challenge.icon}
                        xpReward={c.challenge.xpReward}
                        requirement={c.challenge.requirement}
                        progress={c.progress}
                        isComplete={c.isComplete}
                        daysRemaining={c.daysRemaining}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
