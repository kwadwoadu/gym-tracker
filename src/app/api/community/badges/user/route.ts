import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/badges/user - Get user's badges
export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    const userId = targetUserId || user.id;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: "desc" },
    });

    const result = userBadges.map((ub) => ({
      id: ub.id,
      earnedAt: ub.earnedAt.toISOString(),
      userId: ub.userId,
      badgeId: ub.badgeId,
      badge: ub.badge,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json({ error: "Failed to fetch user badges" }, { status: 500 });
  }
}
