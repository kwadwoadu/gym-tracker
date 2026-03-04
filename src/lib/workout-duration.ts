import type { TrainingDay } from "./api-client";

interface Superset {
  id: string;
  label: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: string;
    tempo?: string;
    restSeconds?: number;
  }>;
}

/**
 * Estimate workout duration in minutes based on exercise count,
 * sets, and rest periods.
 */
export function estimateWorkoutDuration(day: TrainingDay): number {
  const warmup = day.warmup as Array<{ exerciseId: string; reps: number }> | undefined;
  const supersets = day.supersets as Superset[];
  const finisher = day.finisher as Array<{ exerciseId: string; duration: number }> | undefined;

  const warmupMinutes = (warmup?.length || 0) * 1.5;

  const exerciseMinutes = supersets.reduce((total, ss) => {
    return (
      total +
      ss.exercises.reduce((exTotal, ex) => {
        const setTime = ex.sets * 1.5; // ~90s per set
        const restTime = ex.sets * ((ex.restSeconds || 90) / 60);
        return exTotal + setTime + restTime;
      }, 0)
    );
  }, 0);

  const finisherMinutes = (finisher?.length || 0) * 3;

  return Math.round(warmupMinutes + exerciseMinutes + finisherMinutes);
}

/**
 * Count total exercises in a training day.
 */
export function countExercises(day: TrainingDay): number {
  const supersets = day.supersets as Superset[];
  return supersets.reduce((acc, ss) => acc + ss.exercises.length, 0);
}

/**
 * Count total supersets in a training day.
 */
export function countSupersets(day: TrainingDay): number {
  const supersets = day.supersets as Superset[];
  return supersets.length;
}
