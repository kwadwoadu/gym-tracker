"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useWorkoutLogs, usePersonalRecords, useExercises, useAchievements, useStats } from "@/lib/queries";
import type { Exercise, WorkoutLog, PersonalRecord } from "@/lib/api-client";
import { SummaryCards } from "@/components/stats/summary-cards";
import { WeightChart } from "@/components/stats/weight-chart";
import { PRList } from "@/components/stats/pr-list";
import { WorkoutCalendar } from "@/components/stats/workout-calendar";
import { RecentWorkouts } from "@/components/stats/recent-workouts";
import { AchievementGallery } from "@/components/gamification";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { AchievementProgress } from "@/lib/gamification";
import { useQueryClient } from "@tanstack/react-query";

export default function StatsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: workoutLogs, isLoading: logsLoading } = useWorkoutLogs({ isComplete: true });
  const { data: personalRecords, isLoading: prsLoading } = usePersonalRecords();
  const { data: exercisesList, isLoading: exercisesLoading } = useExercises();
  const { data: unlockedAchievements, isLoading: achievementsLoading } = useAchievements();
  const { data: stats } = useStats();

  // Create exercise map for quick lookup
  const exercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercisesList?.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercisesList]);

  // Sort workout logs by date (most recent first)
  const sortedLogs = useMemo(() => {
    if (!workoutLogs) return [];
    return [...workoutLogs].sort((a, b) => b.date.localeCompare(a.date));
  }, [workoutLogs]);

  // Sort personal records by date (most recent first)
  const sortedPRs = useMemo(() => {
    if (!personalRecords) return [];
    return [...personalRecords].sort((a, b) => b.date.localeCompare(a.date));
  }, [personalRecords]);

  // Calculate achievement progress client-side
  const achievementProgress = useMemo((): AchievementProgress[] => {
    if (!stats || !unlockedAchievements) return [];

    const unlockedMap = new Map(unlockedAchievements.map(a => [a.achievementId, a.unlockedAt]));

    return ACHIEVEMENTS.map(achievement => {
      let currentValue = 0;

      switch (achievement.checkType) {
        case "streak":
          currentValue = stats.currentStreak;
          break;
        case "total_workouts":
          currentValue = stats.totalWorkouts;
          break;
        case "total_volume":
          currentValue = stats.totalVolume;
          break;
        case "total_prs":
          currentValue = stats.personalRecordsCount;
          break;
        default:
          currentValue = 0;
      }

      const isUnlocked = unlockedMap.has(achievement.id);
      const percentComplete = isUnlocked ? 100 : Math.min(100, Math.round((currentValue / achievement.requirement) * 100));

      return {
        achievement,
        currentValue,
        isUnlocked,
        unlockedAt: unlockedMap.get(achievement.id),
        percentComplete,
      };
    });
  }, [stats, unlockedAchievements]);

  // Calculate achievement stats
  const achievementStats = useMemo(() => {
    if (!unlockedAchievements) {
      return {
        totalAchievements: ACHIEVEMENTS.length,
        unlockedCount: 0,
        bronzeCount: 0,
        silverCount: 0,
        goldCount: 0,
      };
    }

    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
    let bronzeCount = 0;
    let silverCount = 0;
    let goldCount = 0;

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) {
        switch (achievement.tier) {
          case "bronze":
            bronzeCount++;
            break;
          case "silver":
            silverCount++;
            break;
          case "gold":
            goldCount++;
            break;
        }
      }
    }

    return {
      totalAchievements: ACHIEVEMENTS.length,
      unlockedCount: unlockedAchievements.length,
      bronzeCount,
      silverCount,
      goldCount,
    };
  }, [unlockedAchievements]);

  // Callback when a set is edited in RecentWorkouts
  const handleSetEdited = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["personal-records"] });
  }, [queryClient]);

  const isLoading = logsLoading || prsLoading || exercisesLoading || achievementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Stats & Progress</h1>
            <p className="text-sm text-muted-foreground">
              {sortedLogs.length} workouts completed
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <SummaryCards
          workoutLogs={sortedLogs as WorkoutLog[]}
          personalRecords={sortedPRs as PersonalRecord[]}
        />

        {/* Weight Progression Chart */}
        <WeightChart workoutLogs={sortedLogs as WorkoutLog[]} exercises={exercises} />

        {/* Achievements */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Achievements</h2>
          <AchievementGallery progress={achievementProgress} stats={achievementStats} />
        </section>

        {/* Personal Records */}
        <PRList personalRecords={sortedPRs as PersonalRecord[]} />

        {/* Workout Calendar */}
        <WorkoutCalendar workoutLogs={sortedLogs as WorkoutLog[]} />

        {/* Recent Workouts */}
        <RecentWorkouts workoutLogs={sortedLogs as WorkoutLog[]} onSetEdited={handleSetEdited} />
      </div>
    </div>
  );
}
