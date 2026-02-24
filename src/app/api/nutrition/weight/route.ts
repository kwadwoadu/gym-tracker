import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";

// GET /api/nutrition/weight - Get weight logs for last N days with trend data
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
    const days = parseInt(searchParams.get("days") || "90", 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

    const logs = await prisma.weightLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: cutoffDateStr,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate trend data
    const trend = calculateTrend(logs);

    return NextResponse.json({ logs, trend });
  } catch (error) {
    console.error("Error fetching weight logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight logs" },
      { status: 500 }
    );
  }
}

// POST /api/nutrition/weight - Create or update weight log for a date
export async function POST(request: Request) {
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
    const { date, weightKg, source, notes } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    if (weightKg === undefined || weightKg === null || typeof weightKg !== "number") {
      return NextResponse.json(
        { error: "weightKg is required and must be a number" },
        { status: 400 }
      );
    }

    const log = await prisma.weightLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {
        weightKg,
        ...(source !== undefined && { source }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId: user.id,
        date,
        weightKg,
        source: source ?? "manual",
        notes: notes ?? null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error updating weight log:", error);
    return NextResponse.json(
      { error: "Failed to update weight log" },
      { status: 500 }
    );
  }
}

// DELETE /api/nutrition/weight - Delete a weight log by ID
export async function DELETE(request: Request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Weight log ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const existing = await prisma.weightLog.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Weight log not found" },
        { status: 404 }
      );
    }

    await prisma.weightLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting weight log:", error);
    return NextResponse.json(
      { error: "Failed to delete weight log" },
      { status: 500 }
    );
  }
}

// Calculate trend data from weight logs (already sorted by date DESC)
function calculateTrend(logs: { weightKg: number; date: string }[]) {
  if (logs.length === 0) {
    return {
      current: null,
      sevenDayAvg: null,
      fourteenDayAvg: null,
      thirtyDayAvg: null,
      weeklyChange: null,
    };
  }

  const current = logs[0].weightKg;

  const sevenDayEntries = logs.slice(0, 7);
  const fourteenDayEntries = logs.slice(0, 14);
  const thirtyDayEntries = logs.slice(0, 30);

  const avg = (entries: { weightKg: number }[]) =>
    entries.length > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + e.weightKg, 0) / entries.length) *
            100
        ) / 100
      : null;

  const sevenDayAvg = avg(sevenDayEntries);
  const fourteenDayAvg = avg(fourteenDayEntries);
  const thirtyDayAvg = avg(thirtyDayEntries);

  const weeklyChange =
    sevenDayAvg !== null && fourteenDayAvg !== null && fourteenDayEntries.length >= 8
      ? Math.round((sevenDayAvg - fourteenDayAvg) * 100) / 100
      : null;

  return {
    current,
    sevenDayAvg,
    fourteenDayAvg,
    thirtyDayAvg,
    weeklyChange,
  };
}
