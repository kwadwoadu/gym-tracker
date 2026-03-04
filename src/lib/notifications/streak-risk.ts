import { getWorkoutStreak } from "@/lib/db";

export interface StreakRiskResult {
  atRisk: boolean;
  currentStreak: number;
  lastWorkoutDate: string;
  hoursUntilBreak: number;
}

const STREAK_BREAK_HOURS = 48;

/**
 * Check if the user's workout streak is at risk of breaking.
 * A streak breaks if no workout is logged within 48 hours of the last workout.
 */
export async function checkStreakRisk(): Promise<StreakRiskResult> {
  const streakData = await getWorkoutStreak();

  if (!streakData.lastWorkoutDate || streakData.currentStreak === 0) {
    return {
      atRisk: false,
      currentStreak: 0,
      lastWorkoutDate: "",
      hoursUntilBreak: 0,
    };
  }

  const lastWorkout = new Date(streakData.lastWorkoutDate);
  const now = new Date();
  const hoursSinceLastWorkout =
    (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

  const hoursUntilBreak = Math.max(
    0,
    STREAK_BREAK_HOURS - hoursSinceLastWorkout
  );

  // At risk if less than 12 hours remain before the streak breaks
  const atRisk = hoursUntilBreak > 0 && hoursUntilBreak <= 12;

  return {
    atRisk,
    currentStreak: streakData.currentStreak,
    lastWorkoutDate: streakData.lastWorkoutDate,
    hoursUntilBreak: Math.round(hoursUntilBreak * 10) / 10,
  };
}
