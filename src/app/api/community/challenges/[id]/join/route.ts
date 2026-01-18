import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// POST /api/community/challenges/[id]/join - Join a challenge
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check if challenge is active
    const today = new Date().toISOString().split("T")[0];
    if (challenge.endDate < today) {
      return NextResponse.json({ error: "This challenge has ended" }, { status: 400 });
    }

    // Check if group-specific and user is a member
    if (challenge.groupId) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: challenge.groupId,
            userId: user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Must be a group member to join this challenge" }, { status: 403 });
      }
    }

    // Check if already joined
    const existingParticipant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: id,
          userId: user.id,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json({ error: "Already joined this challenge" }, { status: 400 });
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId: id,
        userId: user.id,
        progress: 0,
      },
    });

    return NextResponse.json({
      id: participant.id,
      progress: participant.progress,
      completedAt: null,
      joinedAt: participant.joinedAt.toISOString(),
      challengeId: participant.challengeId,
      userId: participant.userId,
    });
  } catch (error) {
    console.error("Error joining challenge:", error);
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
  }
}
