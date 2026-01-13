import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/programs/[id] - Get single program with training days
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
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (program.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

// PUT /api/programs/[id] - Update program
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
    const existing = await prisma.program.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If setting this program as active, deactivate others
    if (body.isActive && !existing.isActive) {
      await prisma.program.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive,
      },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/[id] - Soft delete (archive) program
// For permanent deletion, use ?permanent=true query param
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Check ownership
    const existing = await prisma.program.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (permanent) {
      // Permanent deletion - only allowed for already archived programs
      if (!existing.archivedAt) {
        return NextResponse.json(
          { error: "Program must be archived before permanent deletion" },
          { status: 400 }
        );
      }

      // Hard delete - cascade will handle training days
      // WorkoutLogs will have programId set to null due to SetNull
      await prisma.program.delete({
        where: { id },
      });

      return NextResponse.json({ success: true, permanent: true });
    } else {
      // Soft delete (archive) - default behavior
      if (existing.archivedAt) {
        return NextResponse.json(
          { error: "Program is already archived. Use ?permanent=true for permanent deletion" },
          { status: 400 }
        );
      }

      // Denormalize program name to workout logs before archiving
      await prisma.workoutLog.updateMany({
        where: { programId: id, programName: null },
        data: { programName: existing.name },
      });

      // If active, deactivate
      const updateData: { archivedAt: Date; isActive?: boolean } = {
        archivedAt: new Date(),
      };
      if (existing.isActive) {
        updateData.isActive = false;
      }

      await prisma.program.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, archived: true });
    }
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
