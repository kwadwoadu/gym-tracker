import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// POST /api/community/follow - Follow a user
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const { userId: targetUserId } = body;

  if (!targetUserId) {
    return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    return NextResponse.json({ error: "Already following this user" }, { status: 400 });
  }

  const follow = await prisma.follow.create({
    data: {
      followerId: user.id,
      followingId: targetUserId,
    },
  });

  return NextResponse.json(follow);
});

// DELETE /api/community/follow - Unfollow a user
export const DELETE = withAuth(async (req, user) => {
  const body = await req.json();
  const { userId: targetUserId } = body;

  if (!targetUserId) {
    return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  return NextResponse.json({ success: true });
});
