/**
 * Fix onboarding state for all users
 *
 * Handles all state combinations:
 * - Has program but state != "complete" -> set to "complete"
 * - No program but state == "complete" -> set to "profile_complete"
 * - Stuck at "program_installing" -> resolve based on whether program exists
 * - Missing onboarding profile -> create one
 *
 * Run with: npx ts-node scripts/fix-onboarding.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOnboarding() {
  console.log('Fixing onboarding states...\n');

  const users = await prisma.user.findMany({
    include: {
      onboardingProfile: true,
      programs: true,
    },
  });

  console.log(`Found ${users.length} user(s)\n`);

  let fixed = 0;

  for (const user of users) {
    const hasProgram = user.programs.length > 0;
    const profile = user.onboardingProfile;
    const state = profile?.onboardingState || 'not_started';

    console.log(`User: ${user.email || user.clerkId}`);
    console.log(`  Programs: ${user.programs.length}`);
    console.log(`  State: ${state}`);

    // No onboarding profile at all
    if (!profile) {
      const targetState = hasProgram ? 'complete' : 'not_started';
      console.log(`  No profile - creating with state: ${targetState}`);
      await prisma.onboardingProfile.create({
        data: {
          userId: user.id,
          goals: ['build_muscle', 'get_stronger'],
          experienceLevel: 'intermediate',
          trainingDaysPerWeek: 3,
          equipment: 'full_gym',
          hasCompletedOnboarding: hasProgram,
          skippedOnboarding: false,
          completedAt: hasProgram ? new Date() : null,
          onboardingState: targetState,
        },
      });
      console.log(`  -> Fixed: created profile with state "${targetState}"`);
      fixed++;
      continue;
    }

    // Has program but state is not "complete" - fix to complete
    if (hasProgram && state !== 'complete') {
      console.log(`  Has program but state is "${state}" - fixing to "complete"`);
      await prisma.onboardingProfile.update({
        where: { userId: user.id },
        data: {
          onboardingState: 'complete',
          hasCompletedOnboarding: true,
          completedAt: profile.completedAt || new Date(),
        },
      });
      console.log('  -> Fixed: state set to "complete"');
      fixed++;
      continue;
    }

    // No program but state is "complete" - fix to profile_complete
    if (!hasProgram && state === 'complete') {
      console.log('  No program but state is "complete" - fixing to "profile_complete"');
      await prisma.onboardingProfile.update({
        where: { userId: user.id },
        data: {
          onboardingState: 'profile_complete',
        },
      });
      console.log('  -> Fixed: state set to "profile_complete"');
      fixed++;
      continue;
    }

    // Stuck at "program_installing" - resolve based on program existence
    if (state === 'program_installing') {
      const targetState = hasProgram ? 'complete' : 'profile_complete';
      console.log(`  Stuck at "program_installing" - fixing to "${targetState}"`);
      await prisma.onboardingProfile.update({
        where: { userId: user.id },
        data: {
          onboardingState: targetState,
          hasCompletedOnboarding: hasProgram || profile.hasCompletedOnboarding,
          completedAt: hasProgram ? (profile.completedAt || new Date()) : profile.completedAt,
        },
      });
      console.log(`  -> Fixed: state set to "${targetState}"`);
      fixed++;
      continue;
    }

    console.log('  OK - no fix needed');
  }

  console.log(`\nDone! Fixed ${fixed} out of ${users.length} user(s).`);
}

fixOnboarding()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
