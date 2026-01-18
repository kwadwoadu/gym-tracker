import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/focus-session - List focus sessions
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isComplete = searchParams.get("isComplete");

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
        ...(isComplete !== null && { isComplete: isComplete === "true" }),
      },
      orderBy: { startTime: "desc" },
      take: limit,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 }
    );
  }
}

// POST /api/focus-session - Create new focus session
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { focusArea, exercises, date, notes } = body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: "At least one exercise is required" },
        { status: 400 }
      );
    }

    // Check for existing incomplete session
    const existingSession = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        isComplete: false,
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "You already have an active focus session", existingId: existingSession.id },
        { status: 409 }
      );
    }

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        date: date || new Date().toISOString().split("T")[0],
        focusArea: focusArea || null,
        exercises,
        sets: [],
        notes: notes || null,
        isComplete: false,
        startTime: new Date(),
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);
    return NextResponse.json(
      { error: "Failed to create focus session" },
      { status: 500 }
    );
  }
}
