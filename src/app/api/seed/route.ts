import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { fixProgramExerciseIds, seedDatabase } from "@/lib/seed";

// POST /api/seed - Seed database with exercises and fix program IDs
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "seed";

    if (action === "fix") {
      // Fix existing program exercise IDs
      await fixProgramExerciseIds();
      return NextResponse.json({
        success: true,
        message: "Program exercise IDs fixed successfully",
      });
    } else {
      // Full database seed
      await seedDatabase();
      return NextResponse.json({
        success: true,
        message: "Database seeded successfully",
      });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/seed - Check if seeding is needed (for debugging)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This is just for debugging - returns info about current state
    return NextResponse.json({
      message: "Use POST to seed. POST with {action: 'fix'} to fix existing program IDs.",
    });
  } catch (error) {
    console.error("Error checking seed status:", error);
    return NextResponse.json(
      { error: "Failed to check seed status" },
      { status: 500 }
    );
  }
}
