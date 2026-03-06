import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/onboarding - Get user's onboarding profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.onboardingProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Check if user already has programs (legacy user)
      const programCount = await prisma.program.count({ where: { userId: user.id } });

      profile = await prisma.onboardingProfile.create({
        data: {
          userId: user.id,
          goals: [],
          injuries: [],
          hasCompletedOnboarding: programCount > 0,
          skippedOnboarding: false,
          onboardingState: programCount > 0 ? "complete" : "not_started",
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching onboarding profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding profile" },
      { status: 500 }
    );
  }
}

// POST /api/onboarding - Create or update onboarding profile
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const profile = await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(body.goals !== undefined && { goals: body.goals }),
        ...(body.experienceLevel !== undefined && {
          experienceLevel: body.experienceLevel,
        }),
        ...(body.trainingDaysPerWeek !== undefined && {
          trainingDaysPerWeek: body.trainingDaysPerWeek,
        }),
        ...(body.equipment !== undefined && { equipment: body.equipment }),
        ...(body.heightCm !== undefined && { heightCm: body.heightCm }),
        ...(body.weightKg !== undefined && { weightKg: body.weightKg }),
        ...(body.bodyFatPercent !== undefined && {
          bodyFatPercent: body.bodyFatPercent,
        }),
        ...(body.injuries !== undefined && { injuries: body.injuries }),
        ...(body.hasCompletedOnboarding !== undefined && {
          hasCompletedOnboarding: body.hasCompletedOnboarding,
          completedAt: body.hasCompletedOnboarding ? new Date() : null,
        }),
        ...(body.skippedOnboarding !== undefined && {
          skippedOnboarding: body.skippedOnboarding,
        }),
        ...(body.onboardingState !== undefined && {
          onboardingState: body.onboardingState,
        }),
      },
      create: {
        userId: user.id,
        goals: body.goals || [],
        experienceLevel: body.experienceLevel,
        trainingDaysPerWeek: body.trainingDaysPerWeek,
        equipment: body.equipment,
        heightCm: body.heightCm,
        weightKg: body.weightKg,
        bodyFatPercent: body.bodyFatPercent,
        injuries: body.injuries || [],
        hasCompletedOnboarding: body.hasCompletedOnboarding || false,
        skippedOnboarding: body.skippedOnboarding || false,
        completedAt: body.hasCompletedOnboarding ? new Date() : null,
        onboardingState: body.onboardingState || "not_started",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating onboarding profile:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding profile" },
      { status: 500 }
    );
  }
}
