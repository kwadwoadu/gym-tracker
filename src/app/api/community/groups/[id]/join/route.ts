import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// POST /api/community/groups/[id]/join - Join a group
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
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
