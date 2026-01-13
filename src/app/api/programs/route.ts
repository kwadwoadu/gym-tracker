import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/programs - List user's programs
// Query params:
//   ?includeArchived=true  - Include archived programs
//   ?archivedOnly=true     - Only return archived programs
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const archivedOnly = searchParams.get("archivedOnly") === "true";

    // Build where clause based on filter params
    type WhereClause = {
      userId: string;
      archivedAt?: null | { not: null };
    };
    const where: WhereClause = { userId: user.id };

    if (archivedOnly) {
      // Only archived programs
      where.archivedAt = { not: null };
    } else if (!includeArchived) {
      // Default: exclude archived programs
      where.archivedAt = null;
    }
    // If includeArchived=true, don't filter by archivedAt (show all)

    const programs = await prisma.program.findMany({
      where,
      include: {
        trainingDays: {
          orderBy: { dayNumber: "asc" },
        },
        _count: {
          select: { workoutLogs: true },
        },
        workoutLogs: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: [
        { isActive: "desc" }, // Active first
        { archivedAt: "asc" }, // Non-archived before archived
        { createdAt: "desc" }, // Then by creation date
      ],
    });

    // Transform to include workoutCount and lastWorkoutDate at top level
    const programsWithCount = programs.map((program) => ({
      ...program,
      workoutCount: program._count.workoutLogs,
      lastWorkoutDate: program.workoutLogs[0]?.date ?? null,
      _count: undefined, // Remove the nested _count
      workoutLogs: undefined, // Remove the nested workoutLogs
    }));

    return NextResponse.json(programsWithCount);
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

    // Log incoming data for debugging
    console.log(`[POST /api/programs] Creating program "${name}" for user ${user.id}`);
    console.log(`[POST /api/programs] Received ${trainingDays?.length || 0} training days`);
    if (trainingDays) {
      trainingDays.forEach((day: { name: string; supersets?: unknown[]; warmup?: unknown[]; finisher?: unknown[] }, i: number) => {
        const supersetCount = Array.isArray(day.supersets) ? day.supersets.length : 0;
        const warmupCount = Array.isArray(day.warmup) ? day.warmup.length : 0;
        const finisherCount = Array.isArray(day.finisher) ? day.finisher.length : 0;
        console.log(`[POST /api/programs] Day ${i + 1} "${day.name}": ${supersetCount} supersets, ${warmupCount} warmup, ${finisherCount} finisher`);
        if (supersetCount === 0) {
          console.warn(`[POST /api/programs] WARNING: Day ${i + 1} has no supersets in request!`);
        }
      });
    }

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

    // Log created data for verification
    console.log(`[POST /api/programs] Program created: ${program.id}`);
    if (program.trainingDays) {
      program.trainingDays.forEach((day, i) => {
        const supersets = day.supersets as unknown[];
        const supersetCount = Array.isArray(supersets) ? supersets.length : 0;
        console.log(`[POST /api/programs] Created Day ${i + 1} "${day.name}": ${supersetCount} supersets stored`);
        if (supersetCount === 0) {
          console.error(`[POST /api/programs] ERROR: Day ${i + 1} has no supersets after save!`);
        }
      });
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("[POST /api/programs] Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
