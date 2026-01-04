import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import exercisesData from "@/data/exercises.json";
import programData from "@/data/program.json";

// Type definitions for program data
interface WarmupExercise {
  exerciseId: string;
  reps?: number;
}

interface SupersetExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  tempo?: string;
  restSeconds?: number;
}

interface Superset {
  id: string;
  label: string;
  exercises: SupersetExercise[];
}

interface FinisherExercise {
  exerciseId: string;
  duration?: number;
  reps?: number;
  notes?: string;
}

/**
 * POST /api/reset - Reset to default program using Prisma transactions
 *
 * This is a destructive operation that:
 * 1. Deletes all workout logs, PRs, programs, achievements
 * 2. Reinstalls the default Full Body program
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Reset] Starting reset for user ${user.id}`);

    // Use a transaction to ensure atomic deletion
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      // PRs reference workoutLogs, so delete PRs first
      const deletedPRs = await tx.personalRecord.deleteMany({
        where: { userId: user.id },
      });
      console.log(`[Reset] Deleted ${deletedPRs.count} personal records`);

      // Delete workout logs
      const deletedWorkouts = await tx.workoutLog.deleteMany({
        where: { userId: user.id },
      });
      console.log(`[Reset] Deleted ${deletedWorkouts.count} workout logs`);

      // Delete achievements
      const deletedAchievements = await tx.achievement.deleteMany({
        where: { userId: user.id },
      });
      console.log(`[Reset] Deleted ${deletedAchievements.count} achievements`);

      // Delete programs (cascade deletes training days)
      const deletedPrograms = await tx.program.deleteMany({
        where: { userId: user.id },
      });
      console.log(`[Reset] Deleted ${deletedPrograms.count} programs`);
    });

    // Now reinstall the default program
    console.log("[Reset] Installing default program...");

    // Get existing exercises and build ID mapping
    const existingExercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: null }, // Built-in exercises
          { userId: user.id }, // User's custom exercises
        ],
      },
    });

    const idMapping = new Map<string, string>();
    for (const ex of exercisesData.exercises) {
      // First try to match by builtInId (reliable)
      let existing = existingExercises.find((e) => e.builtInId === ex.id);
      // Fallback to name matching for legacy data
      if (!existing) {
        existing = existingExercises.find((e) => e.name === ex.name);
      }
      if (existing) {
        idMapping.set(ex.id, existing.id);
      }
    }
    console.log(`[Reset] Built ID mapping for ${idMapping.size} exercises`);

    // Map exercise IDs in training days
    const mappedTrainingDays = programData.trainingDays.map((day) => ({
      name: day.name,
      dayNumber: day.dayNumber,
      warmup: (day.warmup || []).map((w: WarmupExercise) => ({
        ...w,
        exerciseId: idMapping.get(w.exerciseId) || w.exerciseId,
      })),
      supersets: (day.supersets || []).map((ss: Superset) => ({
        ...ss,
        exercises: ss.exercises.map((ex: SupersetExercise) => ({
          ...ex,
          exerciseId: idMapping.get(ex.exerciseId) || ex.exerciseId,
        })),
      })),
      finisher: (day.finisher || []).map((f: FinisherExercise) => ({
        ...f,
        exerciseId: idMapping.get(f.exerciseId) || f.exerciseId,
      })),
    }));

    // Create the default program with training days
    const program = await prisma.program.create({
      data: {
        name: programData.program.name,
        description: programData.program.description,
        isActive: true,
        userId: user.id,
        trainingDays: {
          create: mappedTrainingDays.map((day) => ({
            name: day.name,
            dayNumber: day.dayNumber,
            warmup: day.warmup,
            supersets: day.supersets,
            finisher: day.finisher,
          })),
        },
      },
      include: {
        trainingDays: true,
      },
    });

    console.log(`[Reset] Installed program: ${program.name} with ${program.trainingDays.length} training days`);

    return NextResponse.json({
      success: true,
      message: "Reset to default program successfully",
      program: {
        id: program.id,
        name: program.name,
        trainingDays: program.trainingDays.length,
      },
    });
  } catch (error) {
    console.error("[Reset] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset", details: String(error) },
      { status: 500 }
    );
  }
}
