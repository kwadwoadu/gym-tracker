import Dexie, { type EntityTable } from "dexie";

// ============================================================
// Type Definitions
// ============================================================

export interface Exercise {
  id: string;
  name: string;
  videoUrl?: string;
  muscleGroups: string[];
  equipment: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingDay {
  id: string;
  programId: string;
  name: string;
  dayNumber: number;
  warmup: WarmupExercise[];
  supersets: Superset[];
  finisher: FinisherExercise[];
}

export interface WarmupExercise {
  exerciseId: string;
  duration?: number; // seconds
  reps?: number;
}

export interface Superset {
  id: string;
  label: string; // "A", "B", "C"
  exercises: SupersetExercise[];
}

export interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string; // "10,10,8,8" or "10-12"
  tempo: string; // "T:30A1"
  restSeconds: number;
}

export interface FinisherExercise {
  exerciseId: string;
  duration?: number; // seconds
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date
  programId: string;
  dayId: string;
  dayName: string;
  sets: SetLog[];
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  notes?: string;
  isComplete: boolean;
}

export interface SetLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  supersetLabel: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  unit: "kg" | "lbs";
  rpe?: number; // 1-10
  isComplete: boolean;
  completedAt?: string;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: "kg" | "lbs";
  date: string;
  workoutLogId: string;
}

export interface UserSettings {
  id: string;
  weightUnit: "kg" | "lbs";
  defaultRestSeconds: number;
  soundEnabled: boolean;
  autoProgressWeight: boolean;
  progressionIncrement: number; // kg
}

// ============================================================
// Database Definition
// ============================================================

const db = new Dexie("GymTrackerDB") as Dexie & {
  exercises: EntityTable<Exercise, "id">;
  programs: EntityTable<Program, "id">;
  trainingDays: EntityTable<TrainingDay, "id">;
  workoutLogs: EntityTable<WorkoutLog, "id">;
  personalRecords: EntityTable<PersonalRecord, "id">;
  userSettings: EntityTable<UserSettings, "id">;
};

db.version(1).stores({
  exercises: "id, name, *muscleGroups, equipment, isCustom",
  programs: "id, name, isActive",
  trainingDays: "id, programId, dayNumber",
  workoutLogs: "id, date, programId, dayId, isComplete",
  personalRecords: "id, exerciseId, date",
  userSettings: "id",
});

// ============================================================
// Helper Functions
// ============================================================

export function generateId(): string {
  return crypto.randomUUID();
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// ============================================================
// Exercise Operations
// ============================================================

export async function getAllExercises(): Promise<Exercise[]> {
  return db.exercises.toArray();
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id);
}

export async function addExercise(exercise: Omit<Exercise, "id" | "createdAt">): Promise<string> {
  const id = generateId();
  await db.exercises.add({
    ...exercise,
    id,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateExercise(id: string, updates: Partial<Exercise>): Promise<void> {
  await db.exercises.update(id, updates);
}

export async function deleteExercise(id: string): Promise<void> {
  await db.exercises.delete(id);
}

// ============================================================
// Program Operations
// ============================================================

export async function getActiveProgram(): Promise<Program | undefined> {
  return db.programs.where("isActive").equals(1).first();
}

export async function getAllPrograms(): Promise<Program[]> {
  return db.programs.toArray();
}

export async function addProgram(program: Omit<Program, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  await db.programs.add({
    ...program,
    id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function setActiveProgram(programId: string): Promise<void> {
  // Deactivate all programs
  await db.programs.toCollection().modify({ isActive: false });
  // Activate the selected program
  await db.programs.update(programId, { isActive: true });
}

// ============================================================
// Training Day Operations
// ============================================================

export async function getTrainingDaysByProgram(programId: string): Promise<TrainingDay[]> {
  return db.trainingDays.where("programId").equals(programId).sortBy("dayNumber");
}

export async function getTrainingDayById(id: string): Promise<TrainingDay | undefined> {
  return db.trainingDays.get(id);
}

export async function addTrainingDay(day: Omit<TrainingDay, "id">): Promise<string> {
  const id = generateId();
  await db.trainingDays.add({ ...day, id });
  return id;
}

export async function deleteTrainingDay(dayId: string): Promise<void> {
  const day = await db.trainingDays.get(dayId);
  if (!day) return;

  // Delete the training day
  await db.trainingDays.delete(dayId);

  // Resequence remaining days
  const remainingDays = await db.trainingDays
    .where("programId")
    .equals(day.programId)
    .sortBy("dayNumber");

  // Update day numbers sequentially
  for (let i = 0; i < remainingDays.length; i++) {
    if (remainingDays[i].dayNumber !== i + 1) {
      await db.trainingDays.update(remainingDays[i].id, { dayNumber: i + 1 });
    }
  }
}

export async function createNewTrainingDay(programId: string): Promise<string> {
  const existingDays = await db.trainingDays
    .where("programId")
    .equals(programId)
    .toArray();

  const nextDayNumber = existingDays.length + 1;
  const dayId = generateId();

  await db.trainingDays.add({
    id: dayId,
    programId,
    name: `Day ${nextDayNumber}`,
    dayNumber: nextDayNumber,
    warmup: [],
    supersets: [],
    finisher: [],
  });

  return dayId;
}

export async function updateTrainingDay(dayId: string, updates: Partial<TrainingDay>): Promise<void> {
  await db.trainingDays.update(dayId, updates);
}

// ============================================================
// Workout Log Operations
// ============================================================

export async function getWorkoutLogsForDay(dayId: string): Promise<WorkoutLog[]> {
  return db.workoutLogs.where("dayId").equals(dayId).reverse().sortBy("date");
}

export async function getRecentWorkoutLogs(limit: number = 10): Promise<WorkoutLog[]> {
  return db.workoutLogs.orderBy("date").reverse().limit(limit).toArray();
}

export async function getWorkoutLogById(id: string): Promise<WorkoutLog | undefined> {
  return db.workoutLogs.get(id);
}

export async function createWorkoutLog(log: Omit<WorkoutLog, "id">): Promise<string> {
  const id = generateId();
  await db.workoutLogs.add({ ...log, id });
  return id;
}

export async function updateWorkoutLog(id: string, updates: Partial<WorkoutLog>): Promise<void> {
  await db.workoutLogs.update(id, updates);
}

export async function getLastWorkoutForDay(dayId: string): Promise<WorkoutLog | undefined> {
  const logs = await db.workoutLogs
    .where("dayId")
    .equals(dayId)
    .and((log) => log.isComplete)
    .reverse()
    .sortBy("date");
  return logs[0];
}

// ============================================================
// Personal Records Operations
// ============================================================

export async function getPersonalRecords(exerciseId: string): Promise<PersonalRecord[]> {
  return db.personalRecords.where("exerciseId").equals(exerciseId).toArray();
}

export async function addPersonalRecord(pr: Omit<PersonalRecord, "id">): Promise<string> {
  const id = generateId();
  await db.personalRecords.add({ ...pr, id });
  return id;
}

export async function checkAndAddPR(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  unit: "kg" | "lbs",
  workoutLogId: string
): Promise<boolean> {
  const existingPRs = await getPersonalRecords(exerciseId);
  const isPR = !existingPRs.some((pr) => pr.weight >= weight && pr.reps >= reps);

  if (isPR) {
    await addPersonalRecord({
      exerciseId,
      exerciseName,
      weight,
      reps,
      unit,
      date: getToday(),
      workoutLogId,
    });
  }

  return isPR;
}

// ============================================================
// User Settings Operations
// ============================================================

const DEFAULT_SETTINGS: UserSettings = {
  id: "user-settings",
  weightUnit: "kg",
  defaultRestSeconds: 90,
  soundEnabled: true,
  autoProgressWeight: true,
  progressionIncrement: 2.5,
};

export async function getUserSettings(): Promise<UserSettings> {
  const settings = await db.userSettings.get("user-settings");
  return settings || DEFAULT_SETTINGS;
}

export async function updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
  const current = await getUserSettings();
  await db.userSettings.put({ ...current, ...updates, id: "user-settings" });
}

// ============================================================
// Progressive Overload Helper
// ============================================================

export async function getSuggestedWeight(
  exerciseId: string,
  dayId: string,
  setNumber: number
): Promise<{ weight: number; lastWeekWeight: number; lastWeekReps: number } | null> {
  const lastWorkout = await getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;

  const lastSet = lastWorkout.sets.find(
    (s) => s.exerciseId === exerciseId && s.setNumber === setNumber
  );
  if (!lastSet) return null;

  const settings = await getUserSettings();
  const targetRepsHit = lastSet.actualReps >= lastSet.targetReps;

  // If they hit all reps last time, suggest weight increase
  const suggestedWeight = targetRepsHit
    ? lastSet.weight + settings.progressionIncrement
    : lastSet.weight;

  return {
    weight: suggestedWeight,
    lastWeekWeight: lastSet.weight,
    lastWeekReps: lastSet.actualReps,
  };
}

// ============================================================
// Streak Tracking
// ============================================================

export async function getWorkoutStreak(): Promise<{
  currentStreak: number;
  thisWeekCount: number;
  lastWorkoutDate: string | null;
}> {
  const logs = await db.workoutLogs
    .where("isComplete")
    .equals(1)
    .reverse()
    .sortBy("date");

  if (logs.length === 0) {
    return { currentStreak: 0, thisWeekCount: 0, lastWorkoutDate: null };
  }

  // Calculate this week's workouts (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const thisWeekLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= monday;
  });

  // Count unique days this week
  const uniqueDays = new Set(thisWeekLogs.map((log) => log.date));
  const thisWeekCount = uniqueDays.size;

  // Calculate current streak (consecutive days)
  let currentStreak = 0;
  const checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  // Check if worked out today
  const todayStr = checkDate.toISOString().split("T")[0];
  const workedOutToday = logs.some((log) => log.date === todayStr);

  if (!workedOutToday) {
    // Start from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const hasWorkout = logs.some((log) => log.date === dateStr);

    if (hasWorkout) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    // Safety limit
    if (currentStreak > 365) break;
  }

  return {
    currentStreak,
    thisWeekCount,
    lastWorkoutDate: logs[0]?.date || null,
  };
}

// ============================================================
// Volume Calculation
// ============================================================

export function calculateTotalVolume(sets: SetLog[]): number {
  return sets.reduce((total, set) => {
    return total + set.weight * set.actualReps;
  }, 0);
}

export async function getLastWeekVolume(dayId: string): Promise<number | null> {
  const lastWorkout = await getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;
  return calculateTotalVolume(lastWorkout.sets);
}

// ============================================================
// Weekly Goal / Last Week Performance
// ============================================================

export async function getWeeklyGoalForExercise(
  exerciseId: string,
  dayId: string
): Promise<{
  lastWeight: number;
  lastReps: number;
  goalWeight: number;
  hitTarget: boolean;
} | null> {
  const lastWorkout = await getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;

  // Find best set for this exercise from last workout
  const exerciseSets = lastWorkout.sets.filter((s) => s.exerciseId === exerciseId);
  if (exerciseSets.length === 0) return null;

  // Get the best set (highest weight)
  const bestSet = exerciseSets.reduce((best, set) =>
    set.weight > best.weight ? set : best
  );

  const settings = await getUserSettings();
  const hitTarget = bestSet.actualReps >= bestSet.targetReps;

  return {
    lastWeight: bestSet.weight,
    lastReps: bestSet.actualReps,
    goalWeight: hitTarget ? bestSet.weight + settings.progressionIncrement : bestSet.weight,
    hitTarget,
  };
}

export default db;
