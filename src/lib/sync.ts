"use client";

import db from "./db";

// Generate a unique device ID for this browser
function getDeviceId(): string {
  const key = "setflow-device-id";
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

// Get last sync timestamp
function getLastSyncedAt(): string | null {
  return localStorage.getItem("setflow-last-synced-at");
}

// Set last sync timestamp
function setLastSyncedAt(timestamp: string): void {
  localStorage.setItem("setflow-last-synced-at", timestamp);
}

// Export all local data for sync
async function exportLocalData() {
  const [exercises, programs, trainingDays, workoutLogs, personalRecords, settings, onboardingProfile, achievements] =
    await Promise.all([
      db.exercises.toArray(),
      db.programs.toArray(),
      db.trainingDays.toArray(),
      db.workoutLogs.toArray(),
      db.personalRecords.toArray(),
      db.userSettings.get("user-settings"),
      db.onboardingProfiles.get("onboarding-profile"),
      db.achievements.toArray(),
    ]);

  return {
    exercises,
    programs,
    trainingDays,
    workoutLogs,
    personalRecords,
    settings,
    onboardingProfile,
    achievements,
  };
}

// Import cloud data to local
async function importCloudData(data: {
  exercises?: Array<{ id: string; name: string; videoUrl?: string; muscleGroups: string[]; equipment: string; isCustom: boolean }>;
  programs?: Array<{ id: string; name: string; description?: string; isActive: boolean }>;
  trainingDays?: Array<{ id: string; programId: string; name: string; dayNumber: number; warmup: unknown[]; supersets: unknown[]; finisher: unknown[] }>;
  workoutLogs?: Array<{ id: string; date: string; programId: string; dayId: string; dayName: string; sets: unknown[]; startTime: string; endTime?: string; duration?: number; notes?: string; isComplete: boolean }>;
  personalRecords?: Array<{ id: string; exerciseId: string; exerciseName: string; weight: number; reps: number; unit: "kg" | "lbs"; date: string; workoutLogId: string }>;
  settings?: { id: string; weightUnit: "kg" | "lbs"; defaultRestSeconds: number; soundEnabled: boolean; autoProgressWeight: boolean; progressionIncrement: number; autoStartRestTimer?: boolean } | null;
  onboardingProfile?: { id: string; goals: string[]; experienceLevel: string | null; trainingDaysPerWeek: number | null; equipment: string | null; heightCm: number | null; weightKg: number | null; bodyFatPercent: number | null; injuries: string[]; hasCompletedOnboarding: boolean; skippedOnboarding: boolean; completedAt: string | null } | null;
  achievements?: Array<{ id: string; achievementId: string; unlockedAt: string }>;
}) {
  // Merge cloud data with local (cloud wins on conflict)
  if (data.exercises) {
    for (const exercise of data.exercises) {
      await db.exercises.put({
        id: exercise.id,
        name: exercise.name,
        videoUrl: exercise.videoUrl,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        isCustom: exercise.isCustom,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (data.programs) {
    for (const program of data.programs) {
      await db.programs.put({
        id: program.id,
        name: program.name,
        description: program.description,
        isActive: program.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (data.trainingDays) {
    for (const day of data.trainingDays) {
      await db.trainingDays.put({
        id: day.id,
        programId: day.programId,
        name: day.name,
        dayNumber: day.dayNumber,
        warmup: day.warmup as [],
        supersets: day.supersets as [],
        finisher: day.finisher as [],
      });
    }
  }

  if (data.workoutLogs) {
    for (const log of data.workoutLogs) {
      await db.workoutLogs.put({
        id: log.id,
        date: log.date,
        programId: log.programId,
        dayId: log.dayId,
        dayName: log.dayName,
        sets: log.sets as [],
        startTime: log.startTime,
        endTime: log.endTime,
        duration: log.duration,
        notes: log.notes,
        isComplete: log.isComplete,
      });
    }
  }

  if (data.personalRecords) {
    for (const pr of data.personalRecords) {
      await db.personalRecords.put({
        id: pr.id,
        exerciseId: pr.exerciseId,
        exerciseName: pr.exerciseName,
        weight: pr.weight,
        reps: pr.reps,
        unit: pr.unit,
        date: pr.date,
        workoutLogId: pr.workoutLogId,
      });
    }
  }

  if (data.settings) {
    await db.userSettings.put({
      id: "user-settings",
      weightUnit: data.settings.weightUnit,
      defaultRestSeconds: data.settings.defaultRestSeconds,
      soundEnabled: data.settings.soundEnabled,
      autoProgressWeight: data.settings.autoProgressWeight,
      progressionIncrement: data.settings.progressionIncrement,
      autoStartRestTimer: data.settings.autoStartRestTimer ?? true,
    });
  }

  if (data.onboardingProfile) {
    await db.onboardingProfiles.put({
      id: "onboarding-profile",
      goals: data.onboardingProfile.goals || [],
      experienceLevel: data.onboardingProfile.experienceLevel as "beginner" | "intermediate" | "advanced" | null,
      trainingDaysPerWeek: data.onboardingProfile.trainingDaysPerWeek,
      equipment: data.onboardingProfile.equipment as "full_gym" | "home_gym" | "bodyweight" | null,
      heightCm: data.onboardingProfile.heightCm,
      weightKg: data.onboardingProfile.weightKg,
      bodyFatPercent: data.onboardingProfile.bodyFatPercent,
      injuries: data.onboardingProfile.injuries || [],
      hasCompletedOnboarding: data.onboardingProfile.hasCompletedOnboarding,
      skippedOnboarding: data.onboardingProfile.skippedOnboarding,
      completedAt: data.onboardingProfile.completedAt,
    });
  }

  if (data.achievements) {
    for (const achievement of data.achievements) {
      await db.achievements.put({
        id: achievement.id,
        achievementId: achievement.achievementId,
        unlockedAt: achievement.unlockedAt,
      });
    }
  }
}

// Push local changes to cloud
export async function pushToCloud(userEmail?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await exportLocalData();
    const lastSyncedAt = getLastSyncedAt();
    const deviceId = getDeviceId();

    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastSyncedAt,
        deviceId,
        email: userEmail,
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Push failed" };
    }

    const result = await response.json();
    setLastSyncedAt(result.syncedAt);
    return { success: true };
  } catch (error) {
    console.error("Push to cloud failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

// Pull cloud changes to local
export async function pullFromCloud(): Promise<{ success: boolean; error?: string }> {
  try {
    const lastSyncedAt = getLastSyncedAt();
    const url = `/api/sync${lastSyncedAt ? `?since=${encodeURIComponent(lastSyncedAt)}` : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Pull failed" };
    }

    const result = await response.json();
    await importCloudData(result.data);
    setLastSyncedAt(result.syncedAt);
    return { success: true };
  } catch (error) {
    console.error("Pull from cloud failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

// Full sync (pull then push)
export async function fullSync(userEmail?: string): Promise<{ success: boolean; error?: string }> {
  // Pull first to get any changes from other devices
  const pullResult = await pullFromCloud();

  // Always attempt push, even if pull fails
  // This ensures local changes get to cloud even with network hiccups
  const pushResult = await pushToCloud(userEmail);

  // Only fail if BOTH operations fail
  if (!pullResult.success && !pushResult.success) {
    return { success: false, error: `Pull: ${pullResult.error}, Push: ${pushResult.error}` };
  }

  return { success: true };
}

// Check if sync is available (user is signed in)
export function isSyncAvailable(): boolean {
  return typeof window !== "undefined" && document.cookie.includes("__session");
}
