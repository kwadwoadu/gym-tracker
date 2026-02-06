import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDailyChallenges, getTodayDate, type DailyChallenge } from "@/data/daily-challenges";
import { getWeeklyChallenges, getWeekId, getDaysRemainingInWeek, type WeeklyChallenge } from "@/data/weekly-challenges";

// GET /api/gamification/challenges - Get both daily and weekly challenges
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "daily", "weekly", or null for both
    const date = searchParams.get("date") || getTodayDate();
    const weekId = searchParams.get("weekId") || getWeekId();

    // Get or create gamification record
    let gamification = await prisma.userGamification.findUnique({
      where: { userId: user.id },
    });

    if (!gamification) {
      gamification = await prisma.userGamification.create({
        data: { userId: user.id },
      });
    }

    const response: {
      daily?: Array<unknown>;
      weekly?: Array<unknown>;
    } = {};

    // Get daily challenges if requested or if no type specified
    if (!type || type === "daily") {
      const dailyProgress = await prisma.dailyChallengeProgress.findMany({
        where: {
          gamificationId: gamification.id,
          date,
        },
      });

      const dailyChallengeData = getDailyChallenges(new Date(date));
      response.daily = dailyChallengeData.map((challenge: DailyChallenge) => {
        const progress = dailyProgress.find((p) => p.challengeId === challenge.id);
        return {
          id: progress?.id || "",
          challengeId: challenge.id,
          date,
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
    }

    // Get weekly challenges if requested or if no type specified
    if (!type || type === "weekly") {
      const weeklyProgress = await prisma.weeklyChallengeProgress.findMany({
        where: {
          gamificationId: gamification.id,
          weekId,
        },
      });

      const weeklyChallengeData = getWeeklyChallenges(new Date(weekId));
      response.weekly = weeklyChallengeData.map((challenge: WeeklyChallenge) => {
        const progress = weeklyProgress.find((p) => p.challengeId === challenge.id);
        return {
          id: progress?.id || "",
          challengeId: challenge.id,
          weekId,
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
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}
