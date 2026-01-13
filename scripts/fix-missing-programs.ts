/**
 * Create default program for users without programs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMissingPrograms() {
  console.log('🔧 Checking for users without programs...\n');

  const usersWithoutPrograms = await prisma.user.findMany({
    where: {
      programs: {
        none: {},
      },
    },
    include: {
      onboardingProfile: true,
    },
  });

  console.log(`Found ${usersWithoutPrograms.length} user(s) without programs\n`);

  for (const user of usersWithoutPrograms) {
    console.log(`User: ${user.email || user.clerkId}`);
    console.log('  Creating default Full Body 3-Day program...');

    await prisma.program.create({
      data: {
        name: 'Full Body Training',
        description: 'A balanced 3-day full body program',
        isActive: true,
        userId: user.id,
        trainingDays: {
          create: [
            {
              name: 'Full Body A',
              dayNumber: 1,
              warmup: [],
              supersets: [],
              finisher: [],
            },
            {
              name: 'Full Body B',
              dayNumber: 2,
              warmup: [],
              supersets: [],
              finisher: [],
            },
            {
              name: 'Full Body C',
              dayNumber: 3,
              warmup: [],
              supersets: [],
              finisher: [],
            },
          ],
        },
      },
    });

    console.log('  ✅ Program created!\n');
  }

  console.log('🎉 Done! All users now have at least one program.');
}

fixMissingPrograms()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
