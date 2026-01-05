import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";

// GET /api/nutrition/stats - Get weekly compliance stats
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
    const weeks = parseInt(searchParams.get("weeks") || "1");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    // Format dates as YYYY-MM-DD
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Get all logs in range
    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDateStr,
          lte: endDateStr,
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const totalDays = logs.length;
    const proteinDays = logs.filter((log) => log.hitProteinGoal).length;
    const calorieDays = logs.filter((log) => log.caloriesOnTarget).length;

    // Calculate week-by-week breakdown
    const weeklyBreakdown: Array<{
      weekStart: string;
      weekEnd: string;
      proteinCompliance: number;
      calorieCompliance: number;
      daysLogged: number;
    }> = [];

    for (let w = 0; w < weeks; w++) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (w * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const weekLogs = logs.filter(
        (log) => log.date >= weekStartStr && log.date <= weekEndStr
      );

      const weekProtein = weekLogs.filter((log) => log.hitProteinGoal).length;
      const weekCalories = weekLogs.filter((log) => log.caloriesOnTarget).length;

      weeklyBreakdown.push({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        proteinCompliance: weekLogs.length > 0 ? Math.round((weekProtein / 7) * 100) : 0,
        calorieCompliance: weekLogs.length > 0 ? Math.round((weekCalories / 7) * 100) : 0,
        daysLogged: weekLogs.length,
      });
    }

    // Current streak
    let proteinStreak = 0;
    let calorieStreak = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    for (const log of sortedLogs) {
      if (log.hitProteinGoal) {
        proteinStreak++;
      } else {
        break;
      }
    }

    for (const log of sortedLogs) {
      if (log.caloriesOnTarget) {
        calorieStreak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      period: {
        startDate: startDateStr,
        endDate: endDateStr,
        weeks,
      },
      overall: {
        totalDays,
        proteinDays,
        calorieDays,
        proteinCompliance: totalDays > 0 ? Math.round((proteinDays / totalDays) * 100) : 0,
        calorieCompliance: totalDays > 0 ? Math.round((calorieDays / totalDays) * 100) : 0,
      },
      streaks: {
        proteinStreak,
        calorieStreak,
      },
      weeklyBreakdown,
      recentLogs: logs.slice(0, 7), // Last 7 logs
    });
  } catch (error) {
    console.error("Error fetching nutrition stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition stats" },
      { status: 500 }
    );
  }
}
