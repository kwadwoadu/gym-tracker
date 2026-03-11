"use client";

import { useState, useMemo, useCallback } from "react";
import type { MuscleVolume } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HEADING } from "@/lib/typography";
import { useWorkoutLogs, usePersonalRecords, useExercises, useAchievements, useStats, useMuscleVolume } from "@/lib/queries";
import type { Exercise, WorkoutLog, PersonalRecord } from "@/lib/api-client";
import { SummaryCards } from "@/components/stats/summary-cards";
import dynamic from "next/dynamic";
import { PRList } from "@/components/stats/pr-list";

const WeightChart = dynamic(() => import("@/components/stats/weight-chart").then(mod => ({ default: mod.WeightChart })), {
  ssr: false,
  loading: () => <div className="h-56 bg-card border-border rounded-lg animate-pulse" />,
});
import { WorkoutCalendar } from "@/components/stats/workout-calendar";
import { RecentWorkouts } from "@/components/stats/recent-workouts";
import { AchievementGallery } from "@/components/gamification";
import { WeeklyMuscleHeatmap } from "@/components/stats/WeeklyMuscleHeatmap";
import { PeriodSelector, type TimePeriod, getPeriodStart, filterByPeriod } from "@/components/stats/period-selector";
import { WinsBanner } from "@/components/stats/wins-banner";
import { MuscleDrillDown } from "@/components/stats/muscle-drill-down";
import { EmptyPeriodState } from "@/components/stats/empty-period-state";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { AchievementProgress } from "@/lib/gamification";
import { useQueryClient } from "@tanstack/react-query";

const PERIOD_LABELS: Record<TimePeriod, string> = {
  week: "Week",
  month: "Month",
  "3month": "3 Months",
  year: "Year",
  all: "All Time",
};

export default function StatsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // React Query hooks
  const { data: workoutLogs, isLoading: logsLoading } = useWorkoutLogs({ isComplete: true });
  const { data: personalRecords, isLoading: prsLoading } = usePersonalRecords();
  const { data: exercisesList, isLoading: exercisesLoading } = useExercises();
  const { data: unlockedAchievements, isLoading: achievementsLoading } = useAchievements();
  const { data: stats } = useStats();
  const { data: muscleVolumes, isLoading: muscleVolumeLoading } = useMuscleVolume();

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

  // Period-filtered data
  const filteredLogs = useMemo(() => {
    if (period === "all") return sortedLogs;
    return filterByPeriod(sortedLogs, period);
  }, [sortedLogs, period]);

  const filteredPRs = useMemo(() => {
    if (period === "all") return sortedPRs;
    return filterByPeriod(sortedPRs, period);
  }, [sortedPRs, period]);

  // Previous period data (for trend arrows)
  const previousPeriodLogs = useMemo(() => {
    if (period === "all") return [];
    const currentStart = getPeriodStart(period);
    const now = new Date();
    const periodMs = now.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - periodMs);
    return sortedLogs.filter((log) => {
      const d = new Date(log.date);
      return d >= prevStart && d < currentStart;
    });
  }, [sortedLogs, period]);

  const previousPeriodPRs = useMemo(() => {
    if (period === "all") return [];
    const currentStart = getPeriodStart(period);
    const now = new Date();
    const periodMs = now.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - periodMs);
    return sortedPRs.filter((pr) => {
      const d = new Date(pr.date);
      return d >= prevStart && d < currentStart;
    });
  }, [sortedPRs, period]);

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

  // Build exercise breakdown for selected muscle
  const exerciseBreakdowns = useMemo(() => {
    if (!selectedMuscle || !workoutLogs || !exercisesList) return [];

    const breakdownMap = new Map<string, { exerciseName: string; sets: number; volume: number }>();

    for (const log of workoutLogs) {
      if (!log.isComplete) continue;
      for (const set of log.sets) {
        if (!set.isComplete) continue;
        const exercise = exercises.get(set.exerciseId);
        if (!exercise) continue;

        // Check if exercise targets this muscle
        const muscleList = exercise.muscles
          ? [...exercise.muscles.primary, ...exercise.muscles.secondary]
          : exercise.muscleGroups;

        if (!muscleList.includes(selectedMuscle)) continue;

        const existing = breakdownMap.get(set.exerciseId);
        const setVolume = set.weight * set.actualReps;
        if (existing) {
          existing.sets += 1;
          existing.volume += setVolume;
        } else {
          breakdownMap.set(set.exerciseId, {
            exerciseName: set.exerciseName || exercise.name,
            sets: 1,
            volume: setVolume,
          });
        }
      }
    }

    return Array.from(breakdownMap.entries()).map(([exerciseId, data]) => ({
      exerciseId,
      ...data,
    }));
  }, [selectedMuscle, workoutLogs, exercisesList, exercises]);

  const isLoading = logsLoading || prsLoading || exercisesLoading || achievementsLoading || muscleVolumeLoading;

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
    <div className="min-h-screen pb-8 overflow-x-hidden">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
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
            <h1 className={`${HEADING.h3} text-foreground`}>Stats & Progress</h1>
            <p className="text-sm text-muted-foreground">
              {filteredLogs.length} workouts in {PERIOD_LABELS[period].toLowerCase()}
            </p>
          </div>
        </div>
      </header>

      {/* Period Selector */}
      <div className="px-4 py-3 sticky top-[72px] bg-background/95 backdrop-blur-sm z-10">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="p-4 space-y-6">
        {/* Empty state when no workouts in period */}
        {filteredLogs.length === 0 && (
          <EmptyPeriodState periodLabel={PERIOD_LABELS[period].toLowerCase()} />
        )}

        {filteredLogs.length > 0 && (
        <>
        {/* Wins Banner */}
        <WinsBanner personalRecords={filteredPRs as PersonalRecord[]} periodLabel={PERIOD_LABELS[period].toLowerCase()} />

        {/* Summary Cards */}
        <SummaryCards
          workoutLogs={filteredLogs as WorkoutLog[]}
          personalRecords={filteredPRs as PersonalRecord[]}
          previousWorkoutLogs={previousPeriodLogs as WorkoutLog[]}
          previousPersonalRecords={previousPeriodPRs as PersonalRecord[]}
        />

        {/* Weekly Muscle Coverage Heatmap */}
        {muscleVolumes && muscleVolumes.length > 0 && (
          <WeeklyMuscleHeatmap
            muscleVolumes={muscleVolumes}
            onMuscleClick={(muscle) => setSelectedMuscle(muscle)}
          />
        )}

        {/* Weight Progression Chart */}
        <WeightChart workoutLogs={filteredLogs as WorkoutLog[]} exercises={exercises} />

        {/* Achievements */}
        <section>
          <h2 className={`${HEADING.h3} text-foreground mb-4`}>Achievements</h2>
          <AchievementGallery progress={achievementProgress} stats={achievementStats} />
        </section>

        {/* Personal Records */}
        <PRList personalRecords={filteredPRs as PersonalRecord[]} />

        {/* Workout Calendar */}
        <WorkoutCalendar workoutLogs={sortedLogs as WorkoutLog[]} />

        {/* Recent Workouts */}
        <RecentWorkouts workoutLogs={filteredLogs as WorkoutLog[]} onSetEdited={handleSetEdited} />
        </>
        )}

        {/* Muscle Drill-Down Drawer */}
        {selectedMuscle && muscleVolumes && (
          <MuscleDrillDown
            muscleName={selectedMuscle}
            isOpen={!!selectedMuscle}
            onClose={() => setSelectedMuscle(null)}
            muscleVolumes={muscleVolumes as MuscleVolume[]}
            exerciseBreakdowns={exerciseBreakdowns}
          />
        )}
      </div>
    </div>
  );
}
