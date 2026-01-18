import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/community/profile/[userId] - Get another user's public profile with stats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        shareStreak: true,
        shareVolume: true,
        shareWorkouts: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch stats based on privacy settings
    const stats: {
      currentStreak?: number;
      totalWorkouts?: number;
      personalRecordsCount?: number;
      recentWorkouts?: Array<{ id: string; dayName: string; duration: number | null; date: string }>;
    } = {};

    // Get total workouts count (always public)
    const totalWorkouts = await prisma.workoutLog.count({
      where: { userId, isComplete: true },
    });
    stats.totalWorkouts = totalWorkouts;

    // Get streak if shared
    if (profile.shareStreak) {
      const today = new Date();
      const workouts = await prisma.workoutLog.findMany({
        where: { userId, isComplete: true },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 90, // Last 90 days for streak calculation
      });

      // Calculate streak
      let streak = 0;
      const uniqueDates = [...new Set(workouts.map(w => w.date))].sort().reverse();
      let checkDate = new Date(today.toISOString().split("T")[0]);

      for (const dateStr of uniqueDates) {
        const workoutDate = new Date(dateStr);
        const diffDays = Math.floor((checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          streak++;
          checkDate = workoutDate;
        } else {
          break;
        }
      }
      stats.currentStreak = streak;
    }

    // Get PR count if volume is shared
    if (profile.shareVolume) {
      const prCount = await prisma.personalRecord.count({
        where: { userId },
      });
      stats.personalRecordsCount = prCount;
    }

    // Get recent workouts if shared
    if (profile.shareWorkouts) {
      const recentWorkouts = await prisma.workoutLog.findMany({
        where: { userId, isComplete: true },
        select: {
          id: true,
          dayName: true,
          duration: true,
          date: true,
        },
        orderBy: { date: "desc" },
        take: 5,
      });
      stats.recentWorkouts = recentWorkouts;
    }

    return NextResponse.json({
      ...profile,
      stats,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
