/**
 * Exercise substitution engine.
 * Finds muscle-matched alternatives based on exercise database.
 */

import type { Exercise } from "@/lib/api-client";

export interface SubstitutionResult {
  exercise: Exercise;
  matchScore: number; // 0-100
  reason: string;
}

/**
 * Find substitute exercises matching the same muscle groups.
 */
export function findSubstitutions(
  currentExercise: Exercise,
  allExercises: Exercise[],
  maxResults: number = 3
): SubstitutionResult[] {
  const primaryMuscles = new Set(currentExercise.muscleGroups);

  return allExercises
    .filter((ex) => ex.id !== currentExercise.id)
    .map((ex) => {
      const exMuscles = new Set(ex.muscleGroups);
      const overlap = [...primaryMuscles].filter((m) => exMuscles.has(m)).length;
      const total = new Set([...primaryMuscles, ...exMuscles]).size;
      const matchScore = total > 0 ? Math.round((overlap / total) * 100) : 0;

      // Bonus for same equipment type
      const sameEquipment = ex.equipment === currentExercise.equipment ? 5 : 0;

      return {
        exercise: ex,
        matchScore: Math.min(100, matchScore + sameEquipment),
        reason: overlap === primaryMuscles.size
          ? "Same primary muscle groups"
          : `${overlap}/${primaryMuscles.size} muscle groups match`,
      };
    })
    .filter((r) => r.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
}
