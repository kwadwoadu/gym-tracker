import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/focus-session/active - Get user's active (incomplete) focus session
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.focusSession.findFirst({
      where: {
        userId: user.id,
        isComplete: false,
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching active focus session:", error);
    return NextResponse.json(
      { error: "Failed to fetch active focus session" },
      { status: 500 }
    );
  }
}
