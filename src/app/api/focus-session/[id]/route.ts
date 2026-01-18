import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/focus-session/[id] - Get single focus session
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching focus session:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus session" },
      { status: 500 }
    );
  }
}

// PUT /api/focus-session/[id] - Update focus session
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { exercises, sets, notes, focusArea } = body;

    // Verify ownership
    const existing = await prisma.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existing.isComplete) {
      return NextResponse.json(
        { error: "Cannot update a completed session" },
        { status: 400 }
      );
    }

    const session = await prisma.focusSession.update({
      where: { id },
      data: {
        ...(exercises !== undefined && { exercises }),
        ...(sets !== undefined && { sets }),
        ...(notes !== undefined && { notes }),
        ...(focusArea !== undefined && { focusArea }),
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error updating focus session:", error);
    return NextResponse.json(
      { error: "Failed to update focus session" },
      { status: 500 }
    );
  }
}

// DELETE /api/focus-session/[id] - Delete focus session
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.focusSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting focus session:", error);
    return NextResponse.json(
      { error: "Failed to delete focus session" },
      { status: 500 }
    );
  }
}
