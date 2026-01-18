import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/focus-session/[id]/complete - Complete focus session
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { duration, notes } = body;

    // Verify ownership and get existing session
    const existing = await prisma.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (existing.isComplete) {
      return NextResponse.json(
        { error: "Session is already complete" },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const startTime = new Date(existing.startTime);

    // Calculate duration in minutes if not provided
    const calculatedDuration = duration || Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const session = await prisma.focusSession.update({
      where: { id },
      data: {
        isComplete: true,
        endTime,
        duration: calculatedDuration,
        ...(notes !== undefined && { notes }),
      },
    });

    // Update challenge progress if user has active challenges
    try {
      const activeParticipations = await prisma.challengeParticipant.findMany({
        where: {
          userId: user.id,
          completedAt: null,
          challenge: {
            startDate: { lte: new Date().toISOString().split("T")[0] },
            endDate: { gte: new Date().toISOString().split("T")[0] },
          },
        },
        include: {
          challenge: true,
        },
      });

      // Get session sets for volume calculation
      const sets = existing.sets as Array<{ weight?: number; actualReps?: number }>;
      const totalVolume = sets.reduce(
        (sum, s) => sum + ((s.weight || 0) * (s.actualReps || 0)),
        0
      );

      for (const participation of activeParticipations) {
        const challenge = participation.challenge;
        let newProgress = participation.progress;

        switch (challenge.type) {
          case "workouts":
            newProgress = participation.progress + 1;
            break;
          case "volume":
            newProgress = participation.progress + totalVolume;
            break;
        }

        const isCompleted = newProgress >= challenge.target;

        await prisma.challengeParticipant.update({
          where: { id: participation.id },
          data: {
            progress: newProgress,
            ...(isCompleted && { completedAt: new Date() }),
          },
        });

        // Award badge if challenge completed and has a badge
        if (isCompleted && challenge.badgeId) {
          const existingBadge = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: user.id,
                badgeId: challenge.badgeId,
              },
            },
          });

          if (!existingBadge) {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: challenge.badgeId,
              },
            });
          }
        }
      }
    } catch (challengeError) {
      // Log but don't fail the main operation
      console.error("Error updating challenge progress:", challengeError);
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error completing focus session:", error);
    return NextResponse.json(
      { error: "Failed to complete focus session" },
      { status: 500 }
    );
  }
}
