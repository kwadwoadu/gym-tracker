import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

/**
 * GET /api/session - Get active workout session for current user
 *
 * Returns the active session if one exists, null otherwise.
 * Used for cross-device resume - check if session exists on different device.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.activeSession.findUnique({
      where: { userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ session: null });
    }

    // Check if session is expired (6 hours)
    const ageHours = (Date.now() - session.lastUpdated.getTime()) / (1000 * 60 * 60);
    if (ageHours > 6) {
      // Delete expired session
      await prisma.activeSession.delete({
        where: { userId: user.id },
      });
      return NextResponse.json({ session: null, expired: true });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        dayId: session.dayId,
        phase: session.phase,
        workoutState: session.workoutState,
        completedSets: session.completedSets,
        warmupChecked: session.warmupChecked,
        finisherChecked: session.finisherChecked,
        currentVolume: session.currentVolume,
        startTime: session.startTime.toISOString(),
        lastUpdated: session.lastUpdated.toISOString(),
        deviceId: session.deviceId,
      },
    });
  } catch (error) {
    console.error("[Session GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to get session", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/session - Create or update active workout session
 *
 * Upserts the session - creates if none exists, updates if exists.
 * Called periodically during workout to sync state to cloud.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      dayId,
      phase,
      workoutState,
      completedSets,
      warmupChecked,
      finisherChecked,
      currentVolume,
      startTime,
      deviceId,
    } = body;

    // Validate required fields
    if (!dayId || !phase || !workoutState || !startTime) {
      return NextResponse.json(
        { error: "Missing required fields: dayId, phase, workoutState, startTime" },
        { status: 400 }
      );
    }

    // Upsert the session
    const session = await prisma.activeSession.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dayId,
        phase,
        workoutState,
        completedSets: completedSets || [],
        warmupChecked: warmupChecked || [],
        finisherChecked: finisherChecked || [],
        currentVolume: currentVolume || 0,
        startTime: new Date(startTime),
        deviceId,
      },
      update: {
        dayId,
        phase,
        workoutState,
        completedSets: completedSets || [],
        warmupChecked: warmupChecked || [],
        finisherChecked: finisherChecked || [],
        currentVolume: currentVolume || 0,
        startTime: new Date(startTime),
        deviceId,
        // lastUpdated is handled by @updatedAt
      },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        lastUpdated: session.lastUpdated.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Session POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save session", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session - Clear active workout session
 *
 * Called when workout is completed or user discards session.
 */
export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the session if it exists
    const existing = await prisma.activeSession.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      await prisma.activeSession.delete({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true, deleted: !!existing });
  } catch (error) {
    console.error("[Session DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete session", details: String(error) },
      { status: 500 }
    );
  }
}
