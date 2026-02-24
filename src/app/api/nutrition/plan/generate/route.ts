import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";
import { generateWeekPlan, generateSingleDay, type DayPlan, type NutritionProfile, type CustomMeal } from "@/lib/meal-plan-generator";
import type { MealCategory } from "@/data/meal-templates";

// POST /api/nutrition/plan/generate - Generate a 7-day meal plan
export async function POST(request: Request) {
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
    const { startDate, trainingDays, hiitDays, save, regenerateDate } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: "startDate is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (!trainingDays || !Array.isArray(trainingDays)) {
      return NextResponse.json(
        { error: "trainingDays is required (array of day numbers 0-6)" },
        { status: 400 }
      );
    }

    // Fetch or auto-create the user's nutrition profile
    const dbProfile = await prisma.nutritionProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    // Cast Prisma profile to generator's NutritionProfile type
    const profile: NutritionProfile = {
      caloriesTrainingDay: dbProfile.caloriesTrainingDay,
      caloriesRestDay: dbProfile.caloriesRestDay,
      proteinTrainingDay: dbProfile.proteinTrainingDay,
      carbsTrainingDay: dbProfile.carbsTrainingDay,
      fatTrainingDay: dbProfile.fatTrainingDay,
      proteinRestDay: dbProfile.proteinRestDay,
      carbsRestDay: dbProfile.carbsRestDay,
      fatRestDay: dbProfile.fatRestDay,
      dietaryRestrictions: Array.isArray(dbProfile.dietaryRestrictions)
        ? (dbProfile.dietaryRestrictions as string[])
        : [],
    };

    // Fetch any custom meals for this user
    const dbCustomMeals = await prisma.customMeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const customMeals: CustomMeal[] = dbCustomMeals.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category as MealCategory,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      calories: m.calories,
    }));

    let plans: DayPlan[];

    if (regenerateDate) {
      // Regenerate a single day
      const dayPlan = generateSingleDay({
        startDate,
        targetDate: regenerateDate,
        profile,
        customMeals,
        trainingDays,
        hiitDays: hiitDays || [],
      });
      plans = [dayPlan];
    } else {
      // Generate a full 7-day week plan
      plans = generateWeekPlan({
        startDate,
        profile,
        customMeals,
        trainingDays,
        hiitDays: hiitDays || [],
      });
    }

    // Optionally save each day's plan to the MealPlan table
    if (save) {
      for (const plan of plans) {
        await prisma.mealPlan.upsert({
          where: {
            userId_date: {
              userId: user.id,
              date: plan.date,
            },
          },
          update: {
            slots: plan.slots as unknown as Record<string, string | null>,
          },
          create: {
            userId: user.id,
            date: plan.date,
            slots: plan.slots as unknown as Record<string, string | null>,
          },
        });
      }
    }

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
