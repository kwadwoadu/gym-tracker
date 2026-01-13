/**
 * Server-side backup functions for data protection
 * Used before destructive operations like reset, seed, or import
 */

import { prisma, Prisma } from "./prisma";

// ============================================================
// Types
// ============================================================

export interface BackupSummary {
  id: string;
  backupName: string;
  reason: string;
  createdAt: Date;
  dataSize: number;
}

// Backup entity types (serialized versions of Prisma models)
interface BackupExercise {
  id: string;
  builtInId: string | null;
  name: string;
  videoUrl: string | null;
  muscleGroups: string[];
  equipment: string;
  isCustom: boolean;
  createdAt: string;
}

interface BackupProgram {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackupTrainingDay {
  id: string;
  name: string;
  dayNumber: number;
  programId: string;
  warmup: Prisma.JsonValue;
  supersets: Prisma.JsonValue;
  finisher: Prisma.JsonValue;
}

interface BackupWorkoutLog {
  id: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  notes: string | null;
  isComplete: boolean;
  programId: string | null;
  dayId: string;
  sets: Prisma.JsonValue;
}

interface BackupPersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: string;
  date: string;
  exerciseId: string;
  workoutLogId: string;
}

interface BackupUserSettings {
  id: string;
  weightUnit: string;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  autoProgressWeight: boolean;
  progressionIncrement: number;
  autoStartRestTimer: boolean;
}

interface BackupAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
}

interface BackupData {
  version: number;
  createdAt: string;
  exercises: BackupExercise[];
  programs: BackupProgram[];
  trainingDays: BackupTrainingDay[];
  workoutLogs: BackupWorkoutLog[];
  personalRecords: BackupPersonalRecord[];
  userSettings: BackupUserSettings | null;
  achievements: BackupAchievement[];
}

// ============================================================
// Create Backup
// ============================================================

/**
 * Creates a full backup of user data before destructive operations
 * @param userId - The user's database ID
 * @param reason - Why the backup was created (e.g., "pre-reset", "pre-import", "user-initiated")
 * @returns The created backup ID
 */
export async function createBackup(
  userId: string,
  reason: string
): Promise<string> {
  // Gather all user data
  const [exercises, programs, workoutLogs, personalRecords, settings, achievements] =
    await Promise.all([
      prisma.exercise.findMany({ where: { userId } }),
      prisma.program.findMany({
        where: { userId },
        include: { trainingDays: true },
      }),
      prisma.workoutLog.findMany({ where: { userId } }),
      prisma.personalRecord.findMany({ where: { userId } }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.achievement.findMany({ where: { userId } }),
    ]);

  // Flatten training days from programs
  const trainingDays = programs.flatMap((p) => p.trainingDays);

  // Create backup data object (serialize dates to ISO strings for JSON storage)
  const backupData: BackupData = {
    version: 1,
    createdAt: new Date().toISOString(),
    exercises: exercises.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    programs: programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    trainingDays: trainingDays.map((d) => ({
      id: d.id,
      name: d.name,
      dayNumber: d.dayNumber,
      programId: d.programId,
      warmup: d.warmup,
      supersets: d.supersets,
      finisher: d.finisher,
    })),
    workoutLogs: workoutLogs.map((l) => ({
      id: l.id,
      date: l.date,
      dayName: l.dayName,
      startTime: l.startTime.toISOString(),
      endTime: l.endTime?.toISOString() ?? null,
      duration: l.duration,
      notes: l.notes,
      isComplete: l.isComplete,
      programId: l.programId,
      dayId: l.dayId,
      sets: l.sets,
    })),
    personalRecords: personalRecords.map((pr) => ({
      id: pr.id,
      exerciseName: pr.exerciseName,
      weight: pr.weight,
      reps: pr.reps,
      unit: pr.unit,
      date: pr.date,
      exerciseId: pr.exerciseId,
      workoutLogId: pr.workoutLogId,
    })),
    userSettings: settings ? {
      id: settings.id,
      weightUnit: settings.weightUnit,
      defaultRestSeconds: settings.defaultRestSeconds,
      soundEnabled: settings.soundEnabled,
      autoProgressWeight: settings.autoProgressWeight,
      progressionIncrement: settings.progressionIncrement,
      autoStartRestTimer: settings.autoStartRestTimer,
    } : null,
    achievements: achievements.map((a) => ({
      id: a.id,
      achievementId: a.achievementId,
      unlockedAt: a.unlockedAt.toISOString(),
    })),
  };

  const dataString = JSON.stringify(backupData);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `backup-${reason}-${timestamp}`;

  // Store backup in database
  const backup = await prisma.backup.create({
    data: {
      userId,
      backupName,
      data: dataString,
      reason,
    },
  });

  console.log(
    `[Backup] Created backup ${backup.id} for user ${userId} (reason: ${reason})`
  );

  return backup.id;
}

// ============================================================
// List Backups
// ============================================================

/**
 * Lists all backups for a user
 * @param userId - The user's database ID
 * @returns Array of backup summaries
 */
export async function listBackups(userId: string): Promise<BackupSummary[]> {
  const backups = await prisma.backup.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      backupName: true,
      reason: true,
      createdAt: true,
      data: true,
    },
  });

  return backups.map((b) => ({
    id: b.id,
    backupName: b.backupName,
    reason: b.reason,
    createdAt: b.createdAt,
    dataSize: b.data.length,
  }));
}

// ============================================================
// Get Backup
// ============================================================

/**
 * Gets a specific backup
 * @param backupId - The backup ID
 * @param userId - The user's database ID (for security)
 * @returns The backup data or null if not found
 */
export async function getBackup(
  backupId: string,
  userId: string
): Promise<BackupData | null> {
  const backup = await prisma.backup.findFirst({
    where: { id: backupId, userId },
  });

  if (!backup) {
    return null;
  }

  return JSON.parse(backup.data) as BackupData;
}

// ============================================================
// Restore from Backup
// ============================================================

/**
 * Restores user data from a backup
 * WARNING: This deletes all current data before restoring
 * @param backupId - The backup ID to restore from
 * @param userId - The user's database ID
 */
export async function restoreFromBackup(
  backupId: string,
  userId: string
): Promise<void> {
  const backupData = await getBackup(backupId, userId);

  if (!backupData) {
    throw new Error(`Backup ${backupId} not found`);
  }

  console.log(`[Backup] Restoring from backup ${backupId} for user ${userId}`);

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Delete current data (in order to respect foreign keys)
    await tx.personalRecord.deleteMany({ where: { userId } });
    await tx.workoutLog.deleteMany({ where: { userId } });
    await tx.achievement.deleteMany({ where: { userId } });
    await tx.program.deleteMany({ where: { userId } });
    await tx.exercise.deleteMany({ where: { userId } });
    await tx.userSettings.deleteMany({ where: { userId } });

    // Restore exercises
    for (const exercise of backupData.exercises) {
      await tx.exercise.create({
        data: {
          id: exercise.id,
          builtInId: exercise.builtInId,
          name: exercise.name,
          videoUrl: exercise.videoUrl,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          isCustom: exercise.isCustom,
          userId,
          createdAt: new Date(exercise.createdAt),
        },
      });
    }

    // Restore programs with training days
    for (const program of backupData.programs) {
      await tx.program.create({
        data: {
          id: program.id,
          name: program.name,
          description: program.description,
          isActive: program.isActive,
          userId,
          createdAt: new Date(program.createdAt),
          updatedAt: new Date(program.updatedAt),
        },
      });
    }

    // Restore training days
    for (const day of backupData.trainingDays) {
      await tx.trainingDay.create({
        data: {
          id: day.id,
          name: day.name,
          dayNumber: day.dayNumber,
          programId: day.programId,
          warmup: day.warmup as Prisma.InputJsonValue,
          supersets: day.supersets as Prisma.InputJsonValue,
          finisher: day.finisher as Prisma.InputJsonValue,
        },
      });
    }

    // Restore workout logs
    for (const log of backupData.workoutLogs) {
      await tx.workoutLog.create({
        data: {
          id: log.id,
          date: log.date,
          dayName: log.dayName,
          startTime: new Date(log.startTime),
          endTime: log.endTime ? new Date(log.endTime) : null,
          duration: log.duration,
          notes: log.notes,
          isComplete: log.isComplete,
          programId: log.programId,
          dayId: log.dayId,
          userId,
          sets: log.sets as Prisma.InputJsonValue,
        },
      });
    }

    // Restore personal records
    for (const pr of backupData.personalRecords) {
      await tx.personalRecord.create({
        data: {
          id: pr.id,
          exerciseName: pr.exerciseName,
          weight: pr.weight,
          reps: pr.reps,
          unit: pr.unit,
          date: pr.date,
          exerciseId: pr.exerciseId,
          workoutLogId: pr.workoutLogId,
          userId,
        },
      });
    }

    // Restore user settings
    if (backupData.userSettings) {
      const settings = backupData.userSettings;
      await tx.userSettings.create({
        data: {
          id: settings.id,
          weightUnit: settings.weightUnit,
          defaultRestSeconds: settings.defaultRestSeconds,
          soundEnabled: settings.soundEnabled,
          autoProgressWeight: settings.autoProgressWeight,
          progressionIncrement: settings.progressionIncrement,
          autoStartRestTimer: settings.autoStartRestTimer,
          userId,
        },
      });
    }

    // Restore achievements
    for (const achievement of backupData.achievements) {
      await tx.achievement.create({
        data: {
          id: achievement.id,
          achievementId: achievement.achievementId,
          unlockedAt: new Date(achievement.unlockedAt),
          userId,
        },
      });
    }
  });

  console.log(`[Backup] Restore complete from backup ${backupId}`);
}

// ============================================================
// Cleanup Old Backups
// ============================================================

/**
 * Deletes backups older than the specified number of days
 * @param userId - The user's database ID
 * @param daysToKeep - Number of days to keep backups (default: 30)
 */
export async function cleanupOldBackups(
  userId: string,
  daysToKeep: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.backup.deleteMany({
    where: {
      userId,
      createdAt: { lt: cutoffDate },
    },
  });

  if (result.count > 0) {
    console.log(`[Backup] Cleaned up ${result.count} old backups for user ${userId}`);
  }

  return result.count;
}

// ============================================================
// Delete Backup
// ============================================================

/**
 * Deletes a specific backup
 * @param backupId - The backup ID to delete
 * @param userId - The user's database ID (for security)
 */
export async function deleteBackup(
  backupId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.backup.deleteMany({
    where: { id: backupId, userId },
  });

  return result.count > 0;
}
