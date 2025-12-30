import db from "./db";
import type { Program, TrainingDay } from "./db";

// Import preset program data
import fullBody3Day from "@/data/programs/full-body-3day.json";
import ppl6Day from "@/data/programs/ppl-6day.json";
import upperLower4Day from "@/data/programs/upper-lower-4day.json";

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
 * Install a preset program to IndexedDB
 * This creates a user's copy of the program
 */
export async function installPresetProgram(presetId: string): Promise<void> {
  const preset = getPresetProgram(presetId);
  if (!preset) {
    throw new Error(`Preset program not found: ${presetId}`);
  }

  // Clear existing program data
  await db.programs.clear();
  await db.trainingDays.clear();

  // Create the program
  const program: Program = {
    ...preset.program,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.programs.add(program);

  // Create training days
  for (const day of preset.trainingDays) {
    const trainingDay: TrainingDay = {
      ...day,
      programId: program.id,
    };
    await db.trainingDays.add(trainingDay);
  }
}

/**
 * Create an empty program for "Start from Scratch" option
 */
export async function createEmptyProgram(): Promise<void> {
  // Clear existing program data
  await db.programs.clear();
  await db.trainingDays.clear();

  // Create empty program
  const program: Program = {
    id: "custom-program",
    name: "My Training Program",
    description: "Your custom workout program",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.programs.add(program);

  // Create one empty training day to start
  const trainingDay: TrainingDay = {
    id: "day-1",
    name: "Day 1",
    dayNumber: 1,
    programId: program.id,
    warmup: [],
    supersets: [],
    finisher: [],
  };
  await db.trainingDays.add(trainingDay);
}

/**
 * Check if user has a program installed
 */
export async function hasInstalledProgram(): Promise<boolean> {
  const count = await db.programs.count();
  return count > 0;
}

/**
 * Get the user's current program
 */
export async function getCurrentProgram(): Promise<Program | undefined> {
  return db.programs.toCollection().first();
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
