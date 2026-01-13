/**
 * Quick fix script to resolve onboarding loop
 * Run with: npx ts-node scripts/fix-onboarding.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOnboarding() {
  console.log('🔧 Fixing onboarding loop...\n');

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      onboardingProfile: true,
      programs: true,
    },
  });

  console.log(`Found ${users.length} user(s)\n`);

  for (const user of users) {
    console.log(`User: ${user.id}`);
    console.log(`  Email: ${user.email || 'not set'}`);
    console.log(`  Clerk ID: ${user.clerkId}`);
    console.log(`  Programs: ${user.programs.length}`);
    console.log(`  Onboarding completed: ${user.onboardingProfile?.hasCompletedOnboarding || false}`);

    // Fix onboarding profile if missing or incomplete
    if (!user.onboardingProfile) {
      console.log('  ⚠️  No onboarding profile - creating one...');
      await prisma.onboardingProfile.create({
        data: {
          userId: user.id,
          goals: ['build_muscle', 'get_stronger'],
          experienceLevel: 'intermediate',
          trainingDaysPerWeek: 3,
          equipment: 'full_gym',
          hasCompletedOnboarding: true,
          skippedOnboarding: false,
          completedAt: new Date(),
        },
      });
      console.log('  ✅ Created onboarding profile with hasCompletedOnboarding: true');
    } else if (!user.onboardingProfile.hasCompletedOnboarding) {
      console.log('  ⚠️  Onboarding not marked complete - fixing...');
      await prisma.onboardingProfile.update({
        where: { userId: user.id },
        data: {
          hasCompletedOnboarding: true,
          completedAt: new Date(),
        },
      });
      console.log('  ✅ Marked onboarding as complete');
    } else {
      console.log('  ✅ Onboarding already complete');
    }

    console.log('');
  }

  console.log('🎉 Done! Now go to http://localhost:3001/onboarding/plans to select a program.');
}

fixOnboarding()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
