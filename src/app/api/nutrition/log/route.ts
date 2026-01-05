import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";

// GET /api/nutrition/log - Get nutrition log for a specific date
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

    const log = await prisma.nutritionLog.findUnique({
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
        hitProteinGoal: false,
        caloriesOnTarget: false,
        notes: null,
      });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error fetching nutrition log:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition log" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/log - Create or update nutrition log for a date
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
    const { date, hitProteinGoal, caloriesOnTarget, notes } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const log = await prisma.nutritionLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {
        ...(hitProteinGoal !== undefined && { hitProteinGoal }),
        ...(caloriesOnTarget !== undefined && { caloriesOnTarget }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId: user.id,
        date,
        hitProteinGoal: hitProteinGoal ?? false,
        caloriesOnTarget: caloriesOnTarget ?? false,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error updating nutrition log:", error);
    return NextResponse.json(
      { error: "Failed to update nutrition log" },
      { status: 500 }
    );
  }
}
