import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthParams } from "@/lib/api-utils";

// GET /api/community/follow/check/[userId] - Check if following a user
export const GET = withAuthParams<{ userId: string }>(async (req, user, { userId: targetUserId }) => {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  return NextResponse.json({ isFollowing: !!follow });
});
