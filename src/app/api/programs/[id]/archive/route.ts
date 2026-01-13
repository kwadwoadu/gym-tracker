import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// PUT /api/programs/[id]/archive - Archive or restore a program
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
    const { action } = body as { action: "archive" | "restore" };

    if (!action || !["archive", "restore"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'archive' or 'restore'" },
        { status: 400 }
      );
    }

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

    if (action === "archive") {
      // Cannot archive an already archived program
      if (existing.archivedAt) {
        return NextResponse.json(
          { error: "Program is already archived" },
          { status: 400 }
        );
      }

      // If this is the active program, deactivate it first
      const updateData: { archivedAt: Date; isActive?: boolean } = {
        archivedAt: new Date(),
      };
      if (existing.isActive) {
        updateData.isActive = false;
      }

      // Denormalize program name to workout logs before archiving
      await prisma.workoutLog.updateMany({
        where: { programId: id, programName: null },
        data: { programName: existing.name },
      });

      const program = await prisma.program.update({
        where: { id },
        data: updateData,
        include: {
          trainingDays: {
            orderBy: { dayNumber: "asc" },
          },
        },
      });

      return NextResponse.json({ success: true, program });
    } else {
      // Restore
      if (!existing.archivedAt) {
        return NextResponse.json(
          { error: "Program is not archived" },
          { status: 400 }
        );
      }

      const program = await prisma.program.update({
        where: { id },
        data: { archivedAt: null },
        include: {
          trainingDays: {
            orderBy: { dayNumber: "asc" },
          },
        },
      });

      return NextResponse.json({ success: true, program });
    }
  } catch (error) {
    console.error("Error archiving/restoring program:", error);
    return NextResponse.json(
      { error: "Failed to archive/restore program" },
      { status: 500 }
    );
  }
}
