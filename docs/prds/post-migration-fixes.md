# Post-Migration Fixes PRD

**Status**: Not Started
**Created**: 2026-01-01
**Author**: Kwadwo Adu

---

## 1. Problem Statement

After migrating SetFlow from Dexie (IndexedDB) to Prisma (PostgreSQL), three critical issues have emerged:

1. **Exercise names display as IDs** - Users see "ex-bw-squats" instead of "Bodyweight Squats"
2. **Programs appear empty** - PPL and Upper/Lower programs show no exercises when selected
3. **Settings reset is broken** - "Reset to Default Program" button does nothing (stubbed out)

**Root cause**: ID mismatch between two systems. Program JSON presets use string-based IDs (e.g., `ex-barbell-bench`) while Prisma generates CUID-based IDs (e.g., `cm4xyz123abc456...`). The current name-based mapping is fragile and unreliable.

---

## 2. Solution

Four-phase fix adding a `builtInId` field to bridge the two ID systems:

**Phase 1: Add builtInId Field** - New nullable unique field on Exercise model storing the original preset ID (e.g., `ex-barbell-bench`)

**Phase 2: Seed Migration** - Update exercise seeding to use `builtInId` for upsert matching instead of name matching

**Phase 3: Program Installation Fix** - Update program installation to build a `builtInId -> dbId` mapping for resolving exercise references

**Phase 4: Settings Reset Implementation** - Replace the stubbed reset button with a working implementation that deletes current program/history and reinstalls the recommended preset

### User Decision Captured
- **History on program switch**: OK to clear. When switching programs or resetting, workout history will be deleted. This simplifies implementation and avoids orphaned exercise references.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Exercise name display | 100% exercises show display names (not IDs) | Visual check across all programs |
| PPL program completeness | All 6 days load with exercises | Navigate to each day, verify supersets populated |
| Upper/Lower completeness | All 4 days load with exercises | Navigate to each day, verify supersets populated |
| Full Body continuity | 3 days continue to work | Navigate to each day, verify no regression |
| Settings reset | Successfully reinstalls default program | Tap reset, verify new program loads |
| Zero console errors | No missing exercise warnings in console | Check browser dev tools during program load |

---

## 4. Requirements

### Must Have
- [ ] `builtInId` field added to Exercise model in Prisma schema
- [ ] Prisma migration applied successfully
- [ ] Existing exercises backfilled with builtInId values
- [ ] Exercise seeding uses builtInId for upsert matching
- [ ] Program installation maps builtInId to Prisma CUID
- [ ] All 3 preset programs install with correct exercise references
- [ ] Exercise names display correctly (not raw IDs)
- [ ] Settings reset deletes program + history and reinstalls default

### Should Have
- [ ] Confirmation dialog before settings reset
- [ ] Error handling for missing exercises during installation
- [ ] Backfill script for existing user data

### Won't Have (this version)
- Custom exercise builtInId support (custom exercises use CUID only)
- Migration of existing workout history to new IDs
- Rollback mechanism for failed migration

---

## 5. User Flows

### Flow A: Fresh User Onboarding
1. New user completes onboarding questionnaire
2. System recommends a program based on profile (PPL, Upper/Lower, Full Body)
3. `installPresetProgram()` loads program JSON
4. For each exercise reference, system looks up `builtInId` -> Prisma CUID mapping
5. All exercise IDs in training days resolve to valid database records
6. User sees complete program with exercise names, not IDs

### Flow B: Existing User Views Program
1. User with existing program navigates to training day
2. System loads training day exercises from Prisma
3. Exercise names display correctly via Prisma relations
4. All supersets show populated exercise cards
5. No empty sections or "Unknown Exercise" placeholders

### Flow C: Settings Reset
1. User navigates to Settings page
2. User taps "Reset to Default Program"
3. Confirmation dialog appears: "This will clear your program and workout history. Continue?"
4. User confirms
5. System deletes current program, training days, and workout history in a transaction
6. System retrieves user's onboarding profile for recommendation
7. System installs recommended preset program with correct ID mapping
8. User sees fresh program with all exercises loaded
9. Toast confirmation: "Program reset to [program name]"

---

## 6. Design

### Wireframes

```
Settings Page (Reset Section):
┌─────────────────────────────────────────┐
│  Program                                │
│  ───────────────────────────────────── │
│  Current: Push/Pull/Legs 6-Day         │
│                                          │
│  [  Reset to Default Program  ]         │
│                                          │
│  This will clear your program and       │
│  workout history.                       │
└─────────────────────────────────────────┘

Confirmation Dialog:
┌─────────────────────────────────────────┐
│                                          │
│  Reset Program?                         │
│                                          │
│  This will delete your current program  │
│  and all workout history. This cannot   │
│  be undone.                             │
│                                          │
│  [ Cancel ]          [ Reset ]          │
│                                          │
└─────────────────────────────────────────┘

Exercise Card (Fixed):
┌─────────────────────────────────────────┐
│  Before (broken):                       │
│  ex-barbell-bench  |  Chest | Barbell   │
│                                          │
│  After (fixed):                         │
│  Barbell Bench Press | Chest | Barbell  │
└─────────────────────────────────────────┘
```

### Component Table

| Component | File | Purpose |
|-----------|------|---------|
| ResetProgramButton | `/src/app/settings/page.tsx` | Trigger reset flow |
| ConfirmDialog | `/src/components/ui/confirm-dialog.tsx` | Confirm destructive action |
| Toast | `/src/components/ui/toast.tsx` | Success/error feedback |

### Visual Spec

| Element | Property | Value |
|---------|----------|-------|
| Reset button | Background | `#EF4444` (danger red) |
| Reset button | Text | `#FFFFFF`, 16px semibold |
| Reset button | Height | 48px, full width |
| Confirmation dialog | Background | `#1A1A1A` |
| Confirmation dialog | Border | 1px `#2A2A2A` |
| Cancel button | Style | Ghost, `#A0A0A0` text |
| Confirm button | Background | `#EF4444` |
| Toast success | Background | `#22C55E` with `#FFFFFF` text |

---

## 7. Technical Spec

### Schema Changes

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

### Seeding Logic

```typescript
// When seeding exercises from JSON
for (const exercise of presetsExercises) {
  await prisma.exercise.upsert({
    where: { builtInId: exercise.id },
    update: { name: exercise.name, muscleGroups: exercise.muscleGroups },
    create: {
      builtInId: exercise.id,
      name: exercise.name,
      muscleGroups: exercise.muscleGroups,
      equipment: exercise.equipment,
      isCustom: false,
    },
  });
}
```

### Program Installation

```typescript
async function installPresetProgram(presetId: string) {
  const exercises = await prisma.exercise.findMany({
    where: { builtInId: { not: null } },
    select: { id: true, builtInId: true }
  });

  const idMapping = new Map<string, string>();
  exercises.forEach(ex => {
    if (ex.builtInId) idMapping.set(ex.builtInId, ex.id);
  });

  // Map all exercise references in program JSON
  // Replace builtInId with Prisma CUID before saving
}
```

### Reset Server Action

```typescript
async function resetToDefaultProgram(userId: string) {
  await prisma.$transaction([
    prisma.workoutHistory.deleteMany({ where: { userId } }),
    prisma.trainingDay.deleteMany({ where: { program: { userId } } }),
    prisma.program.deleteMany({ where: { userId } }),
  ]);

  const profile = await prisma.onboardingProfile.findFirst({ where: { userId } });
  const recommendedProgramId = getRecommendedProgram(profile);
  await installPresetProgram(recommendedProgramId);
}
```

### Files to Create

| File | Description |
|------|-------------|
| `prisma/migrations/xxx_add_builtin_id.sql` | Migration adding builtInId column |
| `/src/lib/actions/program.ts` | Server action for `resetProgram` |

### Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add `builtInId` field to Exercise model |
| `src/lib/seed.ts` | Use `builtInId` for upsert matching |
| `src/lib/actions/seed.ts` | Update seed action if separate |
| `src/lib/programs.ts` | Fix `installPresetProgram()` to use builtInId mapping |
| `src/app/onboarding/plans/page.tsx` | Verify installation flow works with new mapping |
| `src/app/settings/page.tsx` | Implement reset button with confirmation dialog |

---

## 8. Implementation Plan

### Dependencies Checklist
- [x] Prisma schema exists with Exercise model
- [x] Exercise JSON presets with string IDs exist
- [x] Program installation logic exists (needs fix)
- [x] Settings page exists (reset button stubbed)
- [ ] Database backup before migration

### Build Order

**Phase 1: Schema Migration (30 min)**
1. [ ] Add `builtInId` field to Prisma schema
2. [ ] Run `prisma migrate dev --name add_builtin_id`
3. [ ] Verify migration applied

**Phase 2: Backfill + Seeding (30 min)**
4. [ ] Create backfill script to set builtInId for existing exercises (match by name)
5. [ ] Update `seedExercises()` to use builtInId for upsert
6. [ ] Verify no duplicate exercises created
7. [ ] Test with fresh database

**Phase 3: Program Installation Fix (1 hour)**
8. [ ] Update `installPresetProgram()` to use builtInId mapping
9. [ ] Add error handling for missing exercises
10. [ ] Test PPL 6-day program installation
11. [ ] Test Upper/Lower 4-day program installation
12. [ ] Verify exercise names display correctly

**Phase 4: Settings Reset (45 min)**
13. [ ] Create `resetProgram` server action with transaction
14. [ ] Add confirmation dialog before reset
15. [ ] Wire reset button to server action
16. [ ] Test reset flow end-to-end

**Phase 5: Testing + Deploy (30 min)**
17. [ ] Fresh user onboarding flow
18. [ ] All 3 preset programs install correctly
19. [ ] Settings reset works
20. [ ] Deploy to Vercel

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Exercise name changed in JSON preset | builtInId is stable, name update via upsert |
| Custom user exercise (no builtInId) | builtInId is null, uses CUID only |
| Backfill can't match by name (typo) | Manual mapping fallback, log unmatched exercises |
| Migration fails on production | Test on staging first, backup database before migrate |
| Program references exercise not in DB | Log error, skip exercise, show warning to user |
| Reset with no onboarding profile | Default to Full Body 3-day program |
| Concurrent reset requests | Transaction handles atomicity, second request is no-op |
| builtInId collision (duplicate preset IDs) | Unique constraint prevents duplicates, error at seed time |

---

## 10. Testing

### Functional Tests
- [ ] Migration adds builtInId column successfully
- [ ] Backfill sets builtInId for all existing preset exercises
- [ ] Seeding with builtInId creates no duplicates
- [ ] `installPresetProgram` maps all builtInIds to CUIDs
- [ ] PPL 6-day program loads all 6 days with exercises
- [ ] Upper/Lower 4-day program loads all 4 days with exercises
- [ ] Full Body 3-day program continues to work (no regression)
- [ ] Settings reset deletes program and history
- [ ] Settings reset reinstalls recommended program
- [ ] Reset transaction rolls back on failure

### UI Verification
- [ ] Exercise names display correctly (not raw IDs like "ex-barbell-bench")
- [ ] All supersets show populated exercise cards
- [ ] No empty program days
- [ ] Reset button shows confirmation dialog
- [ ] Reset success shows toast notification
- [ ] Program loads immediately after reset (no blank screen)
- [ ] All touch targets are 44px minimum

---

## 11. Launch Checklist

- [ ] Prisma migration applied to production
- [ ] Backfill script run for existing users
- [ ] All 3 preset programs install correctly
- [ ] Exercise names display correctly across all programs
- [ ] Settings reset works end-to-end
- [ ] No orphaned records in database
- [ ] No console errors related to missing exercises
- [ ] Database backed up before deploy
- [ ] Deploy to gym.adu.dk via `npx vercel --prod`

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration fails on production | App broken until rollback | Test on staging first, backup database |
| Exercise name changes break backfill | Some exercises unmatched | Use fuzzy matching or manual mapping table |
| Existing workout logs reference old IDs | Historical data inconsistent | Clearing history on reset (user agreed) |
| Custom exercises affected by migration | User data corrupted | builtInId only for preset exercises, custom untouched |
| Transaction timeout on large datasets | Reset fails mid-operation | Batch deletions, increase timeout |
| Concurrent users during migration | Race conditions | Run migration during low-traffic period |

---

## 13. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Prisma schema with Exercise model | Available | Needs builtInId field added |
| Exercise JSON presets | Available | Source of builtInId values |
| Exercise database PRD | In Progress | Must be populated before programs work fully |
| Onboarding profile data | Available | Used for reset recommendation |
| Settings page | Available | Reset button stubbed, needs implementation |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-01-01 | Initial PRD created |
| 2026-03-26 | PRD quality audit: added missing sections (success metrics table, requirements MoSCoW, user flows, design wireframes, component table, visual spec, implementation plan with build order, edge cases table, testing checklists, launch checklist, changelog), reformatted to 14-section standard |
