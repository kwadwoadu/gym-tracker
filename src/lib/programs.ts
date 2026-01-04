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

  // If no exercises, seed them first
  if (existingExercises.length === 0) {
    console.log("Seeding exercises...");
    for (const ex of exercisesData.exercises) {
      const created = await exercisesApi.create({
        name: ex.name,
        muscleGroups: ex.muscleGroups,
        equipment: ex.equipment,
        videoUrl: null,
        builtInId: ex.id, // Store the original preset ID for reliable mapping
      });
      idMapping.set(ex.id, created.id);
    }
    console.log(`Seeded ${exercisesData.exercises.length} exercises`);
    return idMapping;
  }

  // Build mapping from existing exercises by builtInId (reliable) or name (fallback)
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
  const preset = getPresetProgram(presetId);
  if (!preset) {
    throw new Error(`Preset program not found: ${presetId}`);
  }

  // Build exercise ID mapping (seeds exercises if needed)
  const idMapping = await buildExerciseIdMapping();

  // Delete existing programs first (API will cascade delete training days)
  const existingPrograms = await programsApi.list();
  for (const program of existingPrograms) {
    await programsApi.delete(program.id);
  }

  // Map exercise IDs in training days
  const mappedTrainingDays = mapTrainingDayExerciseIds(preset.trainingDays, idMapping);

  // Create the program with properly mapped training days
  await programsApi.create({
    name: preset.program.name,
    description: preset.program.description || undefined,
    isActive: preset.program.isActive,
    trainingDays: mappedTrainingDays,
  });
}

/**
 * Create an empty program for "Start from Scratch" option
 */
export async function createEmptyProgram(): Promise<void> {
  // Seed exercises if not already seeded (so user has exercises to choose from)
  await buildExerciseIdMapping();

  // Delete existing programs first (API will cascade delete training days)
  const existingPrograms = await programsApi.list();
  for (const program of existingPrograms) {
    await programsApi.delete(program.id);
  }

  // Create empty program with one training day
  await programsApi.create({
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
