import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET /api/nutrition/custom-supplements - Get user's custom supplements
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplements = await prisma.customSupplement.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(supplements);
  } catch (error) {
    console.error("Error fetching custom supplements:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom supplements" },
      { status: 500 }
    );
  }
}

// POST /api/nutrition/custom-supplements - Create a custom supplement
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.dose || !body.timing) {
      return NextResponse.json(
        { error: "Name, dose, and timing are required" },
        { status: 400 }
      );
    }

    const supplement = await prisma.customSupplement.create({
      data: {
        userId: user.id,
        name: body.name,
        dose: body.dose,
        timing: body.timing,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(supplement);
  } catch (error) {
    console.error("Error creating custom supplement:", error);
    return NextResponse.json(
      { error: "Failed to create custom supplement" },
      { status: 500 }
    );
  }
}
