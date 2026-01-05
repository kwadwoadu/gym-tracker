import {
  exercisesApi,
  programsApi,
  trainingDaysApi,
  workoutLogsApi,
  personalRecordsApi,
  settingsApi,
  type Exercise,
  type Program,
  type TrainingDay,
  type WorkoutLog,
  type PersonalRecord,
  type UserSettings,
} from "./api-client";

// ============================================================
// Export Data Types
// ============================================================

interface ExportData {
  version: number;
  exportedAt: string;
  data: {
    exercises: Exercise[];
    programs: Program[];
    trainingDays: TrainingDay[];
    workoutLogs: WorkoutLog[];
    personalRecords: PersonalRecord[];
    userSettings: UserSettings | null;
  };
}

// ============================================================
// Export Functions
// ============================================================

/**
 * Exports all data from the database as a JSON string
 */
export async function exportAllData(): Promise<string> {
  const exercises = await exercisesApi.list();
  const programs = await programsApi.list();

  // Get training days for all programs
  const trainingDays: TrainingDay[] = [];
  for (const program of programs) {
    const days = await trainingDaysApi.list(program.id);
    trainingDays.push(...days);
  }

  const workoutLogs = await workoutLogsApi.list();
  const personalRecords = await personalRecordsApi.list();
  const userSettings = await settingsApi.get();

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      exercises,
      programs,
      trainingDays,
      workoutLogs,
      personalRecords,
      userSettings: userSettings || null,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Downloads the exported data as a JSON file
 */
export function downloadExportedData(jsonString: string): void {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gym-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// Import Functions
// ============================================================

/**
 * Validates imported data structure
 */
function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== "object") return false;

  const d = data as Record<string, unknown>;
  if (typeof d.version !== "number") return false;
  if (!d.data || typeof d.data !== "object") return false;

  const dataObj = d.data as Record<string, unknown>;
  if (!Array.isArray(dataObj.exercises)) return false;
  if (!Array.isArray(dataObj.programs)) return false;
  if (!Array.isArray(dataObj.trainingDays)) return false;
  if (!Array.isArray(dataObj.workoutLogs)) return false;
  if (!Array.isArray(dataObj.personalRecords)) return false;

  return true;
}

/**
 * Imports data from a JSON string, replacing all existing data
 */
export async function importData(jsonString: string): Promise<void> {
  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonString);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (!validateImportData(parsedData)) {
    throw new Error("Invalid data structure");
  }

  // Clear existing data (delete all via API)
  const existingPrograms = await programsApi.list();
  for (const program of existingPrograms) {
    await programsApi.delete(program.id);
  }

  const existingExercises = await exercisesApi.list();
  for (const exercise of existingExercises) {
    await exercisesApi.delete(exercise.id);
  }

  const existingWorkouts = await workoutLogsApi.list();
  for (const workout of existingWorkouts) {
    await workoutLogsApi.delete(workout.id);
  }

  const existingPRs = await personalRecordsApi.list();
  for (const pr of existingPRs) {
    await personalRecordsApi.delete(pr.id);
  }

  // Import new data
  const { data } = parsedData;

  // Import exercises first
  for (const exercise of data.exercises) {
    await exercisesApi.create({
      name: exercise.name,
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment,
      videoUrl: exercise.videoUrl,
    });
  }

  // Import programs with training days
  for (const program of data.programs) {
    const programDays = data.trainingDays.filter(d => d.programId === program.id);
    await programsApi.create({
      name: program.name,
      description: program.description || undefined,
      isActive: program.isActive,
      trainingDays: programDays.map(day => ({
        name: day.name,
        dayNumber: day.dayNumber,
        warmup: day.warmup,
        supersets: day.supersets,
        finisher: day.finisher,
      })),
    });
  }

  // Import workout logs
  for (const workout of data.workoutLogs) {
    await workoutLogsApi.create({
      date: workout.date,
      dayId: workout.dayId,
      dayName: workout.dayName,
      duration: workout.duration ?? undefined,
      sets: workout.sets,
      notes: workout.notes ?? undefined,
      isComplete: workout.isComplete ?? undefined,
    });
  }

  // Import personal records
  for (const pr of data.personalRecords) {
    await personalRecordsApi.create({
      exerciseId: pr.exerciseId,
      exerciseName: pr.exerciseName,
      weight: pr.weight,
      reps: pr.reps,
      date: pr.date,
      workoutLogId: pr.workoutLogId,
    });
  }

  // Import settings
  if (data.userSettings) {
    await settingsApi.update(data.userSettings);
  }
}

/**
 * Reads a file and returns its contents as a string
 */
export function readFileAsString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// ============================================================
// Clear Functions
// ============================================================

/**
 * Clears only workout logs (keeps program and exercises)
 */
export async function clearWorkoutLogs(): Promise<void> {
  const workouts = await workoutLogsApi.list();
  for (const workout of workouts) {
    await workoutLogsApi.delete(workout.id);
  }

  const prs = await personalRecordsApi.list();
  for (const pr of prs) {
    await personalRecordsApi.delete(pr.id);
  }

  console.log("Workout logs and personal records cleared");
}

// ============================================================
// Reset Functions
// ============================================================

/**
 * Resets all data to default (clears everything - user must reinstall program)
 */
export async function resetToDefault(): Promise<void> {
  // Clear all programs (cascade deletes training days)
  const programs = await programsApi.list();
  for (const program of programs) {
    await programsApi.delete(program.id);
  }

  // Clear workout logs and PRs
  await clearWorkoutLogs();

  // Note: Exercises are seeded from preset programs,
  // so they'll be re-created when user selects a program
  console.log("Database reset - user must select a program");
}
