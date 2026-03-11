import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// GET /api/community/groups - List groups
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const goalType = searchParams.get("goalType");
  const joined = searchParams.get("joined") === "true";

  const where: Record<string, unknown> = { isPublic: true };
  if (goalType) {
    where.goalType = goalType;
  }
  if (joined) {
    where.members = { some: { userId: user.id } };
  }

  const groups = await prisma.group.findMany({
    where,
    include: {
      _count: {
        select: { members: true },
      },
      members: {
        where: { userId: user.id },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    goalType: g.goalType,
    isPublic: g.isPublic,
    createdById: g.createdById,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    memberCount: g._count.members,
    isJoined: g.members.length > 0,
  }));

  return NextResponse.json(result);
});

// POST /api/community/groups - Create a group
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const { name, description, goalType, isPublic } = body;

  if (!name || !goalType) {
    return NextResponse.json({ error: "Name and goal type are required" }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name,
      description,
      goalType,
      isPublic: isPublic ?? true,
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: "admin",
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return NextResponse.json({
    id: group.id,
    name: group.name,
    description: group.description,
    goalType: group.goalType,
    isPublic: group.isPublic,
    createdById: group.createdById,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    memberCount: group._count.members,
    isJoined: true,
  });
});
