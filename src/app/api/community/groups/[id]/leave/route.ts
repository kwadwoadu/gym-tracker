import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// POST /api/community/groups/[id]/leave - Leave a group
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
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  }
}
