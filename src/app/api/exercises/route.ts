import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { enrichExercisesWithMuscles } from "@/lib/exercise-enrichment";

// GET /api/exercises - List all exercises (built-in + user custom)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get built-in exercises (userId = null) and user's custom exercises
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: { name: "asc" },
    });

    // Enrich with muscles data from exercises.json (source of truth)
    const enrichedExercises = enrichExercisesWithMuscles(exercises);

    return NextResponse.json(enrichedExercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create custom exercise
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, muscleGroups, muscles, equipment, videoUrl, builtInId } = body;

    if (!name || !equipment) {
      return NextResponse.json(
        { error: "Name and equipment are required" },
        { status: 400 }
      );
    }

    // If builtInId is provided, this is a system exercise (from seeding)
    // Otherwise it's a user's custom exercise
    const isSystemExercise = !!builtInId;

    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroups: muscleGroups || [],
        muscles: muscles || null,
        equipment,
        videoUrl: videoUrl || null,
        builtInId: builtInId || null,
        isCustom: !isSystemExercise,
        userId: isSystemExercise ? null : user.id,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
