import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

interface SetLog {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  setNumber: number;
}

// GET /api/stats - Get workout statistics
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // week, month, year, all

    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get workout logs for period
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        isComplete: true,
        ...(startDate
          ? {
              startTime: { gte: startDate },
            }
          : {}),
      },
      orderBy: { startTime: "desc" },
    });

    // Get personal records
    const personalRecords = await prisma.personalRecord.findMany({
      where: {
        userId: user.id,
        ...(startDate
          ? {
              date: { gte: startDate.toISOString().split("T")[0] },
            }
          : {}),
      },
      include: {
        exercise: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const totalWorkouts = workoutLogs.length;
    const totalDuration = workoutLogs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0
    );
    const avgDuration =
      totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Calculate total volume (weight * reps across all sets)
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    workoutLogs.forEach((log) => {
      const sets = log.sets as unknown as SetLog[];
      if (Array.isArray(sets)) {
        sets.forEach((set) => {
          totalSets++;
          totalReps += set.reps || 0;
          totalVolume += (set.weight || 0) * (set.reps || 0);
        });
      }
    });

    // Get workout frequency by day of week
    const dayFrequency = new Array(7).fill(0);
    workoutLogs.forEach((log) => {
      const day = log.startTime.getDay();
      dayFrequency[day]++;
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    const workoutDates = [
      ...new Set(workoutLogs.map((log) => log.date)),
    ].sort();

    for (let i = workoutDates.length - 1; i >= 0; i--) {
      const workoutDate = new Date(workoutDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - (workoutDates.length - 1 - i));

      if (workoutDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate this week's workout count (always based on current week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekLogs = await prisma.workoutLog.findMany({
      where: {
        userId: user.id,
        isComplete: true,
        startTime: { gte: startOfWeek },
      },
    });
    const thisWeekCount = new Set(thisWeekLogs.map((log) => log.date)).size;

    return NextResponse.json({
      period,
      totalWorkouts,
      totalDuration,
      avgDuration,
      totalVolume: Math.round(totalVolume),
      totalSets,
      totalReps,
      dayFrequency,
      currentStreak,
      thisWeekCount,
      personalRecordsCount: personalRecords.length,
      recentPRs: personalRecords.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
