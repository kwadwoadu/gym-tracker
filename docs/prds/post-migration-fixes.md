# Post-Migration Fixes PRD

## Overview
Critical fixes required after migrating SetFlow from Dexie (IndexedDB) to Prisma (PostgreSQL). Multiple features are broken due to exercise ID mismatches between JSON presets and database records.

## Status: Not Started

## Problem Statement
After the Prisma migration, three critical issues have emerged:
1. **Exercise names display as IDs** - Users see "ex-bw-squats" instead of "Bodyweight Squats"
2. **Programs appear empty** - PPL and Upper/Lower programs show no exercises when selected
3. **Settings reset is broken** - "Reset to Default Program" button does nothing (stubbed out)

## Root Cause Analysis

### ID Mismatch Problem
The core issue is a mismatch between two ID systems:

| System | ID Format | Example |
|--------|-----------|---------|
| JSON presets | String-based | `ex-barbell-bench` |
| Prisma database | CUID-based | `cm4xyz123abc456...` |

### Current Mapping Approach (Broken)
```typescript
// Current: Maps by exercise NAME - fragile and unreliable
const idMapping = new Map<string, string>();
exercises.forEach(ex => idMapping.set(ex.name, ex.id));

// Fallback creates ghost references
const dbExerciseId = idMapping.get(ex.exerciseId) || ex.exerciseId;
```

**Why this fails:**
1. Program JSONs reference `ex-barbell-bench`
2. Code tries to match by name "Barbell Bench Press"
3. If name doesn't match exactly, falls back to original ID
4. Original ID (`ex-barbell-bench`) doesn't exist in Prisma
5. Result: Ghost references that can't be resolved

### Settings Reset (Stubbed)
```typescript
// Current implementation in settings
const handleReset = () => {
  showToast("Reset feature coming soon");
};
```

## Proposed Solution

### Phase 1: Add builtInId Field

Add a new field to the Exercise model in Prisma schema:

```prisma
model Exercise {
  id           String   @id @default(cuid())
  builtInId    String?  @unique  // NEW: Original preset ID (ex-barbell-bench)
  name         String
  muscleGroups String[]
  equipment    String
  videoUrl     String?
  isCustom     Boolean  @default(true)
  userId       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([builtInId])
  @@index([userId])
}
```

### Phase 2: Seed Migration

Update the exercise seeding logic:

```typescript
// When seeding exercises from JSON
for (const exercise of presetsExercises) {
  await prisma.exercise.upsert({
    where: { builtInId: exercise.id },  // Use builtInId for matching
    update: { name: exercise.name, ... },
    create: {
      builtInId: exercise.id,  // Store original ID
      name: exercise.name,
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment,
      isCustom: false,
    },
  });
}
```

### Phase 3: Program Installation Fix

Update program installation to use builtInId mapping:

```typescript
async function installPresetProgram(presetId: string) {
  const preset = getPresetProgram(presetId);
  
  // Build builtInId -> dbId mapping
  const exercises = await prisma.exercise.findMany({
    where: { builtInId: { not: null } },
    select: { id: true, builtInId: true }
  });
  
  const idMapping = new Map<string, string>();
  exercises.forEach(ex => {
    if (ex.builtInId) {
      idMapping.set(ex.builtInId, ex.id);
    }
  });
  
  // Map training day exercises
  for (const day of preset.trainingDays) {
    for (const superset of day.supersets) {
      for (const exercise of superset.exercises) {
        const dbId = idMapping.get(exercise.exerciseId);
        if (!dbId) {
          console.error(`Missing exercise: ${exercise.exerciseId}`);
          continue;
        }
        exercise.exerciseId = dbId;  // Replace with Prisma CUID
      }
    }
  }
  
  // Save program with correct IDs
  await saveProgram(preset);
}
```

### Phase 4: Settings Reset Implementation

Implement the stubbed reset functionality:

```typescript
async function resetToDefaultProgram() {
  const userId = getCurrentUserId();
  
  // 1. Delete user's current program and history
  await prisma.$transaction([
    prisma.workoutHistory.deleteMany({ where: { userId } }),
    prisma.trainingDay.deleteMany({ where: { program: { userId } } }),
    prisma.program.deleteMany({ where: { userId } }),
  ]);
  
  // 2. Get user's onboarding profile for recommendation
  const profile = await prisma.onboardingProfile.findFirst({
    where: { userId }
  });
  
  // 3. Get recommended program based on profile
  const recommendedProgramId = getRecommendedProgram(profile);
  
  // 4. Install the recommended preset
  await installPresetProgram(recommendedProgramId);
  
  // 5. Confirm to user
  showToast("Program reset to " + recommendedProgramId);
}
```

## User Decision Captured
- **History on program switch**: OK to clear
  - When switching programs or resetting, workout history will be deleted
  - This simplifies implementation and avoids orphaned exercise references

## Files to Modify

### Schema Changes
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `builtInId` field to Exercise model |

### Seeding Changes
| File | Change |
|------|--------|
| `src/lib/seed.ts` | Use `builtInId` for upsert matching |
| `src/lib/actions/seed.ts` | Update seed action if separate |

### Program Installation
| File | Change |
|------|--------|
| `src/lib/programs.ts` | Fix `installPresetProgram()` mapping |
| `src/app/onboarding/plans/page.tsx` | Verify installation flow |

### Settings Reset
| File | Change |
|------|--------|
| `src/app/settings/page.tsx` | Implement reset functionality |
| `src/lib/actions/program.ts` | Add `resetProgram` server action |

### Database Migration
| File | Change |
|------|--------|
| `prisma/migrations/xxx_add_builtin_id.sql` | Migration file |

## Implementation Steps

### Step 1: Schema Migration (30 min)
1. Add `builtInId` field to Prisma schema
2. Run `prisma migrate dev --name add_builtin_id`
3. Verify migration applied

### Step 2: Backfill builtInId (30 min)
1. Create a one-time script to backfill `builtInId` for existing exercises
2. Match exercises by name to JSON presets
3. Set `builtInId = preset.id` for matches

### Step 3: Update Seeding (30 min)
1. Modify `seedExercises()` to use `builtInId` for upsert
2. Verify no duplicate exercises created
3. Test with fresh database

### Step 4: Fix Program Installation (1 hour)
1. Update `installPresetProgram()` to use builtInId mapping
2. Add error handling for missing exercises
3. Test PPL and Upper/Lower program installation
4. Verify exercises display correctly

### Step 5: Implement Settings Reset (45 min)
1. Create `resetProgram` server action
2. Implement transaction-safe deletion
3. Re-install recommended program
4. Add confirmation dialog before reset
5. Test reset flow end-to-end

### Step 6: Testing & Verification (30 min)
1. Fresh user onboarding flow
2. All three preset programs install correctly
3. Exercise names display properly
4. Settings reset works
5. No orphaned records in database

## Success Metrics
- Exercise names display correctly (not IDs)
- PPL program shows all 6 days with exercises
- Upper/Lower program shows all 4 days with exercises
- Full Body program continues to work
- Settings reset successfully reinstalls default program
- No console errors related to missing exercises

## Design Decisions
1. **builtInId is nullable** - Custom user exercises don't have built-in IDs
2. **builtInId has unique constraint** - Prevents duplicate preset exercises
3. **Clear history on reset** - User agreed, simplifies implementation
4. **Backfill vs fresh start** - Backfill existing data to preserve user state

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Exercise name changes break backfill | Use fuzzy matching or manual mapping |
| Existing workout logs reference old IDs | Not an issue - clearing history on reset |
| Migration fails on production | Test on staging first, backup database |
| Custom exercises affected | builtInId only for preset exercises |

## Timeline Estimate
- Total: ~4 hours of development
- Testing: 1 hour
- Buffer: 30 min

## Related PRDs
- [Exercise Database PRD](./exercise-database.md) - Exercise ID format and structure
- [Workout Plan Selection PRD](./workout-plan-selection.md) - Program installation flow
- [Onboarding Flow PRD](./onboarding-flow.md) - User onboarding and profile

## Dependencies
- Prisma migration must complete before code changes
- Exercise database must be fully populated (see exercise-database.md)
