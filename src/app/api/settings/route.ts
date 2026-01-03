import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          weightUnit: "kg",
          defaultRestSeconds: 90,
          soundEnabled: true,
          autoProgressWeight: true,
          progressionIncrement: 2.5,
          autoStartRestTimer: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        ...(body.weightUnit !== undefined && { weightUnit: body.weightUnit }),
        ...(body.defaultRestSeconds !== undefined && {
          defaultRestSeconds: body.defaultRestSeconds,
        }),
        ...(body.soundEnabled !== undefined && {
          soundEnabled: body.soundEnabled,
        }),
        ...(body.autoProgressWeight !== undefined && {
          autoProgressWeight: body.autoProgressWeight,
        }),
        ...(body.progressionIncrement !== undefined && {
          progressionIncrement: body.progressionIncrement,
        }),
        ...(body.autoStartRestTimer !== undefined && {
          autoStartRestTimer: body.autoStartRestTimer,
        }),
      },
      create: {
        userId: user.id,
        weightUnit: body.weightUnit ?? "kg",
        defaultRestSeconds: body.defaultRestSeconds ?? 90,
        soundEnabled: body.soundEnabled ?? true,
        autoProgressWeight: body.autoProgressWeight ?? true,
        progressionIncrement: body.progressionIncrement ?? 2.5,
        autoStartRestTimer: body.autoStartRestTimer ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
