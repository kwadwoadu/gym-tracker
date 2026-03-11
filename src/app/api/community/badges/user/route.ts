import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-utils";

// GET /api/community/badges/user - Get authenticated user's badges
// SEC-002: Always use authenticated user's ID to prevent IDOR
export const GET = withAuth(async (req, user) => {
  const userId = user.id;

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
});
