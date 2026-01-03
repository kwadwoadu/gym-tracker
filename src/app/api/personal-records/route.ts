import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/personal-records - List all PRs, optionally by exercise
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get("exerciseId");

    const personalRecords = await prisma.personalRecord.findMany({
      where: {
        userId: user.id,
        ...(exerciseId ? { exerciseId } : {}),
      },
      include: {
        exercise: {
          select: { name: true, muscleGroups: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(personalRecords);
  } catch (error) {
    console.error("Error fetching personal records:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal records" },
      { status: 500 }
    );
  }
}

// POST /api/personal-records - Create new PR
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseId, exerciseName, weight, reps, unit, date, workoutLogId } =
      body;

    if (!exerciseId || !exerciseName || !weight || !reps || !workoutLogId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const personalRecord = await prisma.personalRecord.create({
      data: {
        exerciseId,
        exerciseName,
        weight,
        reps,
        unit: unit || "kg",
        date: date || new Date().toISOString().split("T")[0],
        workoutLogId,
        userId: user.id,
      },
      include: {
        exercise: {
          select: { name: true, muscleGroups: true },
        },
      },
    });

    return NextResponse.json(personalRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating personal record:", error);
    return NextResponse.json(
      { error: "Failed to create personal record" },
      { status: 500 }
    );
  }
}
