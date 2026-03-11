import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthParams } from "@/lib/api-utils";

// PUT /api/community/challenges/[id]/progress - Update progress
export const PUT = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();
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
});
