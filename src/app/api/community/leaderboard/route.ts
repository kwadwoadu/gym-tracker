import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// GET /api/community/leaderboard - Get weekly leaderboard (friends only)
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
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
    // Batch: fetch all workout dates for all users at once
    const allWorkouts = await prisma.workoutLog.findMany({
      where: { userId: { in: userIds }, isComplete: true },
      orderBy: { date: "desc" },
      select: { userId: true, date: true },
    });

    // Group by userId
    const workoutsByUser = new Map<string, string[]>();
    for (const w of allWorkouts) {
      const dates = workoutsByUser.get(w.userId) || [];
      dates.push(w.date);
      workoutsByUser.set(w.userId, dates);
    }

    // Calculate streak for each user from grouped data
    for (const userId of userIds) {
      const dates = workoutsByUser.get(userId) || [];
      let streak = 0;
      const today = new Date().toISOString().split("T")[0];
      let checkDate = today;

      for (const date of dates) {
        if (date === checkDate) {
          streak++;
          const prevDate = new Date(checkDate);
          prevDate.setDate(prevDate.getDate() - 1);
          checkDate = prevDate.toISOString().split("T")[0];
        } else if (date < checkDate) {
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
});
