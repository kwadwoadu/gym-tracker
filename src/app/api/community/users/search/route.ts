import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/users/search - Search users by handle or displayName
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Normalize the search query (remove @ if present)
    const normalizedQuery = query.startsWith("@") ? query.slice(1) : query;

    // Find users matching the query (by handle or displayName)
    const profiles = await prisma.userProfile.findMany({
      where: {
        AND: [
          // Don't include the current user
          { userId: { not: user.id } },
          // Search by handle or displayName
          {
            OR: [
              { handle: { contains: normalizedQuery, mode: "insensitive" } },
              { displayName: { contains: normalizedQuery, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        // Prioritize exact handle matches
        { handle: "asc" },
        { displayName: "asc" },
      ],
    });

    // Get follow status for each user
    const followStatus = await prisma.follow.findMany({
      where: {
        followerId: user.id,
        followingId: { in: profiles.map((p) => p.userId) },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(followStatus.map((f) => f.followingId));

    const results = profiles.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      handle: profile.handle,
      isFollowing: followingSet.has(profile.userId),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
