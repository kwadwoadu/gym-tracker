import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLevelInfo, getStreakMultiplier } from "@/lib/gamification";
import { getDailyChallenges, getTodayDate, type DailyChallenge } from "@/data/daily-challenges";
import { getWeeklyChallenges, getWeekId, getDaysRemainingInWeek, type WeeklyChallenge } from "@/data/weekly-challenges";

// GET /api/gamification - Get user's gamification data
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create gamification record
    let gamification = await prisma.userGamification.findUnique({
      where: { userId: user.id },
      include: {
        dailyProgress: {
          where: { date: getTodayDate() },
        },
        weeklyProgress: {
          where: { weekId: getWeekId() },
        },
      },
    });

    if (!gamification) {
      gamification = await prisma.userGamification.create({
        data: { userId: user.id },
        include: {
          dailyProgress: true,
          weeklyProgress: true,
        },
      });
    }

    // Get current streak from stats
    const stats = await getStreakFromWorkouts(user.id);
    const streakInfo = getStreakMultiplier(stats.currentStreak);

    // Get level info
    const levelInfo = getLevelInfo(gamification.totalXP);

    // Get today's daily challenges and merge with progress
    const dailyChallengeData = getDailyChallenges();
    const dailyChallenges = dailyChallengeData.map((challenge: DailyChallenge) => {
      const progress = gamification.dailyProgress.find(
        (p) => p.challengeId === challenge.id
      );
      return {
        id: progress?.id || "",
        challengeId: challenge.id,
        date: getTodayDate(),
        progress: progress?.progress || 0,
        isComplete: progress?.isComplete || false,
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          icon: challenge.icon,
          xpReward: challenge.xpReward,
          requirement: challenge.requirement,
        },
      };
    });

    // Get this week's weekly challenges and merge with progress
    const weeklyChallengeData = getWeeklyChallenges();
    const weeklyChallenges = weeklyChallengeData.map((challenge: WeeklyChallenge) => {
      const progress = gamification.weeklyProgress.find(
        (p) => p.challengeId === challenge.id
      );
      return {
        id: progress?.id || "",
        challengeId: challenge.id,
        weekId: getWeekId(),
        progress: progress?.progress || 0,
        isComplete: progress?.isComplete || false,
        daysRemaining: getDaysRemainingInWeek(),
        challenge: {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          icon: challenge.icon,
          xpReward: challenge.xpReward,
          requirement: challenge.requirement,
        },
      };
    });

    return NextResponse.json({
      gamification: {
        id: gamification.id,
        totalXP: gamification.totalXP,
        lastLevelUp: gamification.lastLevelUp,
        userId: gamification.userId,
        ...levelInfo,
        streakMultiplier: streakInfo.multiplier,
        streakDays: stats.currentStreak,
      },
      dailyChallenges,
      weeklyChallenges,
    });
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    );
  }
}

// Helper to get streak from workout logs
async function getStreakFromWorkouts(userId: string): Promise<{ currentStreak: number }> {
  const workoutLogs = await prisma.workoutLog.findMany({
    where: {
      userId,
      isComplete: true,
    },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (workoutLogs.length === 0) {
    return { currentStreak: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const workoutDates = [...new Set(workoutLogs.map((log) => log.date))].sort().reverse();

  // Check if streak includes today or yesterday
  if (workoutDates[0] !== today && workoutDates[0] !== yesterday) {
    return { currentStreak: 0 };
  }

  let streak = 1;
  for (let i = 0; i < workoutDates.length - 1; i++) {
    const current = new Date(workoutDates[i]);
    const previous = new Date(workoutDates[i + 1]);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return { currentStreak: streak };
}
