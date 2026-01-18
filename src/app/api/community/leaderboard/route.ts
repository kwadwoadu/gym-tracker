import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/leaderboard - Get weekly leaderboard (friends only)
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get("metric") || "workouts";

    // Get users the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    // Include self in leaderboard
    const userIds = [user.id, ...followingIds];

    // Calculate date range (this week)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekStartStr = startOfWeek.toISOString().split("T")[0];

    let leaderboard: { userId: string; value: number }[] = [];

    if (metric === "workouts") {
      // Count completed workouts this week
      const workoutCounts = await prisma.workoutLog.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          date: { gte: weekStartStr },
          isComplete: true,
        },
        _count: { id: true },
      });

      leaderboard = workoutCounts.map((w) => ({
        userId: w.userId,
        value: w._count.id,
      }));
    } else if (metric === "volume") {
      // Calculate total volume this week
      const workouts = await prisma.workoutLog.findMany({
        where: {
          userId: { in: userIds },
          date: { gte: weekStartStr },
          isComplete: true,
        },
        select: {
          userId: true,
          sets: true,
        },
      });

      const volumeByUser: Record<string, number> = {};
      for (const workout of workouts) {
        const sets = workout.sets as Array<{ weight?: number; actualReps?: number }>;
        const volume = sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.actualReps || 0)), 0);
        volumeByUser[workout.userId] = (volumeByUser[workout.userId] || 0) + volume;
      }

      leaderboard = Object.entries(volumeByUser).map(([userId, value]) => ({
        userId,
        value,
      }));
    } else if (metric === "streak") {
      // Get current streak for each user
      for (const userId of userIds) {
        const workouts = await prisma.workoutLog.findMany({
          where: { userId, isComplete: true },
          orderBy: { date: "desc" },
          select: { date: true },
        });

        let streak = 0;
        const today = new Date().toISOString().split("T")[0];
        let checkDate = today;

        for (let i = 0; i < workouts.length; i++) {
          if (workouts[i].date === checkDate) {
            streak++;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split("T")[0];
          } else if (workouts[i].date < checkDate) {
            break;
          }
        }

        leaderboard.push({ userId, value: streak });
      }
    }

    // Sort by value descending
    leaderboard.sort((a, b) => b.value - a.value);

    // Get profiles for users
    const profiles = await prisma.userProfile.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const result = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      displayName: profileMap.get(entry.userId)?.displayName || null,
      avatarUrl: profileMap.get(entry.userId)?.avatarUrl || null,
      value: entry.value,
      metric,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
