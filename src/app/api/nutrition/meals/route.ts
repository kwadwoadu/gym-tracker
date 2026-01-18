import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/nutrition/meals - Get user's custom meals
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meals = await prisma.customMeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error fetching custom meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom meals" },
      { status: 500 }
    );
  }
}

// POST /api/nutrition/meals - Create a custom meal
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const meal = await prisma.customMeal.create({
      data: {
        userId: user.id,
        name: body.name,
        category: body.category,
        protein: body.protein || 0,
        carbs: body.carbs || 0,
        fat: body.fat || 0,
        calories: body.calories || 0,
        prepTime: body.prepTime || null,
        ingredients: body.ingredients || null,
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error creating custom meal:", error);
    return NextResponse.json(
      { error: "Failed to create custom meal" },
      { status: 500 }
    );
  }
}
