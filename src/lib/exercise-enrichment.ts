/**
 * Exercise Enrichment
 *
 * Enriches exercise data from the database with muscles information
 * from the static exercises.json file. This ensures the muscles field
 * is always populated without requiring database backfills.
 */

import exercisesData from "@/data/exercises.json";

// Type for muscles data
interface MusclesData {
  primary: string[];
  secondary: string[];
}

// Build lookup map from exercise ID (builtInId) -> muscles
const musclesMap = new Map<string, MusclesData>();

for (const ex of exercisesData.exercises) {
  const exerciseWithMuscles = ex as typeof ex & { muscles?: MusclesData };
  if (exerciseWithMuscles.muscles) {
    musclesMap.set(ex.id, exerciseWithMuscles.muscles);
  }
}

/**
 * Enriches a single exercise with muscles data from exercises.json
 * if it doesn't already have muscles populated.
 */
export function enrichExerciseWithMuscles<
  T extends { builtInId?: string | null; muscles?: unknown }
>(exercise: T): T & { muscles?: MusclesData | null } {
  // If already has muscles, return as-is
  if (exercise.muscles) return exercise as T & { muscles?: MusclesData | null };

  // Look up by builtInId
  if (exercise.builtInId) {
    const muscles = musclesMap.get(exercise.builtInId);
    if (muscles) {
      return { ...exercise, muscles };
    }
  }

  return exercise as T & { muscles?: MusclesData | null };
}

/**
 * Enriches an array of exercises with muscles data.
 */
export function enrichExercisesWithMuscles<
  T extends { builtInId?: string | null; muscles?: unknown }
>(exercises: T[]): (T & { muscles?: MusclesData | null })[] {
  return exercises.map(enrichExerciseWithMuscles);
}
