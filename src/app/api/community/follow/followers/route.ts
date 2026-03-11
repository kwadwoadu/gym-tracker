import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// GET /api/community/follow/followers - Get users who follow me
export const GET = withAuth(async (req, user) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: user.id },
    include: {
      follower: {
        include: {
          userProfile: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = followers.map((f) => ({
    id: f.follower.userProfile?.id || f.follower.id,
    displayName: f.follower.userProfile?.displayName || null,
    avatarUrl: f.follower.userProfile?.avatarUrl || null,
    bio: f.follower.userProfile?.bio || null,
    userId: f.followerId,
  }));

  return NextResponse.json(result);
});
