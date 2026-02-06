import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/gamification/history - Get XP history
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get gamification record
    const gamification = await prisma.userGamification.findUnique({
      where: { userId: user.id },
    });

    if (!gamification) {
      return NextResponse.json([]);
    }

    // Get XP history
    const history = await prisma.xPHistoryEntry.findMany({
      where: { gamificationId: gamification.id },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching XP history:", error);
    return NextResponse.json(
      { error: "Failed to fetch XP history" },
      { status: 500 }
    );
  }
}
