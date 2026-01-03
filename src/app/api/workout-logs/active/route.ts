import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/workout-logs/active - Get current active (incomplete) workout
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find most recent incomplete workout (started within last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const activeWorkout = await prisma.workoutLog.findFirst({
      where: {
        userId: user.id,
        isComplete: false,
        startTime: {
          gte: sixHoursAgo,
        },
      },
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
      },
      orderBy: { startTime: "desc" },
    });

    if (!activeWorkout) {
      return NextResponse.json(null);
    }

    return NextResponse.json(activeWorkout);
  } catch (error) {
    console.error("Error fetching active workout:", error);
    return NextResponse.json(
      { error: "Failed to fetch active workout" },
      { status: 500 }
    );
  }
}
