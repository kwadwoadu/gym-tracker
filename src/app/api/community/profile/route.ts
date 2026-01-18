import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

// GET /api/community/profile - Get own profile
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/community/profile - Update own profile
export async function PUT(request: Request) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { displayName, avatarUrl, bio, shareStreak, shareVolume, shareWorkouts } = body;

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName,
        avatarUrl,
        bio,
        shareStreak,
        shareVolume,
        shareWorkouts,
      },
      create: {
        userId: user.id,
        displayName,
        avatarUrl,
        bio,
        shareStreak: shareStreak ?? true,
        shareVolume: shareVolume ?? false,
        shareWorkouts: shareWorkouts ?? true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
