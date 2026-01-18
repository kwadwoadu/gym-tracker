import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/activity - Get friends' recent activity
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get users the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get profiles for following users (for privacy checks)
    const profiles = await prisma.userProfile.findMany({
      where: { userId: { in: followingIds } },
      select: {
        userId: true,
        displayName: true,
        avatarUrl: true,
        shareWorkouts: true,
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    // Get recent completed workouts from followed users who share workouts
    const shareWorkoutUserIds = followingIds.filter(
      (id) => profileMap.get(id)?.shareWorkouts !== false
    );

    const recentWorkouts = await prisma.workoutLog.findMany({
      where: {
        userId: { in: shareWorkoutUserIds },
        isComplete: true,
      },
      orderBy: { startTime: "desc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        dayName: true,
        duration: true,
        startTime: true,
        sets: true,
        program: { select: { name: true } },
      },
    });

    // Get recent PRs
    const recentPRs = await prisma.personalRecord.findMany({
      where: {
        userId: { in: shareWorkoutUserIds },
      },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        exerciseName: true,
        weight: true,
        reps: true,
        unit: true,
        date: true,
      },
    });

    // Combine into activity items
    const activities: Array<{
      id: string;
      type: string;
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
      data: Record<string, unknown>;
      createdAt: string;
    }> = [];

    for (const workout of recentWorkouts) {
      const profile = profileMap.get(workout.userId);
      const sets = workout.sets as Array<{ weight?: number; actualReps?: number }>;
      const totalVolume = sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.actualReps || 0)), 0);

      activities.push({
        id: `workout_${workout.id}`,
        type: "workout_completed",
        userId: workout.userId,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        data: {
          dayName: workout.dayName,
          programName: workout.program?.name,
          duration: workout.duration,
          totalVolume,
          setCount: sets.length,
        },
        createdAt: workout.startTime.toISOString(),
      });
    }

    for (const pr of recentPRs) {
      const profile = profileMap.get(pr.userId);
      activities.push({
        id: `pr_${pr.id}`,
        type: "pr_achieved",
        userId: pr.userId,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        data: {
          exerciseName: pr.exerciseName,
          weight: pr.weight,
          reps: pr.reps,
          unit: pr.unit,
        },
        createdAt: new Date(pr.date).toISOString(),
      });
    }

    // Sort by date descending and limit
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
