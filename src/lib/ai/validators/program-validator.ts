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
 * Validate AI output and filter to only known exercise IDs
 */
export function validateProgram(
  data: unknown,
  validExerciseIds: Set<string>
): { success: true; data: GeneratedProgram } | { success: false; error: string } {
  const result = GeneratedProgramSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((i) => i.message).join(", ") };
  }

  const program = result.data;

  // Check that exercise IDs exist in the database
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
    // If more than 20% are unknown, reject
    if (unknownIds.length / totalExercises > 0.2) {
      return {
        success: false,
        error: `Too many unknown exercises (${unknownIds.length}/${totalExercises}): ${unknownIds.slice(0, 5).join(", ")}`,
      };
    }
  }

  // Check per-session volume (max 25 working sets)
  for (const day of program.days) {
    const totalSets = day.supersets.reduce(
      (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets, 0),
      0
    );
    if (totalSets > 30) {
      return {
        success: false,
        error: `Day "${day.name}" has ${totalSets} working sets (max 30)`,
      };
    }
  }

  return { success: true, data: program };
}
