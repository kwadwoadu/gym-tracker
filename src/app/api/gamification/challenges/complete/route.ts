import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLevelFromXP, getLevelInfo, getStreakMultiplier } from "@/lib/gamification";
import { getDailyChallenges, getTodayDate, getDailyChallengeById, type DailyChallenge } from "@/data/daily-challenges";
import { getWeeklyChallenges, getWeekId, getWeeklyChallengeById, type WeeklyChallenge } from "@/data/weekly-challenges";

// POST /api/gamification/challenges/complete - Complete a challenge and award XP
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, type } = body;

    if (!challengeId || typeof challengeId !== "string") {
      return NextResponse.json({ error: "challengeId is required" }, { status: 400 });
    }

    if (type !== "daily" && type !== "weekly") {
      return NextResponse.json({ error: "type must be 'daily' or 'weekly'" }, { status: 400 });
    }

    // Get or create gamification record
    let gamification = await prisma.userGamification.findUnique({
      where: { userId: user.id },
    });

    if (!gamification) {
      gamification = await prisma.userGamification.create({
        data: { userId: user.id },
      });
    }

    let challenge: DailyChallenge | WeeklyChallenge | undefined;
    let xpReward = 0;

    if (type === "daily") {
      // Check if challenge exists in today's pool
      const todaysChallenges = getDailyChallenges();
      challenge = todaysChallenges.find((c) => c.id === challengeId);

      if (!challenge) {
        // Fallback to pool lookup
        challenge = getDailyChallengeById(challengeId);
      }

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
      }

      xpReward = challenge.xpReward;

      // Check if already completed
      const existing = await prisma.dailyChallengeProgress.findUnique({
        where: {
          gamificationId_challengeId_date: {
            gamificationId: gamification.id,
            challengeId,
            date: getTodayDate(),
          },
        },
      });

      if (existing?.isComplete) {
        return NextResponse.json({ error: "Challenge already completed" }, { status: 400 });
      }

      // Mark as complete
      await prisma.dailyChallengeProgress.upsert({
        where: {
          gamificationId_challengeId_date: {
            gamificationId: gamification.id,
            challengeId,
            date: getTodayDate(),
          },
        },
        create: {
          gamificationId: gamification.id,
          challengeId,
          date: getTodayDate(),
          progress: challenge.requirement.value,
          isComplete: true,
        },
        update: {
          progress: challenge.requirement.value,
          isComplete: true,
        },
      });
    } else {
      // Weekly challenge
      const thisWeeksChallenges = getWeeklyChallenges();
      challenge = thisWeeksChallenges.find((c) => c.id === challengeId);

      if (!challenge) {
        challenge = getWeeklyChallengeById(challengeId);
      }

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
      }

      xpReward = challenge.xpReward;

      // Check if already completed
      const existing = await prisma.weeklyChallengeProgress.findUnique({
        where: {
          gamificationId_challengeId_weekId: {
            gamificationId: gamification.id,
            challengeId,
            weekId: getWeekId(),
          },
        },
      });

      if (existing?.isComplete) {
        return NextResponse.json({ error: "Challenge already completed" }, { status: 400 });
      }

      // Mark as complete
      await prisma.weeklyChallengeProgress.upsert({
        where: {
          gamificationId_challengeId_weekId: {
            gamificationId: gamification.id,
            challengeId,
            weekId: getWeekId(),
          },
        },
        create: {
          gamificationId: gamification.id,
          challengeId,
          weekId: getWeekId(),
          progress: challenge.requirement.value,
          isComplete: true,
        },
        update: {
          progress: challenge.requirement.value,
          isComplete: true,
        },
      });
    }

    // Get streak for multiplier
    const streak = await getStreakFromWorkouts(user.id);
    const { multiplier } = getStreakMultiplier(streak.currentStreak);

    // Calculate XP with multiplier
    const actualXP = Math.floor(xpReward * multiplier);

    // Record level before XP addition
    const levelBefore = getLevelFromXP(gamification.totalXP);

    // Update XP and create history entry
    const newTotalXP = gamification.totalXP + actualXP;

    await prisma.$transaction([
      prisma.userGamification.update({
        where: { id: gamification.id },
        data: { totalXP: newTotalXP },
      }),
      prisma.xPHistoryEntry.create({
        data: {
          gamificationId: gamification.id,
          amount: actualXP,
          source: `challenge:${challengeId}`,
          multiplier,
        },
      }),
    ]);

    // Check for level up
    const levelAfter = getLevelFromXP(newTotalXP);
    const didLevelUp = levelAfter > levelBefore;

    if (didLevelUp) {
      await prisma.userGamification.update({
        where: { id: gamification.id },
        data: { lastLevelUp: levelAfter },
      });
    }

    const levelInfo = getLevelInfo(newTotalXP);

    return NextResponse.json({
      success: true,
      xpAwarded: actualXP,
      newTotal: newTotalXP,
      levelUp: didLevelUp
        ? {
            didLevelUp: true,
            newLevel: levelAfter,
            title: levelInfo.title,
            color: levelInfo.color,
          }
        : null,
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    return NextResponse.json(
      { error: "Failed to complete challenge" },
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
