/**
 * Zod schemas for validating AI-generated program output
 */

import { z } from "zod";

export const GeneratedExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().min(1).max(10),
  reps: z.string(), // "8-10" or "12"
  tempo: z.string().optional(),
  restSeconds: z.number().min(30).max(300),
  notes: z.string().optional(),
});

export const GeneratedSupersetSchema = z.object({
  label: z.string(),
  exercises: z.array(GeneratedExerciseSchema).min(1).max(4),
});

export const GeneratedTrainingDaySchema = z.object({
  name: z.string(),
  supersets: z.array(GeneratedSupersetSchema).min(1).max(8),
  warmup: z.array(GeneratedExerciseSchema).optional(),
  finisher: z.array(GeneratedExerciseSchema).optional(),
});

export const GeneratedProgramSchema = z.object({
  name: z.string(),
  description: z.string(),
  durationWeeks: z.number().min(4).max(12),
  daysPerWeek: z.number().min(2).max(6),
  days: z.array(GeneratedTrainingDaySchema).min(2).max(6),
  deloadWeek: z.number().optional(),
  progressionStrategy: z.string(),
});

export type GeneratedProgram = z.infer<typeof GeneratedProgramSchema>;
export type GeneratedTrainingDay = z.infer<typeof GeneratedTrainingDaySchema>;
export type GeneratedExercise = z.infer<typeof GeneratedExerciseSchema>;

/**
 * Exercise reference for substitution matching
 */
interface ExerciseRef {
  id: string;
  name: string;
  equipment: string;
  muscleGroups: string[];
}

/**
 * Find the closest matching exercise from the database for an unknown ID.
 * Scoring: +2 per shared muscle group, +1 for matching equipment.
 */
function findClosestExercise(
  unknownId: string,
  exerciseDb: ExerciseRef[],
  usedIds: Set<string>
): string | null {
  if (exerciseDb.length === 0) return null;

  // Try to infer muscle groups and equipment from the unknown ID string
  const idLower = unknownId.toLowerCase();

  let bestMatch: ExerciseRef | null = null;
  let bestScore = -1;

  for (const candidate of exerciseDb) {
    // Skip exercises already used in the program to avoid duplicates
    if (usedIds.has(candidate.id)) continue;

    let score = 0;

    // Check if the unknown ID contains keywords matching the candidate name
    const nameParts = candidate.name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 3 && idLower.includes(part)) {
        score += 3; // Strong name match
      }
    }

    // Check if the unknown ID hints at equipment
    if (idLower.includes(candidate.equipment.toLowerCase())) {
      score += 1;
    }

    // Check muscle group keywords in the ID
    for (const mg of candidate.muscleGroups) {
      if (idLower.includes(mg.toLowerCase())) {
        score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  // Only substitute if we have at least some confidence (score > 0)
  return bestScore > 0 && bestMatch ? bestMatch.id : null;
}

/**
 * Collect all exercise IDs used in a program (for dedup during substitution)
 */
function collectUsedIds(program: GeneratedProgram): Set<string> {
  const used = new Set<string>();
  for (const day of program.days) {
    for (const ss of day.supersets) {
      for (const ex of ss.exercises) used.add(ex.exerciseId);
    }
    for (const ex of day.warmup || []) used.add(ex.exerciseId);
    for (const ex of day.finisher || []) used.add(ex.exerciseId);
  }
  return used;
}

/** Max working sets per session (excluding warmup/finisher) */
const MAX_SETS_PER_SESSION = 30;

/**
 * Validate AI output, substitute unknown exercises, and enforce volume caps.
 *
 * @param data - Raw AI response
 * @param validExerciseIds - Set of known exercise IDs
 * @param exerciseDb - Full exercise database for substitution matching (optional)
 */
export function validateProgram(
  data: unknown,
  validExerciseIds: Set<string>,
  exerciseDb?: ExerciseRef[]
): { success: true; data: GeneratedProgram; substitutions: Record<string, string> } | { success: false; error: string } {
  const result = GeneratedProgramSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((i) => i.message).join(", ") };
  }

  const program = result.data;
  const substitutions: Record<string, string> = {};

  // Attempt to substitute unknown exercise IDs with closest matches
  if (exerciseDb && exerciseDb.length > 0) {
    const usedIds = collectUsedIds(program);

    const substituteExercise = (ex: GeneratedExercise) => {
      if (!validExerciseIds.has(ex.exerciseId)) {
        const match = findClosestExercise(ex.exerciseId, exerciseDb, usedIds);
        if (match) {
          substitutions[ex.exerciseId] = match;
          usedIds.add(match);
          ex.exerciseId = match;
        }
      }
    };

    for (const day of program.days) {
      for (const superset of day.supersets) {
        for (const ex of superset.exercises) substituteExercise(ex);
      }
      for (const ex of day.warmup || []) substituteExercise(ex);
      for (const ex of day.finisher || []) substituteExercise(ex);
    }
  }

  // Check remaining unknown exercise IDs after substitution
  const unknownIds: string[] = [];
  for (const day of program.days) {
    for (const superset of day.supersets) {
      for (const ex of superset.exercises) {
        if (!validExerciseIds.has(ex.exerciseId)) {
          unknownIds.push(ex.exerciseId);
        }
      }
    }
    for (const ex of day.warmup || []) {
      if (!validExerciseIds.has(ex.exerciseId)) {
        unknownIds.push(ex.exerciseId);
      }
    }
    for (const ex of day.finisher || []) {
      if (!validExerciseIds.has(ex.exerciseId)) {
        unknownIds.push(ex.exerciseId);
      }
    }
  }

  if (unknownIds.length > 0) {
    const totalExercises = program.days.reduce(
      (acc, d) =>
        acc +
        d.supersets.reduce((a, s) => a + s.exercises.length, 0) +
        (d.warmup?.length || 0) +
        (d.finisher?.length || 0),
      0
    );
    // If more than 20% are still unknown after substitution, reject
    if (unknownIds.length / totalExercises > 0.2) {
      return {
        success: false,
        error: `Too many unknown exercises (${unknownIds.length}/${totalExercises}): ${unknownIds.slice(0, 5).join(", ")}`,
      };
    }
  }

  // Validate sets/reps ranges
  for (const day of program.days) {
    for (const superset of day.supersets) {
      for (const ex of superset.exercises) {
        // Parse rep range and validate
        const repParts = ex.reps.split("-").map((r) => parseInt(r.trim()));
        const maxRep = repParts[repParts.length - 1];
        if (!isNaN(maxRep) && maxRep > 100) {
          return {
            success: false,
            error: `Unrealistic rep count (${ex.reps}) for exercise ${ex.exerciseId}`,
          };
        }
      }
    }
  }

  // Check per-session volume (max working sets, excluding warmup/finisher)
  for (const day of program.days) {
    const totalSets = day.supersets.reduce(
      (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets, 0),
      0
    );
    if (totalSets > MAX_SETS_PER_SESSION) {
      return {
        success: false,
        error: `Day "${day.name}" has ${totalSets} working sets (max ${MAX_SETS_PER_SESSION})`,
      };
    }
  }

  return { success: true, data: program, substitutions };
}
