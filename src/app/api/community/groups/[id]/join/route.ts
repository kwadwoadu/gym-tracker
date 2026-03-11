import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthParams } from "@/lib/api-utils";

// POST /api/community/groups/[id]/join - Join a group
export const POST = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  // Check if group exists
  const group = await prisma.group.findUnique({
    where: { id },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.isPublic) {
    return NextResponse.json({ error: "This group is private" }, { status: 403 });
  }

  // Check if already a member
  const existingMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: user.id,
      },
    },
  });

  if (existingMembership) {
    return NextResponse.json({ error: "Already a member of this group" }, { status: 400 });
  }

  const membership = await prisma.groupMember.create({
    data: {
      groupId: id,
      userId: user.id,
      role: "member",
    },
  });

  return NextResponse.json({
    id: membership.id,
    role: membership.role,
    joinedAt: membership.joinedAt.toISOString(),
    groupId: membership.groupId,
    userId: membership.userId,
  });
});
