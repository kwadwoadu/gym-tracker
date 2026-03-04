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

export interface RecoveryScore {
  overall: number; // 0-100
  label: "Not Ready" | "Partially Recovered" | "Ready to Train" | "Fully Recovered";
  color: string;
  fatigueCount: number;
  recoveringCount: number;
  recoveredCount: number;
}

/**
 * Calculate an overall recovery score from muscle estimates.
 */
export function calculateRecoveryScore(estimates: MuscleRecoveryEstimate[]): RecoveryScore {
  if (estimates.length === 0) {
    return { overall: 100, label: "Fully Recovered", color: "#22C55E", fatigueCount: 0, recoveringCount: 0, recoveredCount: 0 };
  }

  const avgPercent = Math.round(estimates.reduce((s, e) => s + e.percentRecovered, 0) / estimates.length);
  const fatigueCount = estimates.filter((e) => e.status === "fatigued").length;
  const recoveringCount = estimates.filter((e) => e.status === "recovering").length;
  const recoveredCount = estimates.filter((e) => e.status === "recovered").length;

  let label: RecoveryScore["label"];
  let color: string;

  if (avgPercent >= 90) {
    label = "Fully Recovered";
    color = "#22C55E";
  } else if (avgPercent >= 70) {
    label = "Ready to Train";
    color = "#CDFF00";
  } else if (avgPercent >= 40) {
    label = "Partially Recovered";
    color = "#F59E0B";
  } else {
    label = "Not Ready";
    color = "#EF4444";
  }

  return { overall: avgPercent, label, color, fatigueCount, recoveringCount, recoveredCount };
}
