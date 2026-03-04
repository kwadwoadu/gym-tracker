import type { TrainingDay, WorkoutLog } from "./api-client";

/**
 * Determine the next training day based on workout history.
 * Returns the day after the last completed workout (wrapping around).
 * Falls back to the first day if no history exists.
 */
export function getNextTrainingDay(
  sortedDays: TrainingDay[],
  workoutLogs: WorkoutLog[]
): TrainingDay | null {
  if (!sortedDays.length) return null;

  // Find last completed workout
  const lastLog = workoutLogs
    .filter((l) => l.isComplete)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!lastLog) return sortedDays[0];

  // Find which day was last completed
  const lastDayIndex = sortedDays.findIndex((d) => d.id === lastLog.dayId);
  if (lastDayIndex === -1) return sortedDays[0];

  // Return next day in sequence (wrap around)
  const nextIndex = (lastDayIndex + 1) % sortedDays.length;
  return sortedDays[nextIndex];
}
