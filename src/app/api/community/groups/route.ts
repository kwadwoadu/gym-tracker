import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/groups - List groups
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
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
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST /api/community/groups - Create a group
export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
