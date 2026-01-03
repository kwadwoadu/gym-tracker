import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/training-days - List training days (optionally filter by program)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    const trainingDays = await prisma.trainingDay.findMany({
      where: {
        program: {
          userId: user.id,
          ...(programId ? { id: programId } : {}),
        },
      },
      orderBy: { dayNumber: "asc" },
    });

    return NextResponse.json(trainingDays);
  } catch (error) {
    console.error("Error fetching training days:", error);
    return NextResponse.json(
      { error: "Failed to fetch training days" },
      { status: 500 }
    );
  }
}

// POST /api/training-days - Create new training day
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId, name, dayNumber, warmup, supersets, finisher } = body;

    if (!programId || !name) {
      return NextResponse.json(
        { error: "Program ID and name are required" },
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

    // Get next day number if not provided
    let nextDayNumber = dayNumber;
    if (!nextDayNumber) {
      const maxDay = await prisma.trainingDay.findFirst({
        where: { programId },
        orderBy: { dayNumber: "desc" },
      });
      nextDayNumber = (maxDay?.dayNumber || 0) + 1;
    }

    const trainingDay = await prisma.trainingDay.create({
      data: {
        name,
        dayNumber: nextDayNumber,
        programId,
        warmup: warmup || [],
        supersets: supersets || [],
        finisher: finisher || [],
      },
    });

    return NextResponse.json(trainingDay, { status: 201 });
  } catch (error) {
    console.error("Error creating training day:", error);
    return NextResponse.json(
      { error: "Failed to create training day" },
      { status: 500 }
    );
  }
}
