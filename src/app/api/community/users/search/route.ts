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
    // Fetch more results than needed to allow for relevance-based sorting
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
      take: limit * 3, // Fetch more to allow for proper relevance sorting
    });

    // Sort by relevance: exact matches > prefix matches > substring matches
    const q = normalizedQuery.toLowerCase();

    const scoreField = (field: string): number => {
      if (field === q) return 0; // Exact match
      if (field.startsWith(q)) return 1; // Prefix match
      return 2; // Contains match
    };

    const sortedProfiles = profiles.sort((a, b) => {
      const aHandle = a.handle?.toLowerCase() || "";
      const aName = a.displayName?.toLowerCase() || "";
      const bHandle = b.handle?.toLowerCase() || "";
      const bName = b.displayName?.toLowerCase() || "";

      // Get best score from either handle or displayName
      const aScore = Math.min(scoreField(aHandle), scoreField(aName));
      const bScore = Math.min(scoreField(bHandle), scoreField(bName));

      // Primary sort: by relevance score
      if (aScore !== bScore) return aScore - bScore;

      // Secondary: prefer handle matches over displayName matches
      const aHasHandleMatch = aHandle.includes(q);
      const bHasHandleMatch = bHandle.includes(q);
      if (aHasHandleMatch && !bHasHandleMatch) return -1;
      if (!aHasHandleMatch && bHasHandleMatch) return 1;

      // Tertiary: alphabetical by handle (or displayName if no handle)
      return (aHandle || aName).localeCompare(bHandle || bName);
    });

    // Take only the requested limit after sorting
    const limitedProfiles = sortedProfiles.slice(0, limit);

    // Get follow status for each user
    const followStatus = await prisma.follow.findMany({
      where: {
        followerId: user.id,
        followingId: { in: limitedProfiles.map((p) => p.userId) },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(followStatus.map((f) => f.followingId));

    const results = limitedProfiles.map((profile) => ({
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
