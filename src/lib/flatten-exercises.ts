/**
 * Flatten supersets into a linear exercise list for carousel navigation
 */

import type { Superset, SupersetExercise } from "@/lib/api-client";

export interface FlatExercise {
  exerciseId: string;
  supersetId: string;
  supersetLabel: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
  indexInSuperset: number;
  supersetSize: number;
  globalIndex: number;
}

export function flattenSupersets(supersets: Superset[]): FlatExercise[] {
  let globalIndex = 0;
  return supersets.flatMap((ss) =>
    ss.exercises.map((ex: SupersetExercise, i: number) => ({
      exerciseId: ex.exerciseId,
      supersetId: ss.id,
      supersetLabel: ss.label,
      sets: ex.sets,
      reps: ex.reps,
      tempo: ex.tempo,
      restSeconds: ex.restSeconds,
      indexInSuperset: i,
      supersetSize: ss.exercises.length,
      globalIndex: globalIndex++,
    }))
  );
}

/**
 * Convert a flat exercise index back to superset/exercise indices
 */
export function toWorkoutState(
  flatIndex: number,
  flatExercises: FlatExercise[]
): { supersetIndex: number; exerciseIndex: number } {
  const flat = flatExercises[flatIndex];
  if (!flat) return { supersetIndex: 0, exerciseIndex: 0 };

  // Find which superset this belongs to by counting unique supersetIds
  let supersetIndex = 0;
  let lastSsId = "";
  for (let i = 0; i <= flatIndex; i++) {
    if (flatExercises[i].supersetId !== lastSsId) {
      if (lastSsId !== "") supersetIndex++;
      lastSsId = flatExercises[i].supersetId;
    }
  }

  return {
    supersetIndex,
    exerciseIndex: flat.indexInSuperset,
  };
}
