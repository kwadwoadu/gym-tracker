import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/exercises/[id] - Get single exercise
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
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Check access: built-in (userId null) or user's own
    if (exercise.userId && exercise.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Update exercise
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

    // Check if exercise exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // For built-in exercises (userId = null), only allow backfill updates
    // For custom exercises, allow full updates but only by owner
    if (existing.userId === null) {
      // Built-in exercise - only allow backfill updates (builtInId, videoUrl, muscles)
      const allowedBackfillFields = ['builtInId', 'videoUrl', 'muscles'];
      const hasBackfillField = allowedBackfillFields.some(field => body[field] !== undefined);

      if (hasBackfillField) {
        const updateData: Record<string, unknown> = {};
        if (body.builtInId !== undefined) updateData.builtInId = body.builtInId;
        if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
        if (body.muscles !== undefined) updateData.muscles = body.muscles;

        const exercise = await prisma.exercise.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json(exercise);
      } else {
        return NextResponse.json(
          { error: "Cannot modify built-in exercise" },
          { status: 403 }
        );
      }
    } else if (existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Cannot modify this exercise" },
        { status: 403 }
      );
    }

    // Custom exercise owned by user - allow full updates
    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        name: body.name,
        muscleGroups: body.muscleGroups,
        muscles: body.muscles,
        equipment: body.equipment,
        videoUrl: body.videoUrl,
        builtInId: body.builtInId,
      },
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete custom exercise
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

    // Check if exercise exists and belongs to user
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Only allow deleting custom exercises that belong to user
    if (!existing.isCustom || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Cannot delete this exercise" },
        { status: 403 }
      );
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
