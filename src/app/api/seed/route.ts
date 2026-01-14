import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createBackup } from "@/lib/backup";
import { fixProgramExerciseIds, seedDatabase, resetToDefault, backfillBuiltInIds, backfillVideoUrls, backfillMuscles } from "@/lib/seed";

/**
 * POST /api/seed - Seed database with exercises and fix program IDs
 *
 * SAFETY: Requires explicit action parameter to prevent accidental data loss.
 * Actions that delete data will create a backup first.
 *
 * Safe actions (no data loss):
 * - backfill: Add builtInId to existing exercises
 * - backfill-videos: Add videoUrl to existing exercises
 *
 * Dangerous actions (create backup first):
 * - fix: Fix program exercise IDs (may delete programs)
 * - reset: Reset to default program (deletes all workout data)
 * - seed: Full database seed (deletes and recreates all data)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action;

    // SAFETY: Require explicit action parameter
    if (!action) {
      return NextResponse.json({
        error: "Missing required 'action' parameter",
        validActions: ["backfill", "backfill-videos", "backfill-muscles", "fix", "reset", "seed"],
        safeActions: ["backfill", "backfill-videos", "backfill-muscles"],
        dangerousActions: ["fix", "reset", "seed"],
      }, { status: 400 });
    }

    // Safe actions - no backup needed
    if (action === "backfill") {
      const result = await backfillBuiltInIds();
      return NextResponse.json({
        success: true,
        message: `Backfill complete: ${result.updated} updated, ${result.skipped} skipped`,
        ...result,
      });
    }

    if (action === "backfill-videos") {
      const result = await backfillVideoUrls();
      return NextResponse.json({
        success: true,
        message: `Video URL backfill complete: ${result.updated} updated, ${result.skipped} skipped`,
        ...result,
      });
    }

    if (action === "backfill-muscles") {
      const result = await backfillMuscles();
      return NextResponse.json({
        success: true,
        message: `Muscles backfill complete: ${result.updated} updated, ${result.skipped} skipped`,
        ...result,
      });
    }

    // Dangerous actions - create backup first
    if (action === "fix") {
      const backupId = await createBackup(user.id, "pre-fix");
      await fixProgramExerciseIds();
      return NextResponse.json({
        success: true,
        message: "Program exercise IDs fixed successfully",
        backupId,
      });
    }

    if (action === "reset") {
      const backupId = await createBackup(user.id, "pre-seed-reset");
      await resetToDefault();
      return NextResponse.json({
        success: true,
        message: "Reset to default program successfully",
        backupId,
      });
    }

    if (action === "seed") {
      const backupId = await createBackup(user.id, "pre-seed");
      await seedDatabase();
      return NextResponse.json({
        success: true,
        message: "Database seeded successfully",
        backupId,
      });
    }

    return NextResponse.json({
      error: `Unknown action: ${action}`,
      validActions: ["backfill", "backfill-videos", "backfill-muscles", "fix", "reset", "seed"],
    }, { status: 400 });
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
