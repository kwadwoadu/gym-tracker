/**
 * Migration script to update onboardingState for existing users
 *
 * State Machine:
 * - "not_started" - User hasn't started onboarding
 * - "profile_complete" - User completed profile but hasn't selected program
 * - "program_installing" - User is in the process of installing a program
 * - "complete" - User has finished onboarding with a program installed
 *
 * Migration Logic:
 * 1. Users with hasCompletedOnboarding=true AND programs.length > 0 -> "complete"
 * 2. Users with hasCompletedOnboarding=true AND programs.length = 0 -> "profile_complete"
 * 3. Users with hasCompletedOnboarding=false -> "not_started"
 *
 * Run with: npx tsx scripts/migrate-onboarding-state.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOnboardingState() {
  console.log('Starting onboarding state migration...\n');

  // Get all users with their onboarding profile and programs
  const users = await prisma.user.findMany({
    include: {
      onboardingProfile: true,
      programs: {
        select: { id: true },
      },
    },
  });

  console.log(`Found ${users.length} user(s)\n`);

  let updated = 0;
  let skipped = 0;
  let created = 0;

  for (const user of users) {
    const hasPrograms = user.programs.length > 0;
    const hasCompletedOnboarding = user.onboardingProfile?.hasCompletedOnboarding || false;
    const currentState = user.onboardingProfile?.onboardingState || 'not_started';

    // Determine new state
    let newState: string;
    if (hasCompletedOnboarding && hasPrograms) {
      newState = 'complete';
    } else if (hasCompletedOnboarding && !hasPrograms) {
      newState = 'profile_complete';
    } else {
      newState = 'not_started';
    }

    console.log(`User: ${user.email || user.id}`);
    console.log(`  Clerk ID: ${user.clerkId}`);
    console.log(`  Programs: ${user.programs.length}`);
    console.log(`  hasCompletedOnboarding: ${hasCompletedOnboarding}`);
    console.log(`  Current state: ${currentState}`);
    console.log(`  Target state: ${newState}`);

    // Create onboarding profile if missing
    if (!user.onboardingProfile) {
      console.log('  Creating missing onboarding profile...');
      await prisma.onboardingProfile.create({
        data: {
          userId: user.id,
          goals: [],
          onboardingState: newState,
          hasCompletedOnboarding: newState === 'complete',
          completedAt: newState === 'complete' ? new Date() : null,
        },
      });
      created++;
      console.log(`  -> Created with state: ${newState}`);
    } else if (currentState !== newState) {
      // Update if state needs to change
      console.log(`  Updating state: ${currentState} -> ${newState}`);
      await prisma.onboardingProfile.update({
        where: { userId: user.id },
        data: {
          onboardingState: newState,
          completedAt: newState === 'complete' && !user.onboardingProfile.completedAt
            ? new Date()
            : user.onboardingProfile.completedAt,
        },
      });
      updated++;
      console.log(`  -> Updated to: ${newState}`);
    } else {
      console.log(`  -> No change needed`);
      skipped++;
    }

    console.log('');
  }

  console.log('Migration complete!');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
}

migrateOnboardingState()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
