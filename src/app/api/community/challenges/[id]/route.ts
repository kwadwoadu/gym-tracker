import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/community/challenges/[id] - Get challenge details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              include: {
                userProfile: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { progress: "desc" },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      target: challenge.target,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      groupId: challenge.groupId,
      badgeId: challenge.badgeId,
      createdAt: challenge.createdAt.toISOString(),
      participantCount: challenge._count.participants,
      participants: challenge.participants.map((p) => ({
        id: p.id,
        progress: p.progress,
        completedAt: p.completedAt?.toISOString() || null,
        joinedAt: p.joinedAt.toISOString(),
        challengeId: p.challengeId,
        userId: p.userId,
        user: {
          displayName: p.user.userProfile?.displayName || null,
          avatarUrl: p.user.userProfile?.avatarUrl || null,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 });
  }
}
