import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDailyChallenges, getTodayDate, type DailyChallenge } from "@/data/daily-challenges";
import { getWeeklyChallenges, getWeekId, type WeeklyChallenge } from "@/data/weekly-challenges";

// POST /api/gamification/challenges/bulk-update - Update all challenges matching a requirement type
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requirementType, value, mode = "increment" } = body;

    if (!requirementType || typeof requirementType !== "string") {
      return NextResponse.json({ error: "requirementType is required" }, { status: 400 });
    }

    if (typeof value !== "number" || value < 0) {
      return NextResponse.json({ error: "value must be a non-negative number" }, { status: 400 });
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

    const updatedChallenges: Array<{ challengeId: string; type: "daily" | "weekly"; progress: number; isComplete: boolean }> = [];

    // Get today's daily challenges and update matching ones
    const dailyChallenges = getDailyChallenges();
    for (const challenge of dailyChallenges) {
      if (challenge.requirement.type === requirementType) {
        const existingProgress = gamification.dailyProgress.find(
          (p) => p.challengeId === challenge.id
        );

        const currentProgress = existingProgress?.progress || 0;
        const newProgress = mode === "increment"
          ? currentProgress + value
          : value;

        const isComplete = newProgress >= challenge.requirement.value;

        const result = await prisma.dailyChallengeProgress.upsert({
          where: {
            gamificationId_challengeId_date: {
              gamificationId: gamification.id,
              challengeId: challenge.id,
              date: getTodayDate(),
            },
          },
          create: {
            gamificationId: gamification.id,
            challengeId: challenge.id,
            date: getTodayDate(),
            progress: Math.min(newProgress, challenge.requirement.value),
            isComplete,
          },
          update: {
            progress: Math.min(newProgress, challenge.requirement.value),
            isComplete,
          },
        });

        updatedChallenges.push({
          challengeId: challenge.id,
          type: "daily",
          progress: result.progress,
          isComplete: result.isComplete,
        });
      }
    }

    // Get this week's weekly challenges and update matching ones
    const weeklyChallenges = getWeeklyChallenges();
    for (const challenge of weeklyChallenges) {
      if (challenge.requirement.type === requirementType) {
        const existingProgress = gamification.weeklyProgress.find(
          (p) => p.challengeId === challenge.id
        );

        const currentProgress = existingProgress?.progress || 0;
        const newProgress = mode === "increment"
          ? currentProgress + value
          : value;

        const isComplete = newProgress >= challenge.requirement.value;

        const result = await prisma.weeklyChallengeProgress.upsert({
          where: {
            gamificationId_challengeId_weekId: {
              gamificationId: gamification.id,
              challengeId: challenge.id,
              weekId: getWeekId(),
            },
          },
          create: {
            gamificationId: gamification.id,
            challengeId: challenge.id,
            weekId: getWeekId(),
            progress: Math.min(newProgress, challenge.requirement.value),
            isComplete,
          },
          update: {
            progress: Math.min(newProgress, challenge.requirement.value),
            isComplete,
          },
        });

        updatedChallenges.push({
          challengeId: challenge.id,
          type: "weekly",
          progress: result.progress,
          isComplete: result.isComplete,
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedChallenges,
    });
  } catch (error) {
    console.error("Error bulk updating challenge progress:", error);
    return NextResponse.json(
      { error: "Failed to update challenge progress" },
      { status: 500 }
    );
  }
}
