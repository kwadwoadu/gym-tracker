import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { toDate, toDateRequired } from "@/lib/db/utils";

/** Maximum items per entity type to prevent DoS via oversized payloads */
const MAX_ITEMS: Record<string, number> = {
  exercises: 500,
  programs: 50,
  trainingDays: 200,
  workoutLogs: 1000,
  personalRecords: 500,
  achievements: 200,
};

/**
 * POST /api/sync - Push local IndexedDB data to cloud (legacy sync path)
 *
 * Receives data from the legacy sync.ts pushToCloud() function.
 * All date fields are explicitly converted from ISO strings to Date objects
 * to prevent the "toISOString is not a function" error.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data, deviceId } = body;

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // SEC-008: Array length guards to prevent DoS
    for (const [key, limit] of Object.entries(MAX_ITEMS)) {
      if (data[key] && Array.isArray(data[key]) && data[key].length > limit) {
        return NextResponse.json(
          { error: `Too many ${key} (max ${limit})` },
          { status: 413 }
        );
      }
    }

    // PERF-001: Batch ownership checks per entity type with Promise.all,
    // then collect all allowed upserts into a single $transaction.
    // This preserves SEC-001 ownership guards while eliminating N+1 sequential round trips.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operations: any[] = [];

    // --- Exercises: batch ownership checks, then collect upserts ---
    if (data.exercises && Array.isArray(data.exercises)) {
      const existingExercises = await Promise.all(
        data.exercises.map((exercise: { id: string }) =>
          prisma.exercise.findUnique({
            where: { id: exercise.id },
            select: { id: true, userId: true },
          })
        )
      );
      for (let i = 0; i < data.exercises.length; i++) {
        const exercise = data.exercises[i];
        const existing = existingExercises[i];
        // SEC-001: Skip records belonging to another user
        if (existing && existing.userId !== user.id) continue;

        operations.push(
          prisma.exercise.upsert({
            where: { id: exercise.id },
            create: {
              id: exercise.id,
              name: exercise.name,
              videoUrl: exercise.videoUrl || null,
              muscleGroups: exercise.muscleGroups || [],
              muscles: exercise.muscles || null,
              equipment: exercise.equipment || "other",
              isCustom: exercise.isCustom ?? true,
              userId: user.id,
              createdAt: toDateRequired(exercise.createdAt),
            },
            update: {
              name: exercise.name,
              videoUrl: exercise.videoUrl || null,
              muscleGroups: exercise.muscleGroups || [],
              muscles: exercise.muscles || null,
              equipment: exercise.equipment || "other",
            },
          })
        );
      }
    }

    // --- Programs: batch ownership checks, then collect upserts ---
    if (data.programs && Array.isArray(data.programs)) {
      const existingPrograms = await Promise.all(
        data.programs.map((program: { id: string }) =>
          prisma.program.findUnique({
            where: { id: program.id },
            select: { id: true, userId: true },
          })
        )
      );
      for (let i = 0; i < data.programs.length; i++) {
        const program = data.programs[i];
        const existing = existingPrograms[i];
        // SEC-001: Skip records belonging to another user
        if (existing && existing.userId !== user.id) continue;

        operations.push(
          prisma.program.upsert({
            where: { id: program.id },
            create: {
              id: program.id,
              name: program.name,
              description: program.description || null,
              isActive: program.isActive ?? false,
              userId: user.id,
              createdAt: toDateRequired(program.createdAt),
              updatedAt: toDateRequired(program.updatedAt),
            },
            update: {
              name: program.name,
              description: program.description || null,
              isActive: program.isActive ?? false,
              updatedAt: new Date(),
            },
          })
        );
      }
    }

    // --- Training days: batch ownership checks via parent program ---
    if (data.trainingDays && Array.isArray(data.trainingDays)) {
      const existingDays = await Promise.all(
        data.trainingDays.map((day: { id: string }) =>
          prisma.trainingDay.findUnique({
            where: { id: day.id },
            select: { id: true, program: { select: { userId: true } } },
          })
        )
      );
      for (let i = 0; i < data.trainingDays.length; i++) {
        const day = data.trainingDays[i];
        const existing = existingDays[i];
        // SEC-001: Skip records belonging to another user
        if (existing && existing.program.userId !== user.id) continue;

        operations.push(
          prisma.trainingDay.upsert({
            where: { id: day.id },
            create: {
              id: day.id,
              programId: day.programId,
              name: day.name,
              dayNumber: day.dayNumber,
              warmup: day.warmup || [],
              supersets: day.supersets || [],
              finisher: day.finisher || [],
            },
            update: {
              name: day.name,
              dayNumber: day.dayNumber,
              warmup: day.warmup || [],
              supersets: day.supersets || [],
              finisher: day.finisher || [],
            },
          })
        );
      }
    }

    // --- Workout logs: batch ownership checks, then collect upserts ---
    if (data.workoutLogs && Array.isArray(data.workoutLogs)) {
      const existingLogs = await Promise.all(
        data.workoutLogs.map((log: { id: string }) =>
          prisma.workoutLog.findUnique({
            where: { id: log.id },
            select: { id: true, userId: true },
          })
        )
      );
      for (let i = 0; i < data.workoutLogs.length; i++) {
        const log = data.workoutLogs[i];
        const existing = existingLogs[i];
        // SEC-001: Skip records belonging to another user
        if (existing && existing.userId !== user.id) continue;

        operations.push(
          prisma.workoutLog.upsert({
            where: { id: log.id },
            create: {
              id: log.id,
              date: log.date,
              dayName: log.dayName,
              startTime: toDateRequired(log.startTime),
              endTime: toDate(log.endTime),
              duration: log.duration ?? null,
              isComplete: log.isComplete ?? false,
              sets: log.sets || [],
              notes: log.notes || null,
              programId: log.programId,
              dayId: log.dayId,
              userId: user.id,
            },
            update: {
              date: log.date,
              dayName: log.dayName,
              startTime: toDateRequired(log.startTime),
              endTime: toDate(log.endTime),
              duration: log.duration ?? null,
              isComplete: log.isComplete ?? false,
              sets: log.sets || [],
              notes: log.notes || null,
            },
          })
        );
      }
    }

    // --- Personal records: batch ownership checks, then collect upserts ---
    if (data.personalRecords && Array.isArray(data.personalRecords)) {
      const existingPRs = await Promise.all(
        data.personalRecords.map((pr: { id: string }) =>
          prisma.personalRecord.findUnique({
            where: { id: pr.id },
            select: { id: true, userId: true },
          })
        )
      );
      for (let i = 0; i < data.personalRecords.length; i++) {
        const pr = data.personalRecords[i];
        const existing = existingPRs[i];
        // SEC-001: Skip records belonging to another user
        if (existing && existing.userId !== user.id) continue;

        operations.push(
          prisma.personalRecord.upsert({
            where: { id: pr.id },
            create: {
              id: pr.id,
              exerciseName: pr.exerciseName,
              weight: pr.weight,
              reps: pr.reps,
              unit: pr.unit || "kg",
              date: pr.date,
              exerciseId: pr.exerciseId,
              workoutLogId: pr.workoutLogId,
              userId: user.id,
            },
            update: {
              exerciseName: pr.exerciseName,
              weight: pr.weight,
              reps: pr.reps,
              unit: pr.unit || "kg",
              date: pr.date,
            },
          })
        );
      }
    }

    // --- Settings: no ownership check needed (keyed by userId) ---
    if (data.settings) {
      operations.push(
        prisma.userSettings.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            weightUnit: data.settings.weightUnit || "kg",
            defaultRestSeconds: data.settings.defaultRestSeconds ?? 90,
            soundEnabled: data.settings.soundEnabled ?? true,
            autoProgressWeight: data.settings.autoProgressWeight ?? true,
            progressionIncrement: data.settings.progressionIncrement ?? 2.5,
            autoStartRestTimer: data.settings.autoStartRestTimer ?? true,
          },
          update: {
            weightUnit: data.settings.weightUnit || "kg",
            defaultRestSeconds: data.settings.defaultRestSeconds ?? 90,
            soundEnabled: data.settings.soundEnabled ?? true,
            autoProgressWeight: data.settings.autoProgressWeight ?? true,
            progressionIncrement: data.settings.progressionIncrement ?? 2.5,
            autoStartRestTimer: data.settings.autoStartRestTimer ?? true,
          },
        })
      );
    }

    // --- Onboarding profile: no ownership check needed (keyed by userId) ---
    if (data.onboardingProfile) {
      operations.push(
        prisma.onboardingProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            goals: data.onboardingProfile.goals || [],
            experienceLevel: data.onboardingProfile.experienceLevel || null,
            trainingDaysPerWeek: data.onboardingProfile.trainingDaysPerWeek ?? null,
            equipment: data.onboardingProfile.equipment || null,
            heightCm: data.onboardingProfile.heightCm ?? null,
            weightKg: data.onboardingProfile.weightKg ?? null,
            bodyFatPercent: data.onboardingProfile.bodyFatPercent ?? null,
            injuries: data.onboardingProfile.injuries || [],
            hasCompletedOnboarding: data.onboardingProfile.hasCompletedOnboarding ?? false,
            skippedOnboarding: data.onboardingProfile.skippedOnboarding ?? false,
            completedAt: toDate(data.onboardingProfile.completedAt),
          },
          update: {
            goals: data.onboardingProfile.goals || [],
            experienceLevel: data.onboardingProfile.experienceLevel || null,
            trainingDaysPerWeek: data.onboardingProfile.trainingDaysPerWeek ?? null,
            equipment: data.onboardingProfile.equipment || null,
            heightCm: data.onboardingProfile.heightCm ?? null,
            weightKg: data.onboardingProfile.weightKg ?? null,
            bodyFatPercent: data.onboardingProfile.bodyFatPercent ?? null,
            injuries: data.onboardingProfile.injuries || [],
            hasCompletedOnboarding: data.onboardingProfile.hasCompletedOnboarding ?? false,
            skippedOnboarding: data.onboardingProfile.skippedOnboarding ?? false,
            completedAt: toDate(data.onboardingProfile.completedAt),
          },
        })
      );
    }

    // --- Achievements: no per-record ownership check (keyed by userId compound) ---
    if (data.achievements && Array.isArray(data.achievements)) {
      for (const achievement of data.achievements) {
        operations.push(
          prisma.achievement.upsert({
            where: {
              userId_achievementId: {
                userId: user.id,
                achievementId: achievement.achievementId,
              },
            },
            create: {
              achievementId: achievement.achievementId,
              unlockedAt: toDateRequired(achievement.unlockedAt),
              userId: user.id,
            },
            update: {
              unlockedAt: toDateRequired(achievement.unlockedAt),
            },
          })
        );
      }
    }

    // Execute all upserts in a single database transaction (1 round trip instead of N)
    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    const syncedAt = new Date().toISOString();

    // SEC-007: Sanitize deviceId to prevent log injection
    const safeDeviceId = String(deviceId ?? "").replace(/[^\w-]/g, "").slice(0, 64);

    console.log(`[Sync] Completed sync for user ${user.id} from device ${safeDeviceId}`);

    return NextResponse.json({
      success: true,
      syncedAt,
      deviceId,
    });
  } catch (error) {
    console.error("[Sync POST] Error:", error);
    // SEC-002: Never leak error details to client
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

/**
 * GET /api/sync - Pull cloud data to local (legacy sync path)
 *
 * Returns all user data for local import.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const sinceDate = since ? toDate(since) : null;

    const [exercises, programs, trainingDays, workoutLogs, personalRecords, settings, onboardingProfile, achievements] =
      await Promise.all([
        prisma.exercise.findMany({
          where: {
            OR: [{ userId: null }, { userId: user.id }],
            ...(sinceDate ? { createdAt: { gte: sinceDate } } : {}),
          },
        }),
        prisma.program.findMany({
          where: { userId: user.id },
        }),
        prisma.trainingDay.findMany({
          where: { program: { userId: user.id } },
        }),
        prisma.workoutLog.findMany({
          where: { userId: user.id },
          orderBy: { startTime: "desc" },
        }),
        prisma.personalRecord.findMany({
          where: { userId: user.id },
        }),
        prisma.userSettings.findUnique({
          where: { userId: user.id },
        }),
        prisma.onboardingProfile.findUnique({
          where: { userId: user.id },
        }),
        prisma.achievement.findMany({
          where: { userId: user.id },
        }),
      ]);

    return NextResponse.json({
      data: {
        exercises: exercises.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        })),
        programs: programs.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        trainingDays,
        workoutLogs: workoutLogs.map((l) => ({
          ...l,
          startTime: l.startTime.toISOString(),
          endTime: l.endTime?.toISOString() || null,
        })),
        personalRecords,
        settings,
        onboardingProfile: onboardingProfile
          ? {
              ...onboardingProfile,
              completedAt: onboardingProfile.completedAt?.toISOString() || null,
            }
          : null,
        achievements: achievements.map((a) => ({
          ...a,
          unlockedAt: a.unlockedAt.toISOString(),
          createdAt: undefined,
        })),
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Sync GET] Error:", error);
    // SEC-002: Never leak error details to client
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
