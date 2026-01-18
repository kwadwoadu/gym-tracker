import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/challenges - List challenges
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active") === "true";
    const groupId = searchParams.get("groupId");
    const joined = searchParams.get("joined") === "true";

    const today = new Date().toISOString().split("T")[0];

    const where: Record<string, unknown> = {};
    if (active) {
      where.startDate = { lte: today };
      where.endDate = { gte: today };
    }
    if (groupId) {
      where.groupId = groupId;
    }
    if (joined) {
      where.participants = { some: { userId: user.id } };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        _count: {
          select: { participants: true },
        },
        participants: {
          where: { userId: user.id },
          take: 1,
        },
      },
      orderBy: { startDate: "desc" },
    });

    const result = challenges.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      target: c.target,
      startDate: c.startDate,
      endDate: c.endDate,
      groupId: c.groupId,
      badgeId: c.badgeId,
      createdAt: c.createdAt.toISOString(),
      participantCount: c._count.participants,
      isJoined: c.participants.length > 0,
      myProgress: c.participants[0]?.progress || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

// POST /api/community/challenges - Create a challenge
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, target, startDate, endDate, groupId, badgeId } = body;

    if (!name || !type || !target || !startDate || !endDate) {
      return NextResponse.json({ error: "Name, type, target, start date, and end date are required" }, { status: 400 });
    }

    // If groupId provided, verify user is admin of that group
    if (groupId) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId: user.id,
          },
        },
      });

      if (!membership || membership.role !== "admin") {
        return NextResponse.json({ error: "Only group admins can create group challenges" }, { status: 403 });
      }
    }

    const challenge = await prisma.challenge.create({
      data: {
        name,
        description,
        type,
        target,
        startDate,
        endDate,
        groupId,
        badgeId,
      },
    });

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
      participantCount: 0,
      isJoined: false,
      myProgress: 0,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
