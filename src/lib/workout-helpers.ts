/**
 * Workout helper functions - client-side utilities that use the API
 * Replaces Dexie-based helper functions from db.ts
 */

import { workoutLogsApi, settingsApi, personalRecordsApi, type WorkoutLog, type SetLog, type UserSettings, type PersonalRecord } from "./api-client";

// Cache for settings to avoid repeated API calls
let cachedSettings: UserSettings | null = null;

export async function getUserSettings(): Promise<UserSettings> {
  if (cachedSettings) return cachedSettings;
  cachedSettings = await settingsApi.get();
  return cachedSettings;
}

export function clearSettingsCache() {
  cachedSettings = null;
}

/**
 * Get the last workout for a specific training day
 */
export async function getLastWorkoutForDay(dayId: string): Promise<WorkoutLog | null> {
  const logs = await workoutLogsApi.list({
    dayId,
    isComplete: true,
    limit: 1,
  });
  return logs[0] || null;
}

/**
 * Get suggested weight based on last week's performance
 */
export async function getSuggestedWeight(
  exerciseId: string,
  dayId: string,
  setNumber: number
): Promise<{ weight: number; lastWeekWeight: number; lastWeekReps: number } | null> {
  const lastWorkout = await getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;

  const lastSet = lastWorkout.sets.find(
    (s: SetLog) => s.exerciseId === exerciseId && s.setNumber === setNumber
  );
  if (!lastSet) return null;

  const settings = await getUserSettings();
  const targetRepsHit = lastSet.actualReps >= (lastSet.targetReps || 0);

  // If they hit all reps last time, suggest weight increase
  const suggestedWeight = targetRepsHit
    ? lastSet.weight + settings.progressionIncrement
    : lastSet.weight;

  return {
    weight: suggestedWeight,
    lastWeekWeight: lastSet.weight,
    lastWeekReps: lastSet.actualReps,
  };
}

/**
 * Get global weight suggestion for an exercise (across all workouts)
 * Returns weight, reps, and RPE from last workout for smart memory
 */
export async function getGlobalWeightSuggestion(
  exerciseId: string
): Promise<{
  suggestedWeight: number;
  lastWeight: number;
  lastReps: number;
  lastRpe: number;
  suggestedReps: number;
  suggestedRpe: number;
  lastDate: string;
  hitTargetLastTime: boolean;
  shouldNudgeIncrease: boolean;
  nudgeWeight: number | null;
} | null> {
  // Get recent workout logs to find last usage of this exercise
  const logs = await workoutLogsApi.list({
    isComplete: true,
    limit: 50,
  });

  // Find the most recent set for this exercise
  for (const log of logs) {
    const exerciseSets = log.sets.filter((s: SetLog) => s.exerciseId === exerciseId);
    if (exerciseSets.length > 0) {
      // Get the best set (highest weight) for weight suggestion
      const bestSet = exerciseSets.reduce((best: SetLog, set: SetLog) =>
        set.weight > best.weight ? set : best
      );

      // Get the most recent set (last logged) for reps/RPE memory
      const lastSet = exerciseSets[exerciseSets.length - 1];
      const lastRpe = lastSet.rpe ?? 7;

      const settings = await getUserSettings();
      const hitTarget = bestSet.actualReps >= (bestSet.targetReps || 0);
      // Only suggest weight increase if user has capacity (RPE < 9)
      const shouldNudge = hitTarget && settings.autoProgressWeight && lastRpe < 9;
      const nudgeWeight = shouldNudge
        ? bestSet.weight + settings.progressionIncrement
        : null;

      return {
        suggestedWeight: bestSet.weight,
        lastWeight: bestSet.weight,
        lastReps: bestSet.actualReps,
        lastRpe: lastRpe,
        suggestedReps: lastSet.actualReps,
        suggestedRpe: lastRpe,
        lastDate: log.date,
        hitTargetLastTime: hitTarget,
        shouldNudgeIncrease: shouldNudge,
        nudgeWeight,
      };
    }
  }

  return null;
}

/**
 * Calculate total volume from sets
 */
export function calculateTotalVolume(sets: SetLog[]): number {
  return sets.reduce((total, set) => {
    return total + set.weight * set.actualReps;
  }, 0);
}

/**
 * Get last week's volume for a training day
 */
export async function getLastWeekVolume(dayId: string): Promise<number | null> {
  const lastWorkout = await getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;
  return calculateTotalVolume(lastWorkout.sets);
}

/**
 * Check if a set is a new personal record and add it if so
 */
export async function checkAndAddPR(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number
): Promise<boolean> {
  // Get existing PRs for this exercise
  const existingPRs = await personalRecordsApi.list();
  const exercisePRs = existingPRs.filter((pr) => pr.exerciseId === exerciseId);

  // Check if this is a new PR (higher weight or more reps at same weight)
  const isNewPR = exercisePRs.every((pr) => {
    if (weight > pr.weight) return true;
    if (weight === pr.weight && reps > pr.reps) return true;
    return false;
  });

  if (isNewPR || exercisePRs.length === 0) {
    // Add new PR
    await personalRecordsApi.create({
      exerciseId,
      exerciseName,
      weight,
      reps,
      date: new Date().toISOString().split('T')[0],
    });
    return true;
  }

  return false;
}

/**
 * Update a workout log
 */
export async function updateWorkoutLog(
  workoutLogId: string,
  updates: Partial<WorkoutLog>
): Promise<WorkoutLog> {
  return workoutLogsApi.update(workoutLogId, updates);
}
