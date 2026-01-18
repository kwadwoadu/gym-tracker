import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// Helper function to update challenge progress when workout is completed
async function updateChallengeProgress(userId: string, workoutSets: unknown[]) {
  const today = new Date().toISOString().split("T")[0];

  // Get all active challenges user is participating in
  const activeParticipations = await prisma.challengeParticipant.findMany({
    where: {
      userId,
      completedAt: null, // Only incomplete challenges
      challenge: {
        startDate: { lte: today },
        endDate: { gte: today },
      },
    },
    include: {
      challenge: true,
    },
  });

  for (const participation of activeParticipations) {
    const { challenge } = participation;
    let newProgress = participation.progress;

    switch (challenge.type) {
      case "workouts":
        // Increment workout count by 1
        newProgress = participation.progress + 1;
        break;

      case "volume":
        // Calculate volume from sets (weight * reps)
        const sessionVolume = (workoutSets as Array<{ weight?: number; reps?: number }>)
          .reduce((total, set) => {
            const weight = set.weight || 0;
            const reps = set.reps || 0;
            return total + weight * reps;
          }, 0);
        newProgress = participation.progress + sessionVolume;
        break;

      case "streak":
        // Get recent workout dates to calculate streak
        const recentWorkouts = await prisma.workoutLog.findMany({
          where: {
            userId,
            isComplete: true,
            date: {
              gte: challenge.startDate,
              lte: today,
            },
          },
          select: { date: true },
          orderBy: { date: "desc" },
        });

        // Calculate consecutive days
        const uniqueDates = [...new Set(recentWorkouts.map(w => w.date))].sort().reverse();
        let streak = 0;
        let checkDate = new Date(today);

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
        newProgress = streak;
        break;

      case "consistency":
        // Count unique workout days within challenge period
        const workoutDays = await prisma.workoutLog.findMany({
          where: {
            userId,
            isComplete: true,
            date: {
              gte: challenge.startDate,
              lte: challenge.endDate,
            },
          },
          select: { date: true },
        });
        newProgress = new Set(workoutDays.map(w => w.date)).size;
        break;
    }

    // Update progress
    const isCompleted = newProgress >= challenge.target;
    await prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId: challenge.id,
          userId,
        },
      },
      data: {
        progress: newProgress,
        completedAt: isCompleted && !participation.completedAt ? new Date() : participation.completedAt,
      },
    });

    // Award badge if completed and challenge has a badge
    if (isCompleted && challenge.badgeId && !participation.completedAt) {
      // Check if user already has this badge
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: challenge.badgeId,
          },
        },
      });

      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: challenge.badgeId,
          },
        });
      }
    }
  }
}

// GET /api/workout-logs/[id] - Get single workout log
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        day: {
          select: {
            name: true,
            dayNumber: true,
            warmup: true,
            supersets: true,
            finisher: true,
          },
        },
        program: {
          select: { name: true },
        },
        personalRecords: true,
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (workoutLog.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error("Error fetching workout log:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout log" },
      { status: 500 }
    );
  }
}

// PUT /api/workout-logs/[id] - Update workout log (add sets, complete, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existing = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate duration if completing
    let duration = existing.duration;
    if (body.isComplete && !existing.isComplete) {
      const endTime = new Date();
      duration = Math.round(
        (endTime.getTime() - existing.startTime.getTime()) / 60000
      );
    }

    const workoutLog = await prisma.workoutLog.update({
      where: { id },
      data: {
        sets: body.sets !== undefined ? body.sets : existing.sets,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        isComplete:
          body.isComplete !== undefined ? body.isComplete : existing.isComplete,
        endTime:
          body.isComplete && !existing.isComplete ? new Date() : existing.endTime,
        duration,
      },
      include: {
        day: {
          select: { name: true, dayNumber: true },
        },
        program: {
          select: { name: true },
        },
      },
    });

    // Auto-update challenge progress when workout is completed
    if (body.isComplete && !existing.isComplete) {
      const sets = body.sets !== undefined ? body.sets : existing.sets;
      await updateChallengeProgress(user.id, sets as unknown[]).catch((error) => {
        // Log error but don't fail the workout completion
        console.error("Error updating challenge progress:", error);
      });
    }

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error("Error updating workout log:", error);
    return NextResponse.json(
      { error: "Failed to update workout log" },
      { status: 500 }
    );
  }
}

// DELETE /api/workout-logs/[id] - Delete workout log
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout log not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.workoutLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout log:", error);
    return NextResponse.json(
      { error: "Failed to delete workout log" },
      { status: 500 }
    );
  }
}
