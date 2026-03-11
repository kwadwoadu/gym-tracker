import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// GET /api/community/challenges - List challenges
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
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
});

// POST /api/community/challenges - Create a challenge
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const { name, description, type, target, startDate, endDate, groupId, badgeId } = body;

  if (!name || !type || !target || !startDate || !endDate) {
    return NextResponse.json({ error: "Name, type, target, start date, and end date are required" }, { status: 400 });
  }

  // Field-level validation (REV-009)
  if (typeof name !== "string" || name.length < 1 || name.length > 100) {
    return NextResponse.json({ error: "Name must be between 1 and 100 characters" }, { status: 400 });
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string" || description.length > 500) {
      return NextResponse.json({ error: "Description must be at most 500 characters" }, { status: 400 });
    }
  }

  const validTypes = ["streak", "volume", "workouts", "consistency"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  if (typeof target !== "number" || target <= 0) {
    return NextResponse.json({ error: "Target must be a positive number" }, { status: 400 });
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);
  if (isNaN(parsedStart.getTime())) {
    return NextResponse.json({ error: "startDate is not a valid date" }, { status: 400 });
  }
  if (isNaN(parsedEnd.getTime())) {
    return NextResponse.json({ error: "endDate is not a valid date" }, { status: 400 });
  }
  if (parsedStart >= parsedEnd) {
    return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
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
});
