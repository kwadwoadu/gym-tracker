import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";

// GET /api/nutrition/supplements - Get supplement log for a specific date
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature gate check
    if (!canAccessNutrition(user.email)) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const log = await prisma.supplementLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    // Return empty defaults if no log exists
    if (!log) {
      return NextResponse.json({
        date,
        dayType: "rest",
        completed: [],
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error fetching supplement log:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplement log" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/supplements - Create or update supplement log for a date
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature gate check
    if (!canAccessNutrition(user.email)) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 });
    }

    const body = await request.json();
    const { date, dayType, completed } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const log = await prisma.supplementLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {
        ...(dayType !== undefined && { dayType }),
        ...(completed !== undefined && { completed }),
      },
      create: {
        userId: user.id,
        date,
        dayType: dayType ?? "rest",
        completed: completed ?? [],
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error updating supplement log:", error);
    return NextResponse.json(
      { error: "Failed to update supplement log" },
      { status: 500 }
    );
  }
}
