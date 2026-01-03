import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/workout-logs/[id] - Get single workout log
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        day: {
          select: {
            name: true,
            dayNumber: true,
            warmup: true,
            supersets: true,
            finisher: true,
          },
        },
        program: {
          select: { name: true },
        },
        personalRecords: true,
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (workoutLog.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error("Error fetching workout log:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout log" },
      { status: 500 }
    );
  }
}

// PUT /api/workout-logs/[id] - Update workout log (add sets, complete, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate duration if completing
    let duration = existing.duration;
    if (body.isComplete && !existing.isComplete) {
      const endTime = new Date();
      duration = Math.round(
        (endTime.getTime() - existing.startTime.getTime()) / 60000
      );
    }

    const workoutLog = await prisma.workoutLog.update({
      where: { id },
      data: {
        sets: body.sets !== undefined ? body.sets : existing.sets,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        isComplete:
          body.isComplete !== undefined ? body.isComplete : existing.isComplete,
        endTime:
          body.isComplete && !existing.isComplete ? new Date() : existing.endTime,
        duration,
      },
      include: {
        day: {
          select: { name: true, dayNumber: true },
        },
        program: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error("Error updating workout log:", error);
    return NextResponse.json(
      { error: "Failed to update workout log" },
      { status: 500 }
    );
  }
}

// DELETE /api/workout-logs/[id] - Delete workout log
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workoutLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout log:", error);
    return NextResponse.json(
      { error: "Failed to delete workout log" },
      { status: 500 }
    );
  }
}
