import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/follow/following - Get users I follow
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
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

    const result = following.map((f) => ({
      id: f.following.userProfile?.id || f.following.id,
      displayName: f.following.userProfile?.displayName || null,
      avatarUrl: f.following.userProfile?.avatarUrl || null,
      bio: f.following.userProfile?.bio || null,
      userId: f.followingId,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "Failed to fetch following" }, { status: 500 });
  }
}
