import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// PUT /api/nutrition/custom-supplements/[id] - Update a custom supplement
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

    // Verify ownership
    const existing = await prisma.customSupplement.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
    }

    const supplement = await prisma.customSupplement.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.dose !== undefined && { dose: body.dose }),
        ...(body.timing !== undefined && { timing: body.timing }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(supplement);
  } catch (error) {
    console.error("Error updating custom supplement:", error);
    return NextResponse.json(
      { error: "Failed to update custom supplement" },
      { status: 500 }
    );
  }
}

// DELETE /api/nutrition/custom-supplements/[id] - Delete a custom supplement
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

    // Verify ownership
    const existing = await prisma.customSupplement.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
    }

    await prisma.customSupplement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom supplement:", error);
    return NextResponse.json(
      { error: "Failed to delete custom supplement" },
      { status: 500 }
    );
  }
}
