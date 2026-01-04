import {
  exercisesApi,
  programsApi,
  workoutLogsApi,
  personalRecordsApi,
  settingsApi,
} from "./api-client";
import exercisesData from "@/data/exercises.json";
import programData from "@/data/program.json";

// Type definitions for program data
interface WarmupExercise {
  exerciseId: string;
  reps?: number;
}

interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
}

interface Superset {
  id: string;
  label: string;
  exercises: SupersetExercise[];
}

interface FinisherExercise {
  exerciseId: string;
  duration?: number;
  reps?: number;
  notes?: string;
}

/**
 * Seeds exercises and returns the ID mapping from old IDs to new Prisma CUIDs.
 */
async function seedExercisesWithMapping(): Promise<Map<string, string>> {
  const idMapping = new Map<string, string>();

  console.log("Seeding exercises with ID mapping...");
  for (const ex of exercisesData.exercises) {
    const created = await exercisesApi.create({
      name: ex.name,
      muscleGroups: ex.muscleGroups,
      equipment: ex.equipment,
      videoUrl: null,
      builtInId: ex.id, // Store the original preset ID for reliable mapping
    });
    // Map old ID (e.g., "ex-bw-squats") to new Prisma CUID
    idMapping.set(ex.id, created.id);
  }
  console.log(`Seeded ${exercisesData.exercises.length} exercises with ID mapping`);

  return idMapping;
}

/**
 * Maps exercise IDs in program data from old string IDs to new Prisma CUIDs.
 */
function mapProgramExerciseIds(
  idMapping: Map<string, string>,
  trainingDays: typeof programData.trainingDays
) {
  return trainingDays.map((day) => ({
    name: day.name,
    dayNumber: day.dayNumber,
    warmup: (day.warmup || []).map((w: WarmupExercise) => ({
      ...w,
      exerciseId: idMapping.get(w.exerciseId) || w.exerciseId,
    })),
    supersets: (day.supersets || []).map((ss: Superset) => ({
      ...ss,
      exercises: ss.exercises.map((ex: SupersetExercise) => ({
        ...ex,
        exerciseId: idMapping.get(ex.exerciseId) || ex.exerciseId,
      })),
    })),
    finisher: (day.finisher || []).map((f: FinisherExercise) => ({
      ...f,
      exerciseId: idMapping.get(f.exerciseId) || f.exerciseId,
    })),
  }));
}

/**
 * Seeds only exercises and user settings (not the program).
 * Used when user selects their own program during onboarding.
 * Returns the ID mapping for use with program seeding.
 */
export async function seedExercisesOnly(): Promise<Map<string, string>> {
  // Check if exercises already seeded
  const existingExercises = await exercisesApi.list();
  if (existingExercises.length > 0) {
    console.log("Exercises already seeded, building mapping from existing...");
    // Build mapping from existing exercises by builtInId (reliable) or name (fallback)
    const idMapping = new Map<string, string>();
    for (const ex of exercisesData.exercises) {
      // First try to match by builtInId (reliable)
      let existing = existingExercises.find(e => e.builtInId === ex.id);
      // Fallback to name matching for legacy data
      if (!existing) {
        existing = existingExercises.find(e => e.name === ex.name);
      }
      if (existing) {
        idMapping.set(ex.id, existing.id);
      }
    }
    return idMapping;
  }

  const idMapping = await seedExercisesWithMapping();

  // Seed default user settings if not exists
  try {
    await settingsApi.get();
    console.log("User settings already exist");
  } catch {
    // Settings don't exist, they'll be created on first access
    console.log("User settings will be created on first access");
  }

  return idMapping;
}

/**
 * Seeds the full database including the default program with proper ID mapping.
 * Used for legacy compatibility - new users go through onboarding.
 */
export async function seedDatabase(): Promise<void> {
  // Check if already seeded
  const existingExercises = await exercisesApi.list();
  const existingPrograms = await programsApi.list();

  let idMapping: Map<string, string>;

  if (existingExercises.length > 0) {
    console.log("Exercises already seeded, building mapping from existing...");
    // Build mapping from existing exercises by builtInId (reliable) or name (fallback)
    idMapping = new Map<string, string>();
    for (const ex of exercisesData.exercises) {
      // First try to match by builtInId (reliable)
      let existing = existingExercises.find(e => e.builtInId === ex.id);
      // Fallback to name matching for legacy data
      if (!existing) {
        existing = existingExercises.find(e => e.name === ex.name);
      }
      if (existing) {
        idMapping.set(ex.id, existing.id);
      }
    }
  } else {
    // Seed exercises with mapping
    idMapping = await seedExercisesWithMapping();
  }

  // Delete existing programs and recreate with correct IDs
  if (existingPrograms.length > 0) {
    console.log("Deleting existing programs to recreate with correct IDs...");
    for (const prog of existingPrograms) {
      await programsApi.delete(prog.id);
    }
  }

  // Seed program with properly mapped exercise IDs
  const program = programData.program;
  const mappedTrainingDays = mapProgramExerciseIds(idMapping, programData.trainingDays);

  await programsApi.create({
    name: program.name,
    description: program.description,
    isActive: program.isActive,
    trainingDays: mappedTrainingDays,
  });
  console.log("Seeded program:", program.name);
  console.log(`Seeded ${programData.trainingDays.length} training days with mapped exercise IDs`);

  console.log("Database seeding complete!");
}

/**
 * Re-seeds the program with correct ID mappings.
 * Use this to fix existing users who have the old string IDs in their program.
 */
export async function fixProgramExerciseIds(): Promise<void> {
  console.log("Fixing program exercise IDs...");

  // Get existing exercises and build mapping
  const existingExercises = await exercisesApi.list();
  if (existingExercises.length === 0) {
    console.log("No exercises found, seeding first...");
    await seedDatabase();
    return;
  }

  // Build mapping from existing exercises by builtInId (reliable) or name (fallback)
  const idMapping = new Map<string, string>();
  for (const ex of exercisesData.exercises) {
    // First try to match by builtInId (reliable)
    let existing = existingExercises.find(e => e.builtInId === ex.id);
    // Fallback to name matching for legacy data
    if (!existing) {
      existing = existingExercises.find(e => e.name === ex.name);
    }
    if (existing) {
      idMapping.set(ex.id, existing.id);
    }
  }
  console.log(`Built ID mapping for ${idMapping.size} exercises`);

  // Delete existing programs (cascade deletes training days)
  const existingPrograms = await programsApi.list();
  for (const prog of existingPrograms) {
    await programsApi.delete(prog.id);
  }
  console.log("Deleted existing programs");

  // Create new program with properly mapped exercise IDs
  const program = programData.program;
  const mappedTrainingDays = mapProgramExerciseIds(idMapping, programData.trainingDays);

  await programsApi.create({
    name: program.name,
    description: program.description,
    isActive: program.isActive,
    trainingDays: mappedTrainingDays,
  });
  console.log("Created program with correct exercise ID mappings");
}

export async function clearDatabase(): Promise<void> {
  // Delete all exercises
  const exercises = await exercisesApi.list();
  for (const exercise of exercises) {
    await exercisesApi.delete(exercise.id);
  }

  // Delete all programs (cascade deletes training days)
  const programs = await programsApi.list();
  for (const program of programs) {
    await programsApi.delete(program.id);
  }

  // Delete all workouts
  const workouts = await workoutLogsApi.list();
  for (const workout of workouts) {
    await workoutLogsApi.delete(workout.id);
  }

  // Delete all personal records
  const prs = await personalRecordsApi.list();
  for (const pr of prs) {
    await personalRecordsApi.delete(pr.id);
  }

  console.log("Database cleared");
}

/**
 * Backfills builtInId for existing exercises that were created before the field was added.
 * Matches by name and sets the builtInId from the exercise data.
 */
export async function backfillBuiltInIds(): Promise<{ updated: number; skipped: number }> {
  console.log("Backfilling builtInId for existing exercises...");

  const existingExercises = await exercisesApi.list();
  let updated = 0;
  let skipped = 0;

  for (const ex of exercisesData.exercises) {
    // Find exercise by name that doesn't already have builtInId
    const existing = existingExercises.find(
      e => e.name === ex.name && !e.builtInId
    );

    if (existing) {
      try {
        await exercisesApi.update(existing.id, { builtInId: ex.id });
        updated++;
        console.log(`Set builtInId for: ${ex.name} -> ${ex.id}`);
      } catch (error) {
        console.error(`Failed to update ${ex.name}:`, error);
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`Backfill complete: ${updated} updated, ${skipped} skipped`);
  return { updated, skipped };
}

/**
 * Resets to the default program (Full Body 3-Day).
 * Clears workout logs and personal records, then reinstalls the default program.
 */
export async function resetToDefault(): Promise<void> {
  console.log("Resetting to default program...");

  // Delete all workout logs
  const workouts = await workoutLogsApi.list();
  for (const workout of workouts) {
    await workoutLogsApi.delete(workout.id);
  }
  console.log(`Deleted ${workouts.length} workout logs`);

  // Delete all personal records
  const prs = await personalRecordsApi.list();
  for (const pr of prs) {
    await personalRecordsApi.delete(pr.id);
  }
  console.log(`Deleted ${prs.length} personal records`);

  // Delete all programs (cascade deletes training days)
  const programs = await programsApi.list();
  for (const program of programs) {
    await programsApi.delete(program.id);
  }
  console.log(`Deleted ${programs.length} programs`);

  // Get existing exercises and build mapping
  const existingExercises = await exercisesApi.list();
  const idMapping = new Map<string, string>();

  for (const ex of exercisesData.exercises) {
    // First try to match by builtInId (reliable)
    let existing = existingExercises.find(e => e.builtInId === ex.id);
    // Fallback to name matching for legacy data
    if (!existing) {
      existing = existingExercises.find(e => e.name === ex.name);
    }
    if (existing) {
      idMapping.set(ex.id, existing.id);
    }
  }
  console.log(`Built ID mapping for ${idMapping.size} exercises`);

  // Create default program with properly mapped exercise IDs
  const program = programData.program;
  const mappedTrainingDays = mapProgramExerciseIds(idMapping, programData.trainingDays);

  await programsApi.create({
    name: program.name,
    description: program.description,
    isActive: program.isActive,
    trainingDays: mappedTrainingDays,
  });
  console.log("Installed default program:", program.name);
}
