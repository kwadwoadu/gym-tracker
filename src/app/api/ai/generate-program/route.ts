import { getClerkId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/ai/ai-client";
import { validateProgram, type GeneratedProgram } from "@/lib/ai/validators/program-validator";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts/program-prompt";
import exercisesData from "@/data/exercises.json";

export async function POST(request: Request) {
  try {
    const userId = await getClerkId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body as {
      preferences?: {
        sessionMinutes?: number;
        focusArea?: string;
        mesocycleWeeks?: number;
      };
    };

    // Get user's onboarding profile
    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Please complete onboarding first" },
        { status: 400 }
      );
    }

    // Get workout history summary for context
    const recentLogs = await prisma.workoutLog.findMany({
      where: { userId, isComplete: true },
      orderBy: { date: "desc" },
      take: 10,
      select: {
        date: true,
        duration: true,
        sets: true,
      },
    });

    let historySummary: string | undefined;
    if (recentLogs.length > 0) {
      historySummary = `${recentLogs.length} recent workouts logged. Average duration: ${Math.round(recentLogs.reduce((a, l) => a + (l.duration || 0), 0) / recentLogs.length)} minutes.`;

      // Get PRs for context
      const prs = await prisma.personalRecord.findMany({
        where: { userId },
        take: 10,
        orderBy: { weight: "desc" },
        include: { exercise: { select: { name: true } } },
      });

      if (prs.length > 0) {
        historySummary += ` Top PRs: ${prs.slice(0, 5).map((pr) => `${pr.exercise.name} ${pr.weight}kg x${pr.reps}`).join(", ")}.`;
      }
    }

    // Build exercise reference list
    const exercises = exercisesData.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      equipment: e.equipment,
      muscleGroups: e.muscleGroups,
    }));

    // Filter by equipment if specified
    const equipmentMap: Record<string, string[]> = {
      "full gym": [], // no filter
      "home gym": ["barbell", "dumbbells", "bodyweight", "resistance_band"],
      "dumbbells only": ["dumbbells", "bodyweight"],
      "bodyweight only": ["bodyweight"],
    };

    const allowedEquipment = equipmentMap[profile.equipment || "full gym"];
    const filteredExercises =
      allowedEquipment && allowedEquipment.length > 0
        ? exercises.filter((e) => allowedEquipment.includes(e.equipment))
        : exercises;

    // Build valid exercise ID set for validation
    const validIds = new Set(exercisesData.exercises.map((e) => e.id));

    // Generate program via AI
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      profile: {
        id: profile.id,
        goals: profile.goals as string[],
        experienceLevel: profile.experienceLevel,
        trainingDaysPerWeek: profile.trainingDaysPerWeek,
        equipment: profile.equipment,
        heightCm: profile.heightCm ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg ? Number(profile.weightKg) : null,
        bodyFatPercent: profile.bodyFatPercent ? Number(profile.bodyFatPercent) : null,
        injuries: profile.injuries as string[],
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
        skippedOnboarding: profile.skippedOnboarding,
        completedAt: profile.completedAt?.toISOString() || null,
        onboardingState: (profile.onboardingState as string) || "complete",
        userId: profile.userId,
      } as import("@/lib/api-client").OnboardingProfile,
      exercises: filteredExercises,
      preferences,
      historySummary,
    });

    const generated = await generateJSON<GeneratedProgram>(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Validate the output (pass full exercise DB for substitution of unknown IDs)
    const validation = validateProgram(generated, validIds, exercises);
    if (!validation.success) {
      console.error("AI program validation failed:", validation.error);
      return NextResponse.json(
        { error: "Generated program failed validation. Please try again." },
        { status: 422 }
      );
    }

    if (Object.keys(validation.substitutions).length > 0) {
      console.log("AI program exercise substitutions:", validation.substitutions);
    }

    return NextResponse.json({ program: validation.data });
  } catch (error) {
    console.error("Program generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate program. Please try again." },
      { status: 500 }
    );
  }
}
