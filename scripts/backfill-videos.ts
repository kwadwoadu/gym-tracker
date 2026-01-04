/**
 * One-time script to backfill video URLs for all exercises in the database.
 * Matches exercises by builtInId (reliable) or name (fallback).
 *
 * Usage: npx ts-node scripts/backfill-videos.ts
 */

import { PrismaClient } from "@prisma/client";
import data from "../src/data/exercises.json";

const prisma = new PrismaClient();
const exercisesData = data.exercises;

async function main() {
  console.log("Starting video URL backfill...\n");

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const ex of exercisesData) {
    // Skip exercises without video URLs
    if (!ex.videoUrl) {
      skipped++;
      continue;
    }

    // Try to update by builtInId first (most reliable)
    const result = await prisma.exercise.updateMany({
      where: { builtInId: ex.id },
      data: { videoUrl: ex.videoUrl },
    });

    if (result.count > 0) {
      updated += result.count;
      console.log(`[OK] ${ex.name} - updated by builtInId`);
      continue;
    }

    // Fallback: update by name if builtInId didn't match
    const fallbackResult = await prisma.exercise.updateMany({
      where: { name: ex.name, videoUrl: null },
      data: { videoUrl: ex.videoUrl },
    });

    if (fallbackResult.count > 0) {
      updated += fallbackResult.count;
      console.log(`[OK] ${ex.name} - updated by name (fallback)`);
    } else {
      notFound++;
      console.log(`[--] ${ex.name} - not found in database`);
    }
  }

  console.log("\n--- Backfill Complete ---");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no video): ${skipped}`);
  console.log(`Not found: ${notFound}`);
}

main()
  .catch((e) => {
    console.error("Backfill failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
