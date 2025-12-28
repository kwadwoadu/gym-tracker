import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { cloudDb, isCloudSyncEnabled } from "@/lib/db/neon";
import { eq, and, gt } from "drizzle-orm";
import {
  users,
  exercises,
  programs,
  trainingDays,
  workoutLogs,
  personalRecords,
  userSettings,
  syncMetadata,
} from "@/lib/db/schema";

// POST /api/sync - Push local changes to cloud
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudSyncEnabled() || !cloudDb) {
    return NextResponse.json({ error: "Cloud sync not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { lastSyncedAt, data } = body;

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
              sets: log.sets,
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

    return NextResponse.json({
      success: true,
      syncedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/sync - Pull cloud changes to local
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudSyncEnabled() || !cloudDb) {
    return NextResponse.json({ error: "Cloud sync not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(0);

    // Fetch all user data that's been updated since the last sync
    const [
      userExercises,
      userPrograms,
      userTrainingDays,
      userWorkoutLogs,
      userPersonalRecords,
      userSettingsData,
    ] = await Promise.all([
      cloudDb
        .select()
        .from(exercises)
        .where(and(eq(exercises.userId, userId), gt(exercises.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(programs)
        .where(and(eq(programs.userId, userId), gt(programs.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(trainingDays)
        .where(and(eq(trainingDays.userId, userId), gt(trainingDays.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(workoutLogs)
        .where(and(eq(workoutLogs.userId, userId), gt(workoutLogs.updatedAt, sinceDate))),
      cloudDb
        .select()
        .from(personalRecords)
        .where(and(eq(personalRecords.userId, userId), gt(personalRecords.updatedAt, sinceDate))),
      cloudDb.select().from(userSettings).where(eq(userSettings.userId, userId)),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        exercises: userExercises,
        programs: userPrograms,
        trainingDays: userTrainingDays,
        workoutLogs: userWorkoutLogs,
        personalRecords: userPersonalRecords,
        settings: userSettingsData[0] || null,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
