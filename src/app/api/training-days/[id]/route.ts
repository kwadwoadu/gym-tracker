import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/training-days/[id] - Get single training day
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
    const trainingDay = await prisma.trainingDay.findUnique({
      where: { id },
      include: {
        program: {
          select: { userId: true, name: true },
        },
      },
    });

    if (!trainingDay) {
      return NextResponse.json(
        { error: "Training day not found" },
        { status: 404 }
      );
    }

    if (trainingDay.program.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(trainingDay);
  } catch (error) {
    console.error("Error fetching training day:", error);
    return NextResponse.json(
      { error: "Failed to fetch training day" },
      { status: 500 }
    );
  }
}

// PUT /api/training-days/[id] - Update training day
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

    // Check ownership via program
    const existing = await prisma.trainingDay.findUnique({
      where: { id },
      include: {
        program: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Training day not found" },
        { status: 404 }
      );
    }

    if (existing.program.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trainingDay = await prisma.trainingDay.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        dayNumber:
          body.dayNumber !== undefined ? body.dayNumber : existing.dayNumber,
        warmup: body.warmup !== undefined ? body.warmup : existing.warmup,
        supersets:
          body.supersets !== undefined ? body.supersets : existing.supersets,
        finisher:
          body.finisher !== undefined ? body.finisher : existing.finisher,
      },
    });

    return NextResponse.json(trainingDay);
  } catch (error) {
    console.error("Error updating training day:", error);
    return NextResponse.json(
      { error: "Failed to update training day" },
      { status: 500 }
    );
  }
}

// DELETE /api/training-days/[id] - Delete training day
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

    // Check ownership via program
    const existing = await prisma.trainingDay.findUnique({
      where: { id },
      include: {
        program: {
          select: { userId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Training day not found" },
        { status: 404 }
      );
    }

    if (existing.program.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.trainingDay.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting training day:", error);
    return NextResponse.json(
      { error: "Failed to delete training day" },
      { status: 500 }
    );
  }
}
