import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLevelFromXP, getLevelInfo, getStreakMultiplier } from "@/lib/gamification";

// POST /api/gamification/xp - Award XP to user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, source } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid XP amount" }, { status: 400 });
    }

    if (!source || typeof source !== "string") {
      return NextResponse.json({ error: "Source is required" }, { status: 400 });
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

    // Get streak for multiplier calculation
    const streak = await getStreakFromWorkouts(user.id);
    const { multiplier } = getStreakMultiplier(streak.currentStreak);

    // Calculate XP with multiplier
    const actualXP = Math.floor(amount * multiplier);

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
          source,
          multiplier,
        },
      }),
    ]);

    // Check for level up
    const levelAfter = getLevelFromXP(newTotalXP);
    const didLevelUp = levelAfter > levelBefore;

    if (didLevelUp) {
      // Update lastLevelUp
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
      multiplier,
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
    console.error("Error awarding XP:", error);
    return NextResponse.json(
      { error: "Failed to award XP" },
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
