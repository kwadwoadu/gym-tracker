import db, {
  type Exercise,
  type Program,
  type TrainingDay,
  type WorkoutLog,
  type PersonalRecord,
  type UserSettings,
} from "./db";
import { seedDatabase, clearDatabase } from "./seed";

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
  const exercises = await db.exercises.toArray();
  const programs = await db.programs.toArray();
  const trainingDays = await db.trainingDays.toArray();
  const workoutLogs = await db.workoutLogs.toArray();
  const personalRecords = await db.personalRecords.toArray();
  const userSettings = await db.userSettings.get("user-settings");

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

  // Clear existing data
  await clearDatabase();

  // Import new data
  const { data } = parsedData;

  if (data.exercises.length > 0) {
    await db.exercises.bulkAdd(data.exercises);
  }

  if (data.programs.length > 0) {
    await db.programs.bulkAdd(data.programs);
  }

  if (data.trainingDays.length > 0) {
    await db.trainingDays.bulkAdd(data.trainingDays);
  }

  if (data.workoutLogs.length > 0) {
    await db.workoutLogs.bulkAdd(data.workoutLogs);
  }

  if (data.personalRecords.length > 0) {
    await db.personalRecords.bulkAdd(data.personalRecords);
  }

  if (data.userSettings) {
    await db.userSettings.add(data.userSettings);
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
  await db.workoutLogs.clear();
  await db.personalRecords.clear();
  console.log("Workout logs and personal records cleared");
}

// ============================================================
// Reset Functions
// ============================================================

/**
 * Resets all data to default program
 */
export async function resetToDefault(): Promise<void> {
  // Clear all data
  await clearDatabase();
  // Re-seed with default data
  await seedDatabase();
  console.log("Database reset to default");
}
