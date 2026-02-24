import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";

// GET /api/nutrition/profile - Get or auto-create nutrition profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature gate check
    if (!canAccessNutrition(user.email)) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 });
    }

    const profile = await prisma.nutritionProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching nutrition profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition profile" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/profile - Update nutrition profile
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature gate check
    if (!canAccessNutrition(user.email)) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 });
    }

    const body = await request.json();

    const profile = await prisma.nutritionProfile.update({
      where: { userId: user.id },
      data: {
        ...(body.caloriesTrainingDay !== undefined && { caloriesTrainingDay: body.caloriesTrainingDay }),
        ...(body.caloriesRestDay !== undefined && { caloriesRestDay: body.caloriesRestDay }),
        ...(body.proteinTrainingDay !== undefined && { proteinTrainingDay: body.proteinTrainingDay }),
        ...(body.carbsTrainingDay !== undefined && { carbsTrainingDay: body.carbsTrainingDay }),
        ...(body.fatTrainingDay !== undefined && { fatTrainingDay: body.fatTrainingDay }),
        ...(body.proteinRestDay !== undefined && { proteinRestDay: body.proteinRestDay }),
        ...(body.carbsRestDay !== undefined && { carbsRestDay: body.carbsRestDay }),
        ...(body.fatRestDay !== undefined && { fatRestDay: body.fatRestDay }),
        ...(body.dietaryRestrictions !== undefined && { dietaryRestrictions: body.dietaryRestrictions }),
        ...(body.mealTimingPreferences !== undefined && { mealTimingPreferences: body.mealTimingPreferences }),
        ...(body.weightGainTarget !== undefined && { weightGainTarget: body.weightGainTarget }),
        ...(body.weightCheckIntervalDays !== undefined && { weightCheckIntervalDays: body.weightCheckIntervalDays }),
        ...(body.calorieStepUp !== undefined && { calorieStepUp: body.calorieStepUp }),
        ...(body.calorieStepDown !== undefined && { calorieStepDown: body.calorieStepDown }),
        ...(body.gainRateMinPerWeek !== undefined && { gainRateMinPerWeek: body.gainRateMinPerWeek }),
        ...(body.gainRateMaxPerWeek !== undefined && { gainRateMaxPerWeek: body.gainRateMaxPerWeek }),
        ...(body.currentPhase !== undefined && { currentPhase: body.currentPhase }),
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating nutrition profile:", error);
    return NextResponse.json(
      { error: "Failed to update nutrition profile" },
      { status: 500 }
    );
  }
}
