import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/programs - List user's programs
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const programs = await prisma.program.findMany({
      where: { userId: user.id },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST /api/programs - Create new program
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isActive, trainingDays } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Program name is required" },
        { status: 400 }
      );
    }

    // If this program is active, deactivate others
    if (isActive) {
      await prisma.program.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      });
    }

    const program = await prisma.program.create({
      data: {
        name,
        description: description || null,
        isActive: isActive || false,
        userId: user.id,
        trainingDays: trainingDays
          ? {
              create: trainingDays.map(
                (
                  day: {
                    name: string;
                    dayNumber: number;
                    warmup?: unknown;
                    supersets?: unknown;
                    finisher?: unknown;
                  },
                  index: number
                ) => ({
                  name: day.name,
                  dayNumber: day.dayNumber ?? index + 1,
                  warmup: day.warmup || [],
                  supersets: day.supersets || [],
                  finisher: day.finisher || [],
                })
              ),
            }
          : undefined,
      },
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
