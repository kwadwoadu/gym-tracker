import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// PUT /api/community/challenges/[id]/progress - Update progress
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { progress } = body;

    if (progress === undefined) {
      return NextResponse.json({ error: "Progress is required" }, { status: 400 });
    }

    // Check if participant
    const existingParticipant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: id,
          userId: user.id,
        },
      },
      include: {
        challenge: true,
      },
    });

    if (!existingParticipant) {
      return NextResponse.json({ error: "Not a participant in this challenge" }, { status: 400 });
    }

    // Check if completed
    const isCompleted = progress >= existingParticipant.challenge.target;

    const participant = await prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId: id,
          userId: user.id,
        },
      },
      data: {
        progress,
        completedAt: isCompleted && !existingParticipant.completedAt ? new Date() : existingParticipant.completedAt,
      },
    });

    return NextResponse.json({
      id: participant.id,
      progress: participant.progress,
      completedAt: participant.completedAt?.toISOString() || null,
      joinedAt: participant.joinedAt.toISOString(),
      challengeId: participant.challengeId,
      userId: participant.userId,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
