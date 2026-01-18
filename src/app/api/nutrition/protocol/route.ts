import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

// Default empty protocol structure
const DEFAULT_PROTOCOL = {
  morning: [],
  preWorkout: [],
  postWorkout: [],
  evening: [],
};

// GET /api/nutrition/protocol - Get user's supplement protocol
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const protocol = await prisma.supplementProtocol.findUnique({
      where: { userId: user.id },
    });

    if (!protocol) {
      // Return default empty protocol
      return NextResponse.json({
        userId: user.id,
        protocol: DEFAULT_PROTOCOL,
      });
    }

    return NextResponse.json(protocol);
  } catch (error) {
    console.error("Error fetching supplement protocol:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplement protocol" },
      { status: 500 }
    );
  }
}

// PUT /api/nutrition/protocol - Update user's supplement protocol
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate protocol structure
    if (!body.protocol || typeof body.protocol !== "object") {
      return NextResponse.json(
        { error: "Protocol object is required" },
        { status: 400 }
      );
    }

    // Ensure all time blocks exist
    const protocol = {
      morning: body.protocol.morning || [],
      preWorkout: body.protocol.preWorkout || [],
      postWorkout: body.protocol.postWorkout || [],
      evening: body.protocol.evening || [],
    };

    const result = await prisma.supplementProtocol.upsert({
      where: { userId: user.id },
      update: { protocol },
      create: {
        userId: user.id,
        protocol,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating supplement protocol:", error);
    return NextResponse.json(
      { error: "Failed to update supplement protocol" },
      { status: 500 }
    );
  }
}
