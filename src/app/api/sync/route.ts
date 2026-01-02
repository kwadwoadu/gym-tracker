import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { cloudDb, isCloudSyncEnabled } from "@/lib/db/neon";
import { eq, and, gte } from "drizzle-orm";
import {
  users,
  exercises,
  programs,
  trainingDays,
  workoutLogs,
  personalRecords,
  userSettings,
  syncMetadata,
  onboardingProfiles,
  achievements,
} from "@/lib/db/schema";

// POST /api/sync - Push local changes to cloud
export async function POST(request: NextRequest) {
  console.log("[API Sync] POST received");
  const { userId } = await auth();
  console.log("[API Sync] POST auth result", { userId: userId ? userId.substring(0, 10) + "..." : null });

  if (!userId) {
    console.log("[API Sync] POST unauthorized - no userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudSyncEnabled() || !cloudDb) {
    console.log("[API Sync] POST cloud sync not configured", { isEnabled: isCloudSyncEnabled(), hasDb: !!cloudDb });
    return NextResponse.json({ error: "Cloud sync not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { data } = body;
    console.log("[API Sync] POST data received", {
      exerciseCount: data?.exercises?.length || 0,
      programCount: data?.programs?.length || 0,
      workoutCount: data?.workoutLogs?.length || 0,
      deviceId: body.deviceId,
    });

    // Ensure user exists in cloud
    const existingUser = await cloudDb.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      await cloudDb.insert(users).values({
        id: userId,
        email: body.email || "unknown@example.com",
      });
    }

    // Sync each table
    if (data.exercises) {
      for (const exercise of data.exercises) {
        await cloudDb
          .insert(exercises)
          .values({ ...exercise, userId })
          .onConflictDoUpdate({
            target: exercises.id,
            set: {
              name: exercise.name,
              videoUrl: exercise.videoUrl,
              muscleGroups: exercise.muscleGroups,
              equipment: exercise.equipment,
              isCustom: exercise.isCustom,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (data.programs) {
      for (const program of data.programs) {
        await cloudDb
          .insert(programs)
          .values({ ...program, userId })
          .onConflictDoUpdate({
            target: programs.id,
            set: {
              name: program.name,
              description: program.description,
              isActive: program.isActive,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (data.trainingDays) {
      for (const day of data.trainingDays) {
        await cloudDb
          .insert(trainingDays)
          .values({ ...day, userId })
          .onConflictDoUpdate({
            target: trainingDays.id,
            set: {
              name: day.name,
              dayNumber: day.dayNumber,
              warmup: day.warmup,
              supersets: day.supersets,
              finisher: day.finisher,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (data.workoutLogs) {
      for (const log of data.workoutLogs) {
        await cloudDb
          .insert(workoutLogs)
          .values({ ...log, userId })
          .onConflictDoUpdate({
            target: workoutLogs.id,
            set: {
              // All mutable fields must be included
              date: log.date,
              programId: log.programId,
              dayId: log.dayId,
              dayName: log.dayName,
              sets: log.sets,
              startTime: log.startTime,
              endTime: log.endTime,
              duration: log.duration,
              notes: log.notes,
              isComplete: log.isComplete,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (data.personalRecords) {
      for (const pr of data.personalRecords) {
        await cloudDb
          .insert(personalRecords)
          .values({ ...pr, userId })
          .onConflictDoUpdate({
            target: personalRecords.id,
            set: {
              weight: pr.weight,
              reps: pr.reps,
              updatedAt: new Date(),
            },
          });
      }
    }

    if (data.settings) {
      await cloudDb
        .insert(userSettings)
        .values({ ...data.settings, userId })
        .onConflictDoUpdate({
          target: userSettings.id,
          set: {
            weightUnit: data.settings.weightUnit,
            defaultRestSeconds: data.settings.defaultRestSeconds,
            soundEnabled: data.settings.soundEnabled,
            autoProgressWeight: data.settings.autoProgressWeight,
            progressionIncrement: data.settings.progressionIncrement,
            updatedAt: new Date(),
          },
        });
    }

    if (data.onboardingProfile) {
      await cloudDb
        .insert(onboardingProfiles)
        .values({
          id: `onboarding-${userId}`,
          userId,
          goals: data.onboardingProfile.goals || [],
          experienceLevel: data.onboardingProfile.experienceLevel,
          trainingDaysPerWeek: data.onboardingProfile.trainingDaysPerWeek,
          equipment: data.onboardingProfile.equipment,
          heightCm: data.onboardingProfile.heightCm,
          weightKg: data.onboardingProfile.weightKg,
          bodyFatPercent: data.onboardingProfile.bodyFatPercent,
          injuries: data.onboardingProfile.injuries || [],
          hasCompletedOnboarding: data.onboardingProfile.hasCompletedOnboarding,
          skippedOnboarding: data.onboardingProfile.skippedOnboarding,
          completedAt: data.onboardingProfile.completedAt ? new Date(data.onboardingProfile.completedAt) : null,
        })
        .onConflictDoUpdate({
          target: onboardingProfiles.id,
          set: {
            goals: data.onboardingProfile.goals || [],
            experienceLevel: data.onboardingProfile.experienceLevel,
            trainingDaysPerWeek: data.onboardingProfile.trainingDaysPerWeek,
            equipment: data.onboardingProfile.equipment,
            heightCm: data.onboardingProfile.heightCm,
            weightKg: data.onboardingProfile.weightKg,
            bodyFatPercent: data.onboardingProfile.bodyFatPercent,
            injuries: data.onboardingProfile.injuries || [],
            hasCompletedOnboarding: data.onboardingProfile.hasCompletedOnboarding,
            skippedOnboarding: data.onboardingProfile.skippedOnboarding,
            completedAt: data.onboardingProfile.completedAt ? new Date(data.onboardingProfile.completedAt) : null,
            updatedAt: new Date(),
          },
        });
    }

    // Sync achievements
    if (data.achievements) {
      for (const achievement of data.achievements) {
        await cloudDb
          .insert(achievements)
          .values({
            id: achievement.id,
            userId,
            achievementId: achievement.achievementId,
            unlockedAt: new Date(achievement.unlockedAt),
          })
          .onConflictDoNothing(); // Achievements are immutable once unlocked
      }
    }

    // Update sync metadata
    const now = new Date();
    await cloudDb
      .insert(syncMetadata)
      .values({
        id: `sync-${userId}`,
        userId,
        lastSyncedAt: now,
        deviceId: body.deviceId,
      })
      .onConflictDoUpdate({
        target: syncMetadata.id,
        set: {
          lastSyncedAt: now,
          deviceId: body.deviceId,
          updatedAt: now,
        },
      });

    console.log("[API Sync] POST success", { syncedAt: now.toISOString() });
    return NextResponse.json({
      success: true,
      syncedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[API Sync] POST error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/sync - Pull cloud changes to local
export async function GET(request: NextRequest) {
  console.log("[API Sync] GET received");
  const { userId } = await auth();
  console.log("[API Sync] GET auth result", { userId: userId ? userId.substring(0, 10) + "..." : null });

  if (!userId) {
    console.log("[API Sync] GET unauthorized - no userId");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudSyncEnabled() || !cloudDb) {
    console.log("[API Sync] GET cloud sync not configured", { isEnabled: isCloudSyncEnabled(), hasDb: !!cloudDb });
    return NextResponse.json({ error: "Cloud sync not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(0);
    console.log("[API Sync] GET params", { since, sinceDate });

    // Fetch all user data that's been updated since the last sync
    const [
      userExercises,
      userPrograms,
      userTrainingDays,
      userWorkoutLogs,
      userPersonalRecords,
      userSettingsData,
      userOnboardingProfile,
      userAchievements,
    ] = await Promise.all([
      cloudDb
        .select()
        .from(exercises)
        .where(and(eq(exercises.userId, userId), gte(exercises.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(programs)
        .where(and(eq(programs.userId, userId), gte(programs.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(trainingDays)
        .where(and(eq(trainingDays.userId, userId), gte(trainingDays.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(personalRecords)
        .where(and(eq(personalRecords.userId, userId), gte(personalRecords.updatedAt, sinceDate))),
      cloudDb.select().from(userSettings).where(eq(userSettings.userId, userId)),
      cloudDb.select().from(onboardingProfiles).where(eq(onboardingProfiles.userId, userId)),
      cloudDb.select().from(achievements).where(eq(achievements.userId, userId)),
    ]);

    // Transform onboarding profile to match local format
    const onboardingProfile = userOnboardingProfile[0]
      ? {
          id: "onboarding-profile",
          goals: userOnboardingProfile[0].goals || [],
          experienceLevel: userOnboardingProfile[0].experienceLevel,
          trainingDaysPerWeek: userOnboardingProfile[0].trainingDaysPerWeek,
          equipment: userOnboardingProfile[0].equipment,
          heightCm: userOnboardingProfile[0].heightCm,
          weightKg: userOnboardingProfile[0].weightKg,
          bodyFatPercent: userOnboardingProfile[0].bodyFatPercent,
          injuries: userOnboardingProfile[0].injuries || [],
          hasCompletedOnboarding: userOnboardingProfile[0].hasCompletedOnboarding,
          skippedOnboarding: userOnboardingProfile[0].skippedOnboarding,
          completedAt: userOnboardingProfile[0].completedAt?.toISOString() || null,
        }
      : null;

    console.log("[API Sync] GET success", {
      exerciseCount: userExercises.length,
      programCount: userPrograms.length,
      workoutCount: userWorkoutLogs.length,
    });
    return NextResponse.json({
      success: true,
      data: {
        exercises: userExercises,
        programs: userPrograms,
        trainingDays: userTrainingDays,
        workoutLogs: userWorkoutLogs,
        personalRecords: userPersonalRecords,
        settings: userSettingsData[0] || null,
        onboardingProfile,
        achievements: userAchievements.map((a) => ({
          id: a.id,
          achievementId: a.achievementId,
          unlockedAt: a.unlockedAt.toISOString(),
        })),
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API Sync] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
