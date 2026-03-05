/**
 * Dashboard state machine - determines which home page view to show
 */

import type { TrainingDay, WorkoutLog } from "@/lib/api-client";

export type DashboardState = "morning" | "pre-workout" | "post-workout" | "rest-day";

export interface DashboardContext {
  state: DashboardState;
  lastCompletedWorkout: WorkoutLog | null;
  streakAtRisk: boolean;
}

export function determineDashboardState(
  currentHour: number,
  todayWorkout: TrainingDay | null,
  recentLogs: WorkoutLog[],
  currentStreak: number
): DashboardContext {
  // Check if workout was completed in last 2 hours
  const now = Date.now();
  const lastCompleted = recentLogs.find((log) => {
    if (!log.isComplete) return false;
    const logDate = new Date(log.date);
    const today = new Date();
    return (
      logDate.getFullYear() === today.getFullYear() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getDate() === today.getDate()
    );
  });

  const recentCompletion = recentLogs.find((log) => {
    if (!log.isComplete || !log.endTime) return false;
    const hoursAgo = (now - new Date(log.endTime).getTime()) / (1000 * 60 * 60);
    return hoursAgo < 2;
  });

  // Streak is at risk if user has a streak but hasn't trained today
  const streakAtRisk = currentStreak > 0 && !lastCompleted;

  if (recentCompletion) {
    return {
      state: "post-workout",
      lastCompletedWorkout: recentCompletion,
      streakAtRisk: false,
    };
  }

  // Rest day: no workout planned today
  if (!todayWorkout) {
    return {
      state: "rest-day",
      lastCompletedWorkout: null,
      streakAtRisk,
    };
  }

  // Morning (5:00 - 10:00) on training day
  if (currentHour >= 5 && currentHour < 10) {
    return {
      state: "morning",
      lastCompletedWorkout: null,
      streakAtRisk,
    };
  }

  // After 10am on training days with no recent completion: pre-workout
  return {
    state: "pre-workout",
    lastCompletedWorkout: null,
    streakAtRisk,
  };
}

// State display config
export const DASHBOARD_CONFIG: Record<
  DashboardState,
  { icon: string; label: string; color: string }
> = {
  morning: { icon: "Sun", label: "Good morning", color: "#CDFF00" },
  "pre-workout": { icon: "Flame", label: "Ready to train", color: "#FF6B35" },
  "post-workout": { icon: "Trophy", label: "Session complete", color: "#00D4AA" },
  "rest-day": { icon: "Moon", label: "Recovery day", color: "#7B8CDE" },
};
