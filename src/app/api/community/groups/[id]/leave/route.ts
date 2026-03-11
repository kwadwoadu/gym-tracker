import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthParams } from "@/lib/api-utils";

// POST /api/community/groups/[id]/leave - Leave a group
export const POST = withAuthParams<{ id: string }>(async (req, user, { id }) => {
  // Check if member
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: id,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 400 });
  }

  // Check if creator is trying to leave
  const group = await prisma.group.findUnique({
    where: { id },
  });

  if (group?.createdById === user.id) {
    return NextResponse.json({ error: "Creator cannot leave the group. Delete it instead." }, { status: 400 });
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId: id,
        userId: user.id,
      },
    },
  });

  return NextResponse.json({ success: true });
});
