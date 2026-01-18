import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/nutrition/meals/[id] - Get a specific custom meal
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const meal = await prisma.customMeal.findFirst({
      where: { id, userId: user.id },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error fetching custom meal:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom meal" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/meals/[id] - Update a custom meal
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.customMeal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    const meal = await prisma.customMeal.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.protein !== undefined && { protein: body.protein }),
        ...(body.carbs !== undefined && { carbs: body.carbs }),
        ...(body.fat !== undefined && { fat: body.fat }),
        ...(body.calories !== undefined && { calories: body.calories }),
        ...(body.prepTime !== undefined && { prepTime: body.prepTime }),
        ...(body.ingredients !== undefined && { ingredients: body.ingredients }),
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error updating custom meal:", error);
    return NextResponse.json(
      { error: "Failed to update custom meal" },
      { status: 500 }
    );
  }
}

// DELETE /api/nutrition/meals/[id] - Delete a custom meal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.customMeal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    await prisma.customMeal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom meal:", error);
    return NextResponse.json(
      { error: "Failed to delete custom meal" },
      { status: 500 }
    );
  }
}
