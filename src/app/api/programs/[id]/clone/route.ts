import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import type { Prisma } from "@prisma/client";

// POST /api/programs/[id]/clone - Clone a program
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { name: customName } = body as { name?: string };

    // Get the original program with training days
    const original = await prisma.program.findUnique({
      where: { id },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (original.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create the cloned program name
    const clonedName = customName || `${original.name} (Copy)`;

    // Create the new program with cloned training days
    const clonedProgram = await prisma.program.create({
      data: {
        name: clonedName,
        description: original.description,
        isActive: false, // Cloned programs start inactive
        userId: user.id,
        trainingDays: {
          create: original.trainingDays.map((day) => ({
            name: day.name,
            dayNumber: day.dayNumber,
            warmup: day.warmup as Prisma.InputJsonValue,
            supersets: day.supersets as Prisma.InputJsonValue,
            finisher: day.finisher as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, program: clonedProgram });
  } catch (error) {
    console.error("Error cloning program:", error);
    return NextResponse.json(
      { error: "Failed to clone program" },
      { status: 500 }
    );
  }
}
