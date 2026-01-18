import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// Muscle group mappings for focus areas
const FOCUS_AREA_TO_MUSCLES: Record<string, string[]> = {
  chest: ["chest", "pectoralis major", "pecs"],
  back: ["back", "lats", "latissimus dorsi", "traps", "trapezius", "rhomboids"],
  legs: ["legs", "quadriceps", "quads", "hamstrings", "glutes", "calves"],
  shoulders: ["shoulders", "deltoids", "delts", "lateral delts", "front delts", "rear delts"],
  arms: ["arms", "biceps", "triceps", "forearms"],
  core: ["core", "abs", "abdominals", "obliques"],
  full_body: [], // Will include all exercises
};

interface SetLog {
  exerciseId: string;
  exerciseName?: string;
}

// GET /api/focus-session/recommend - Get exercise recommendations
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const focusArea = searchParams.get("focusArea")?.toLowerCase() || "full_body";
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const targetMuscles = FOCUS_AREA_TO_MUSCLES[focusArea] || [];

    // Get all exercises
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null },
        ],
      },
      select: {
        id: true,
        name: true,
        muscleGroups: true,
        equipment: true,
      },
    });

    // Filter exercises by focus area (if not full_body)
    let filteredExercises = exercises;
    if (targetMuscles.length > 0) {
      filteredExercises = exercises.filter((ex) =>
        ex.muscleGroups.some((mg) =>
          targetMuscles.some((tm) => mg.toLowerCase().includes(tm))
        )
      );
    }

    // Fallback: if no exercises match the focus area, use all exercises
    if (filteredExercises.length === 0 && exercises.length > 0) {
      filteredExercises = exercises;
    }

    // Get user's workout history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    // Get workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        date: { gte: dateStr },
        isComplete: true,
      },
      select: {
        date: true,
        sets: true,
      },
      orderBy: { date: "desc" },
    });

    // Get focus session history
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        date: { gte: dateStr },
        isComplete: true,
      },
      select: {
        date: true,
        sets: true,
      },
      orderBy: { date: "desc" },
    });

    // Build exercise usage map: { exerciseId: { count, lastUsed } }
    const usageMap = new Map<string, { count: number; lastUsed: string | null }>();

    // Process workout logs
    for (const log of workoutLogs) {
      const sets = log.sets as unknown as SetLog[];
      for (const set of sets) {
        if (!set.exerciseId) continue;
        const existing = usageMap.get(set.exerciseId);
        if (existing) {
          existing.count += 1;
          if (!existing.lastUsed || log.date > existing.lastUsed) {
            existing.lastUsed = log.date;
          }
        } else {
          usageMap.set(set.exerciseId, { count: 1, lastUsed: log.date });
        }
      }
    }

    // Process focus sessions
    for (const session of focusSessions) {
      const sets = session.sets as unknown as SetLog[];
      for (const set of sets) {
        if (!set.exerciseId) continue;
        const existing = usageMap.get(set.exerciseId);
        if (existing) {
          existing.count += 1;
          if (!existing.lastUsed || session.date > existing.lastUsed) {
            existing.lastUsed = session.date;
          }
        } else {
          usageMap.set(set.exerciseId, { count: 1, lastUsed: session.date });
        }
      }
    }

    // Check if user has any workout history
    const hasWorkoutHistory = usageMap.size > 0;

    // Score exercises: higher score = more recommended
    // Scoring factors:
    // - Usage frequency (positive) - exercises user knows and has done
    // - Days since last used (positive if > 3 days) - avoid repeating too often
    // - Equipment variety bonus
    // - For new users: prioritize compound movements and muscle group relevance
    const today = new Date();
    const recommendations = filteredExercises.map((ex) => {
      const usage = usageMap.get(ex.id) || { count: 0, lastUsed: null };

      let score = 0;

      if (hasWorkoutHistory) {
        // Experienced user scoring
        // Frequency bonus: exercises the user has used before
        score += Math.min(usage.count * 2, 20);

        // Recency factor: boost exercises not done recently
        if (usage.lastUsed) {
          const lastDate = new Date(usage.lastUsed);
          const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince > 7) {
            score += 10;
          } else if (daysSince > 3) {
            score += 5;
          }
        } else {
          // Never used before - small bonus to encourage variety
          score += 3;
        }
      } else {
        // New user scoring - prioritize muscle group relevance
        // Give higher scores to exercises that match more target muscles
        if (targetMuscles.length > 0) {
          const matchCount = ex.muscleGroups.filter((mg) =>
            targetMuscles.some((tm) => mg.toLowerCase().includes(tm))
          ).length;
          score += matchCount * 10;
        }

        // Slight randomization for variety
        score += Math.random() * 5;
      }

      // Compound movement bonus (more muscle groups = higher score)
      score += ex.muscleGroups.length * 2;

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroups: ex.muscleGroups,
        equipment: ex.equipment,
        lastUsed: usage.lastUsed,
        usageCount: usage.count,
        score,
      };
    });

    // Sort by score descending and take top recommendations
    recommendations.sort((a, b) => b.score - a.score);

    // Ensure variety in equipment
    const diverseRecommendations = [];

    for (const rec of recommendations) {
      if (diverseRecommendations.length >= limit) break;

      // Allow up to 2 of the same equipment type
      const eqKey = rec.equipment.toLowerCase();
      const eqCount = [...diverseRecommendations].filter(
        (r) => r.equipment.toLowerCase() === eqKey
      ).length;

      if (eqCount < 2 || diverseRecommendations.length < limit - 2) {
        diverseRecommendations.push(rec);
      }
    }

    return NextResponse.json(diverseRecommendations);
  } catch (error) {
    console.error("Error getting exercise recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
