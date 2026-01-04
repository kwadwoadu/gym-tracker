import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/workout-logs - List workout logs with optional filters
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const programId = searchParams.get("programId");
    const dayId = searchParams.get("dayId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isComplete = searchParams.get("isComplete");

    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        ...(programId ? { programId } : {}),
        ...(dayId ? { dayId } : {}),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
        ...(isComplete !== null ? { isComplete: isComplete === "true" } : {}),
      },
      include: {
        day: {
          select: { name: true, dayNumber: true },
        },
        program: {
          select: { name: true },
        },
      },
      orderBy: { startTime: "desc" },
      take: limit,
    });

    return NextResponse.json(workoutLogs);
  } catch (error) {
    console.error("Error fetching workout logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout logs" },
      { status: 500 }
    );
  }
}

// POST /api/workout-logs - Create new workout log (start or save completed workout)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      programId,
      dayId,
      dayName,
      date,
      startTime,
      endTime,
      duration,
      isComplete,
      sets,
    } = body;

    if (!programId || !dayId || !dayName) {
      return NextResponse.json(
        { error: "Program ID, day ID, and day name are required" },
        { status: 400 }
      );
    }

    // Verify program belongs to user
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || program.userId !== user.id) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const workoutLog = await prisma.workoutLog.create({
      data: {
        date: date || new Date().toISOString().split("T")[0],
        dayName,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
        duration: duration ?? null,
        isComplete: isComplete ?? false,
        sets: sets ?? [],
        programId,
        dayId,
        userId: user.id,
      },
      include: {
        day: {
          select: { name: true, dayNumber: true, warmup: true, supersets: true, finisher: true },
        },
        program: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(workoutLog, { status: 201 });
  } catch (error) {
    console.error("Error creating workout log:", error);
    return NextResponse.json(
      { error: "Failed to create workout log" },
      { status: 500 }
    );
  }
}
