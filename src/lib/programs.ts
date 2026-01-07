import { programsApi, exercisesApi, type Program, type TrainingDay } from "./api-client";
import exercisesData from "@/data/exercises.json";

// Import preset program data
import fullBody3Day from "@/data/programs/full-body-3day.json";
import ppl6Day from "@/data/programs/ppl-6day.json";
import upperLower4Day from "@/data/programs/upper-lower-4day.json";

// Type definitions for mapping
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
  id?: string;
  label: string;
  exercises: SupersetExercise[];
}

interface FinisherExercise {
  exerciseId: string;
  duration?: number;
  reps?: number;
  notes?: string;
}

export interface PresetProgram {
  id: string;
  meta: {
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    daysPerWeek: number;
    targetAudience: string;
  };
  program: Omit<Program, "createdAt" | "updatedAt">;
  trainingDays: Omit<TrainingDay, "programId" | "createdAt" | "updatedAt">[];
}

// Available preset programs
export const PRESET_PROGRAMS: PresetProgram[] = [
  fullBody3Day as PresetProgram,
  ppl6Day as PresetProgram,
  upperLower4Day as PresetProgram,
];

/**
 * Get all available preset programs
 */
export function getPresetPrograms(): PresetProgram[] {
  return PRESET_PROGRAMS;
}

/**
 * Get a specific preset program by ID
 */
export function getPresetProgram(id: string): PresetProgram | undefined {
  return PRESET_PROGRAMS.find((p) => p.id === id);
}

/**
 * Get recommended program based on user's onboarding profile
 */
export function getRecommendedProgram(
  experienceLevel: "beginner" | "intermediate" | "advanced" | null,
  trainingDaysPerWeek: number | null
): PresetProgram {
  const days = trainingDaysPerWeek ?? 3;

  // Beginners always get Full Body
  if (experienceLevel === "beginner") {
    return fullBody3Day as PresetProgram;
  }

  // Match days per week preference
  if (days <= 3) {
    return fullBody3Day as PresetProgram;
  } else if (days === 4 || days === 5) {
    return upperLower4Day as PresetProgram;
  } else {
    return ppl6Day as PresetProgram;
  }
}

/**
 * Build exercise ID mapping from old string IDs to Prisma CUIDs
 * Seeds exercises if not already seeded
 */
async function buildExerciseIdMapping(): Promise<Map<string, string>> {
  const idMapping = new Map<string, string>();

  // Get existing exercises
  const existingExercises = await exercisesApi.list();
  console.log(`[buildExerciseIdMapping] Found ${existingExercises.length} existing exercises`);

  // If no exercises, seed them first
  if (existingExercises.length === 0) {
    console.log("[buildExerciseIdMapping] Seeding exercises...");
    let seededCount = 0;
    let failedCount = 0;

    for (const ex of exercisesData.exercises) {
      try {
        const created = await exercisesApi.create({
          name: ex.name,
          muscleGroups: ex.muscleGroups,
          equipment: ex.equipment,
          videoUrl: null,
          builtInId: ex.id, // Store the original preset ID for reliable mapping
        });
        idMapping.set(ex.id, created.id);
        seededCount++;
      } catch (error) {
        console.error(`[buildExerciseIdMapping] Failed to create exercise "${ex.name}":`, error);
        failedCount++;
      }
    }
    console.log(`[buildExerciseIdMapping] Seeded ${seededCount} exercises, ${failedCount} failed`);
    return idMapping;
  }

  // Build mapping from existing exercises by builtInId (reliable) or name (fallback)
  let mappedByBuiltInId = 0;
  let mappedByName = 0;
  let unmapped = 0;

  for (const ex of exercisesData.exercises) {
    // First try to match by builtInId (reliable)
    let existing = existingExercises.find(e => e.builtInId === ex.id);
    if (existing) {
      mappedByBuiltInId++;
    } else {
      // Fallback to name matching for legacy data
      existing = existingExercises.find(e => e.name === ex.name);
      if (existing) {
        mappedByName++;
      }
    }
    if (existing) {
      idMapping.set(ex.id, existing.id);
    } else {
      unmapped++;
      console.warn(`[buildExerciseIdMapping] Could not map exercise: ${ex.id} (${ex.name})`);
    }
  }
  console.log(`[buildExerciseIdMapping] Mapped ${idMapping.size} exercises (${mappedByBuiltInId} by builtInId, ${mappedByName} by name, ${unmapped} unmapped)`);

  return idMapping;
}

/**
 * Map exercise IDs in training days from old string IDs to Prisma CUIDs
 */
function mapTrainingDayExerciseIds(
  trainingDays: PresetProgram["trainingDays"],
  idMapping: Map<string, string>
) {
  return trainingDays.map((day, index) => ({
    name: day.name,
    dayNumber: day.dayNumber || index + 1,
    warmup: (day.warmup || []).map((w: WarmupExercise) => ({
      ...w,
      exerciseId: idMapping.get(w.exerciseId) || w.exerciseId,
    })),
    supersets: (day.supersets || []).map((ss: Superset, ssIndex: number) => ({
      id: ss.id || `superset-${index + 1}-${ssIndex + 1}`,
      label: ss.label,
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
 * Install a preset program to database
 * This creates a user's copy of the program with properly mapped exercise IDs
 */
export async function installPresetProgram(presetId: string): Promise<void> {
  console.log(`[installPresetProgram] Starting installation of preset: ${presetId}`);

  const preset = getPresetProgram(presetId);
  if (!preset) {
    throw new Error(`Preset program not found: ${presetId}`);
  }

  // Log preset structure to verify data
  console.log(`[installPresetProgram] Preset loaded: ${preset.meta.name}`);
  console.log(`[installPresetProgram] Training days in preset: ${preset.trainingDays.length}`);
  preset.trainingDays.forEach((day, i) => {
    console.log(`[installPresetProgram] Day ${i + 1} "${day.name}": ${day.supersets?.length || 0} supersets, ${day.warmup?.length || 0} warmup, ${day.finisher?.length || 0} finisher`);
  });

  // Build exercise ID mapping (seeds exercises if needed)
  const idMapping = await buildExerciseIdMapping();
  console.log(`[installPresetProgram] ID mapping built with ${idMapping.size} entries`);

  // Delete existing programs first (API will cascade delete training days)
  const existingPrograms = await programsApi.list();
  console.log(`[installPresetProgram] Deleting ${existingPrograms.length} existing programs`);
  for (const program of existingPrograms) {
    await programsApi.delete(program.id);
  }

  // Map exercise IDs in training days
  const mappedTrainingDays = mapTrainingDayExerciseIds(preset.trainingDays, idMapping);

  // Verify mapped data has supersets
  console.log(`[installPresetProgram] Mapped training days: ${mappedTrainingDays.length}`);
  mappedTrainingDays.forEach((day, i) => {
    const supersetCount = day.supersets?.length || 0;
    const exerciseCount = day.supersets?.reduce((acc, ss) => acc + (ss.exercises?.length || 0), 0) || 0;
    console.log(`[installPresetProgram] Mapped Day ${i + 1} "${day.name}": ${supersetCount} supersets, ${exerciseCount} exercises`);
    if (supersetCount === 0) {
      console.error(`[installPresetProgram] WARNING: Day ${i + 1} has no supersets after mapping!`);
    }
  });

  // Create the program with properly mapped training days
  console.log(`[installPresetProgram] Creating program with ${mappedTrainingDays.length} training days...`);

  // Log the exact payload being sent to verify JSON serialization
  const payload = {
    name: preset.program.name,
    description: preset.program.description || undefined,
    isActive: preset.program.isActive,
    trainingDays: mappedTrainingDays,
  };
  console.log(`[installPresetProgram] Payload JSON preview (first day):`, JSON.stringify(payload.trainingDays[0], null, 2));

  const createdProgram = await programsApi.create(payload);

  // Verify the created program has training days with supersets
  console.log(`[installPresetProgram] Program created: ${createdProgram.id}`);
  if (createdProgram.trainingDays) {
    createdProgram.trainingDays.forEach((day, i) => {
      const supersetCount = Array.isArray(day.supersets) ? day.supersets.length : 0;
      console.log(`[installPresetProgram] Created Day ${i + 1}: ${supersetCount} supersets`);
      if (supersetCount === 0) {
        console.error(`[installPresetProgram] ERROR: Created day ${i + 1} has no supersets! Data may have been lost.`);
      }
    });
  } else {
    console.error(`[installPresetProgram] ERROR: Created program has no trainingDays in response!`);
  }

  console.log(`[installPresetProgram] Installation complete`);
}

/**
 * Create an empty program for "Start from Scratch" option
 */
export async function createEmptyProgram(): Promise<void> {
  console.log(`[createEmptyProgram] Starting creation of empty program`);

  // Seed exercises if not already seeded (so user has exercises to choose from)
  await buildExerciseIdMapping();

  // Delete existing programs first (API will cascade delete training days)
  const existingPrograms = await programsApi.list();
  console.log(`[createEmptyProgram] Deleting ${existingPrograms.length} existing programs`);
  for (const program of existingPrograms) {
    await programsApi.delete(program.id);
  }

  // Create empty program with one training day
  console.log(`[createEmptyProgram] Creating empty program...`);
  const createdProgram = await programsApi.create({
    name: "My Training Program",
    description: "Your custom workout program",
    isActive: true,
    trainingDays: [{
      name: "Day 1",
      dayNumber: 1,
      warmup: [],
      supersets: [],
      finisher: [],
    }],
  });

  console.log(`[createEmptyProgram] Empty program created: ${createdProgram.id}`);
}

/**
 * Check if user has a program installed
 */
export async function hasInstalledProgram(): Promise<boolean> {
  const programs = await programsApi.list();
  return programs.length > 0;
}

/**
 * Get the user's current program
 */
export async function getCurrentProgram(): Promise<Program | undefined> {
  const programs = await programsApi.list();
  return programs.find(p => p.isActive) || programs[0];
}

/**
 * Get all exercises needed by a preset program
 */
export function getRequiredExerciseIds(preset: PresetProgram): string[] {
  const exerciseIds = new Set<string>();

  for (const day of preset.trainingDays) {
    // Warmup exercises
    for (const warmup of day.warmup || []) {
      exerciseIds.add(warmup.exerciseId);
    }

    // Superset exercises
    for (const superset of day.supersets || []) {
      for (const exercise of superset.exercises || []) {
        exerciseIds.add(exercise.exerciseId);
      }
    }

    // Finisher exercises
    for (const finisher of day.finisher || []) {
      exerciseIds.add(finisher.exerciseId);
    }
  }

  return Array.from(exerciseIds);
}
