import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthParams } from "@/lib/api-utils";

// GET /api/community/groups/[id] - Get group details
export const GET = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          joinedAt: true,
          groupId: true,
          userId: true,
          user: {
            select: {
              userProfile: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

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
    members: group.members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      groupId: m.groupId,
      userId: m.userId,
      user: {
        displayName: m.user.userProfile?.displayName || null,
        avatarUrl: m.user.userProfile?.avatarUrl || null,
      },
    })),
  });
});

// PUT /api/community/groups/[id] - Update group
export const PUT = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  const body = await req.json();

  // Check if user is admin
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: user.id,
      },
    },
  });

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "Not authorized to update this group" }, { status: 403 });
  }

  const { name, description, goalType, isPublic } = body;

  const group = await prisma.group.update({
    where: { id },
    data: {
      name,
      description,
      goalType,
      isPublic,
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
  });
});

// DELETE /api/community/groups/[id] - Delete group
export const DELETE = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  // Check if user is the creator
  const group = await prisma.group.findUnique({
    where: { id },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.createdById !== user.id) {
    return NextResponse.json({ error: "Only the creator can delete this group" }, { status: 403 });
  }

  await prisma.group.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
