import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { toDate, toDateRequired } from "@/lib/db/utils";

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

    // Sync exercises - explicit field mapping with date conversion
    if (data.exercises && Array.isArray(data.exercises)) {
      for (const exercise of data.exercises) {
        await prisma.exercise.upsert({
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
        });
      }
    }

    // Sync programs - explicit field mapping with date conversion
    if (data.programs && Array.isArray(data.programs)) {
      for (const program of data.programs) {
        await prisma.program.upsert({
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
        });
      }
    }

    // Sync training days - explicit field mapping (no date fields on this model)
    if (data.trainingDays && Array.isArray(data.trainingDays)) {
      for (const day of data.trainingDays) {
        await prisma.trainingDay.upsert({
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
        });
      }
    }

    // Sync workout logs - explicit field mapping with date conversion
    if (data.workoutLogs && Array.isArray(data.workoutLogs)) {
      for (const log of data.workoutLogs) {
        await prisma.workoutLog.upsert({
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
        });
      }
    }

    // Sync personal records - explicit field mapping (date is a string field in schema)
    if (data.personalRecords && Array.isArray(data.personalRecords)) {
      for (const pr of data.personalRecords) {
        await prisma.personalRecord.upsert({
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
        });
      }
    }

    // Sync settings - explicit field mapping (no date fields on this model)
    if (data.settings) {
      await prisma.userSettings.upsert({
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
      });
    }

    // Sync onboarding profile - explicit field mapping with date conversion
    if (data.onboardingProfile) {
      await prisma.onboardingProfile.upsert({
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
      });
    }

    // Sync achievements - explicit field mapping with date conversion
    if (data.achievements && Array.isArray(data.achievements)) {
      for (const achievement of data.achievements) {
        await prisma.achievement.upsert({
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
        });
      }
    }

    const syncedAt = new Date().toISOString();

    console.log(`[Sync] Completed sync for user ${user.id} from device ${deviceId}`);

    return NextResponse.json({
      success: true,
      syncedAt,
      deviceId,
    });
  } catch (error) {
    console.error("[Sync POST] Error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
