/**
 * Muscle recovery estimation engine
 * Estimates recovery time per muscle group based on volume and time elapsed
 */

import type { WorkoutLog, SetLog, Exercise } from "@/lib/db";

export interface MuscleRecoveryEstimate {
  muscleGroup: string;
  totalVolume: number;
  recoveryHoursTotal: number;
  hoursElapsed: number;
  hoursRemaining: number;
  percentRecovered: number;
  status: "fatigued" | "recovering" | "recovered";
}

const BASE_RECOVERY_HOURS: Record<string, number> = {
  quads: 48,
  hamstrings: 48,
  glutes: 36,
  chest: 48,
  back: 48,
  shoulders: 36,
  biceps: 24,
  triceps: 24,
  calves: 24,
  core: 24,
};

export function estimateMuscleRecovery(
  workoutLog: WorkoutLog,
  exerciseMap: Map<string, Exercise>,
  now: Date = new Date()
): MuscleRecoveryEstimate[] {
  const workoutEnd = workoutLog.endTime
    ? new Date(workoutLog.endTime)
    : new Date(workoutLog.startTime);
  const hoursElapsed =
    (now.getTime() - workoutEnd.getTime()) / (1000 * 60 * 60);

  // Group volume by muscle
  const muscleVolume = new Map<string, number>();

  for (const setLog of workoutLog.sets as SetLog[]) {
    if (!setLog.isComplete) continue;
    const exercise = exerciseMap.get(setLog.exerciseId);
    if (!exercise) continue;

    const volume = setLog.weight * setLog.actualReps;
    for (const muscle of exercise.muscleGroups) {
      muscleVolume.set(muscle, (muscleVolume.get(muscle) || 0) + volume);
    }
  }

  const estimates: MuscleRecoveryEstimate[] = [];

  for (const [muscle, volume] of muscleVolume) {
    const baseHours = BASE_RECOVERY_HOURS[muscle] || 36;

    // Scale recovery time by volume intensity (higher volume = longer, up to 1.5x)
    const volumeMultiplier = Math.min(1.5, 1 + (volume / 10000) * 0.5);
    const totalHours = Math.round(baseHours * volumeMultiplier);

    const hoursRemaining = Math.max(0, totalHours - hoursElapsed);
    const percentRecovered = Math.min(
      100,
      Math.round((hoursElapsed / totalHours) * 100)
    );

    let status: MuscleRecoveryEstimate["status"];
    if (percentRecovered >= 100) status = "recovered";
    else if (percentRecovered >= 50) status = "recovering";
    else status = "fatigued";

    estimates.push({
      muscleGroup: muscle,
      totalVolume: Math.round(volume),
      recoveryHoursTotal: totalHours,
      hoursElapsed: Math.round(hoursElapsed),
      hoursRemaining: Math.round(hoursRemaining),
      percentRecovered,
      status,
    });
  }

  // Sort: least recovered first
  return estimates.sort((a, b) => a.percentRecovered - b.percentRecovered);
}
