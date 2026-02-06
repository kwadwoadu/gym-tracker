import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getTodayDate } from "@/data/daily-challenges";
import { getWeekId } from "@/data/weekly-challenges";

// POST /api/gamification/challenges/progress - Update challenge progress
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, type, progress } = body;

    if (!challengeId || typeof challengeId !== "string") {
      return NextResponse.json({ error: "challengeId is required" }, { status: 400 });
    }

    if (type !== "daily" && type !== "weekly") {
      return NextResponse.json({ error: "type must be 'daily' or 'weekly'" }, { status: 400 });
    }

    if (typeof progress !== "number" || progress < 0) {
      return NextResponse.json({ error: "progress must be a non-negative number" }, { status: 400 });
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

    if (type === "daily") {
      const result = await prisma.dailyChallengeProgress.upsert({
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
          progress,
          isComplete: false,
        },
        update: {
          progress,
        },
      });

      return NextResponse.json({
        id: result.id,
        challengeId: result.challengeId,
        date: result.date,
        progress: result.progress,
        isComplete: result.isComplete,
      });
    } else {
      const result = await prisma.weeklyChallengeProgress.upsert({
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
          progress,
          isComplete: false,
        },
        update: {
          progress,
        },
      });

      return NextResponse.json({
        id: result.id,
        challengeId: result.challengeId,
        weekId: result.weekId,
        progress: result.progress,
        isComplete: result.isComplete,
      });
    }
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return NextResponse.json(
      { error: "Failed to update challenge progress" },
      { status: 500 }
    );
  }
}
