import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/follow/followers - Get users who follow me
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 });
  }
}
