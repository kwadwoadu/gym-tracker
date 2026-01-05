import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { canAccessNutrition } from "@/lib/feature-flags";
import { MealSlots } from "@/data/meal-templates";

// GET /api/nutrition/plan - Get meal plan for a specific date
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Feature gate check
    if (!canAccessNutrition(user.email)) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const plan = await prisma.mealPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    // Return empty slots if no plan exists
    if (!plan) {
      return NextResponse.json({
        date,
        slots: {
          breakfast: null,
          midMorning: null,
          lunch: null,
          snack: null,
          dinner: null,
        } as MealSlots,
      });
    }

    return NextResponse.json({
      id: plan.id,
      date: plan.date,
      slots: plan.slots as unknown as MealSlots,
    });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/plan - Create or update meal plan for a date
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
    const { date, slots } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const plan = await prisma.mealPlan.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      update: {
        slots: slots ?? {},
      },
      create: {
        userId: user.id,
        date,
        slots: slots ?? {
          breakfast: null,
          midMorning: null,
          lunch: null,
          snack: null,
          dinner: null,
        },
      },
    });

    return NextResponse.json({
      id: plan.id,
      date: plan.date,
      slots: plan.slots as unknown as MealSlots,
    });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}

// POST /api/nutrition/plan - Copy plan from another date
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
    const { sourceDate, targetDate } = body;

    if (!sourceDate || !targetDate) {
      return NextResponse.json(
        { error: "Source date and target date are required" },
        { status: 400 }
      );
    }

    // Get source plan
    const sourcePlan = await prisma.mealPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: sourceDate,
        },
      },
    });

    if (!sourcePlan) {
      return NextResponse.json(
        { error: "No plan found for source date" },
        { status: 404 }
      );
    }

    // Copy to target date
    const targetPlan = await prisma.mealPlan.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: targetDate,
        },
      },
      update: {
        slots: sourcePlan.slots ?? {},
      },
      create: {
        userId: user.id,
        date: targetDate,
        slots: sourcePlan.slots ?? {},
      },
    });

    return NextResponse.json({
      id: targetPlan.id,
      date: targetPlan.date,
      slots: targetPlan.slots as unknown as MealSlots,
    });
  } catch (error) {
    console.error("Error copying meal plan:", error);
    return NextResponse.json(
      { error: "Failed to copy meal plan" },
      { status: 500 }
    );
  }
}
