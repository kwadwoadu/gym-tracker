# PRD: Superset & Quality Sprint

**Status**: SHIPPED
**Created**: 2026-03-06
**Author**: Kwadwo Adu
**Priority**: High (P1 bugs + P2 features + P3 quality)
**Project**: SetFlow (gym-tracker)

---

## 1. Problem Statement

SetFlow has accumulated 7 issues across bugs, feature gaps, and quality infrastructure that collectively degrade the workout experience:

- **P1 Bugs (trust-breaking)**: Set completion animation fires unreliably and data disappears after logging, superset transitions lack visual flow between exercises, weight/reps memory returns wrong values
- **P2 Features (friction)**: Users get blocked in supersets when skipping one exercise in a pair, cannot edit previously completed sets mid-workout
- **P2 Process**: No visual reference screenshots for planned UI changes
- **P3 Quality**: Zero test coverage on critical paths (set persistence, weight memory, superset logic)

**Who**: All active SetFlow users, especially during superset workouts.

**Impact if unsolved**: Users lose trust (data loss), waste time re-entering weights, get stuck in rigid superset flows, and bugs compound without test coverage.

### Issue Summary

| # | Issue | Priority | Category |
|---|-------|----------|----------|
| 1 | Celebration animation not firing + data disappears after set log | P1 | Bug |
| 2 | Superset flow has no visual transition between exercises | P1 | Bug |
| 3 | Weight/reps/RPE memory returns wrong values for exercises | P1 | Bug |
| 4 | Superset single-exercise mode: skipping one exercise blocks the other | P2 | Feature |
| 5 | Cannot edit previous sets during active workout | P2 | Feature |
| 6 | No HTML screenshots of planned UI/UX changes | P2 | Process |
| 7 | No unit tests or code review process | P3 | Quality |

---

## 2. Proposed Solution

### P1 Bugs - Fix First

**Bug 1: Celebration + Data Loss**
The celebration animation in `set-logger.tsx` (Framer Motion checkmark, lines 36-82) fires but `onComplete` triggers a re-render before animation finishes, unmounting it. Separately, the set data write to `WorkoutLog.sets` (JSON field) may fail silently or get overwritten by a stale read.

Fix: (a) Use `onAnimationComplete` callback before firing `onComplete`, (b) add error handling + retry on set persistence, (c) verify atomic JSON field update (read-modify-write with optimistic locking), (d) add toast confirming set saved.

**Bug 2: Superset Transition UX**
`superset-view.tsx` renders exercises as a static list. When cycling A1->A2->A1, there is no indicator of which exercise is active or next.

Fix: (a) Add `activeExerciseIndex` state, (b) highlight current exercise with lime border, (c) auto-scroll to next exercise, (d) add Framer Motion `AnimatePresence` slide/fade, (e) show "Next: [exercise]" indicator.

**Bug 3: Weight Memory Wrong Values**
The weight memory query fetches from the wrong scope: filtering by training day instead of globally, or matching by exercise name instead of `builtInId`/`exerciseId`.

Fix: (a) Audit the API route fetching last workout data, (b) ensure query searches ALL `WorkoutLog.sets` by `exerciseId` ordered by date desc, (c) handle both `builtInId` and custom ID matching, (d) verify `memorySource` prop distinguishes session vs historical.

### P2 Features - Build Next

**Feature 4: Superset Skip + Auto-Increment**
When a superset has A1 and A2 but user only does A1, the set counter for A2 should auto-increment so A1 can proceed to set 2.

**Feature 5: Quick Edit Previous Sets**
`edit-set-drawer.tsx` exists but is inaccessible during active workouts. Show completed sets as tappable badges, tap opens edit drawer, save updates state and recalculates volume.

**Feature 6: UI Screenshots**
Capture current state of key screens with Playwright/Puppeteer for visual reference in PRDs.

### P3 Quality - Foundation

**Quality 7: Unit Testing**
Install Vitest, add tests for critical lib modules (`gamification.ts`, `workout-helpers.ts`, `flatten-exercises.ts`), add component tests for SetLogger and SupersetView.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Data persistence | 0 data loss events across 10 test workouts | Complete 10 workouts, verify every set persisted in DB |
| Celebration animation | Fires 100% of the time on set completion | Visual verification across 20+ set completions |
| Weight memory accuracy | Correct suggestion for 100% of exercises with history | Compare suggested vs actual last workout data for 10 exercises |
| Superset transitions | Smooth visual flow with clear active indicator | UX walkthrough during superset workout |
| Quick edit availability | Can edit any completed set mid-workout | Tap each completed set badge, verify edit drawer opens |
| Test coverage | >80% on `gamification.ts`, `workout-helpers.ts`, `flatten-exercises.ts` | Vitest coverage report |
| Skip handling | Complete workout with 1 exercise skipped per superset | Full superset workout with skips, verify no blocking |

---

## 4. Requirements

### Must Have
- [ ] Fix celebration animation: use `onAnimationComplete` before state transition
- [ ] Fix data persistence: atomic write to `WorkoutLog.sets` with error handling + retry
- [ ] Fix weight/reps/RPE memory: global query across all training days by exerciseId
- [ ] Smooth superset transitions with `activeExerciseIndex` and lime highlight
- [ ] Auto-scroll to next exercise after set completion
- [ ] Auto-increment skipped exercise set count in supersets
- [ ] Tappable completed set badges that open EditSetDrawer mid-workout

### Should Have
- [ ] "Next: [exercise name]" indicator after completing a superset set
- [ ] Toast confirmation when set saved successfully
- [ ] Visual dimmed/strikethrough indicator for skipped superset exercises
- [ ] Vitest setup with >80% coverage on critical lib modules
- [ ] HTML screenshots captured for UI reference
- [ ] `skipped` field added to SetLog interface

### Won't Have (this sprint)
- Full E2E test suite (too large, separate PRD)
- CI/CD pipeline integration (separate task)
- Refactoring superset data model (keep JSON in WorkoutLog.sets)
- Component tests for all components (only critical paths)

---

## 5. User Flows

### Flow 1: Set Completion with Celebration
1. User taps "Log Set" with weight, reps, RPE filled
2. Checkmark animation plays (Framer Motion scale bounce + pop)
3. Animation completes (300ms)
4. `onAnimationComplete` fires
5. Set data persisted to WorkoutLog.sets (JSON field)
6. If persist fails, retry once, then show error toast
7. If persist succeeds, show brief success toast
8. Set counter advances, next set loads
9. If all sets done for exercise, transition to next exercise

### Flow 2: Superset Exercise Transition
1. User completes set for exercise A1 (Barbell Bench)
2. "Next: A2 - Cable Row" indicator appears briefly
3. A1 card slides left, A2 card slides in from right (AnimatePresence)
4. A2 card has lime `#CDFF00` border highlight
5. Auto-scroll positions A2 card at top of viewport
6. User completes A2 set
7. Cycle back to A1 with same transition pattern

### Flow 3: Skip Exercise in Superset
1. User is on exercise A2 in superset
2. User taps "Skip Exercise" button
3. A2 set counter auto-increments (set marked `skipped: true`)
4. A2 card dims to 40% opacity with strikethrough
5. Transition to A1 for next set
6. User can tap dimmed A2 card to un-skip if they change their mind

### Flow 4: Edit Previous Set Mid-Workout
1. Below SetLogger, completed sets shown as tappable badges: "Set 1: 60kg x 10"
2. User taps "Set 1: 60kg x 10" badge
3. EditSetDrawer opens from bottom with current values pre-filled
4. User changes weight from 60kg to 62.5kg
5. User taps "Save"
6. Drawer closes, badge updates to "Set 1: 62.5kg x 10"
7. Volume total recalculates
8. Brief confirmation toast

### Flow 5: Weight Memory Retrieval
1. User starts set for Barbell Bench Press
2. System queries ALL WorkoutLog.sets for this exerciseId, ordered by date desc
3. Last entry found: 60kg x 10 reps, 3 days ago
4. Weight input pre-fills with 60kg
5. If user hit target reps (10/10), ChallengeCard appears: "Ready to level up? Try 62.5kg"

---

## 6. Design

### Superset Active Exercise Indicator

```
┌──────────────────────────────────┐
│  Superset A                      │
│                                  │
│  ┌────────────────────────────┐  │
│  │ A1: Barbell Bench Press    │  │  <-- inactive, default border
│  │ Set 2/4 completed          │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌════════════════════════════┐  │
│  ║ A2: Seated Cable Row      ║  │  <-- ACTIVE: lime border
│  ║ Set 2/4 - YOUR TURN       ║  │
│  ║                            ║  │
│  ║  Next: A1 Barbell Bench   ║  │
│  └════════════════════════════┘  │
└──────────────────────────────────┘
```

| Component | Spec |
|-----------|------|
| Active card border | 2px solid `#CDFF00` |
| Inactive card border | 1px solid `#2A2A2A` |
| "YOUR TURN" badge | 12px uppercase, `bg-[#CDFF00]` text-black, rounded-full px-2 |
| "Next:" indicator | 14px, `text-[#666666]`, below active card |
| Transition | `AnimatePresence` slide, 200ms ease-out |
| Skipped card | `opacity-40`, border dashed `#2A2A2A` |

### Completed Sets Badges (Tappable)

```
┌──────────────────────────────────┐
│  Completed Sets                  │
│  ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ S1   │ │ S2   │ │ S3   │     │
│  │60x10 │ │60x8  │ │55x10 │     │
│  └──────┘ └──────┘ └──────┘     │
│                                  │
│  Tap to edit                     │
└──────────────────────────────────┘
```

| Component | Spec |
|-----------|------|
| Badge | `bg-[#1A1A1A]` border `#2A2A2A`, rounded-lg, 44x44px min |
| Badge text | 12px, weight x reps format |
| Tap hint | 12px `text-[#666666]`, only shown first time |
| Skipped badge | `opacity-40`, strikethrough text |

### Save Confirmation Toast

| Component | Spec |
|-----------|------|
| Toast | Bottom center, `bg-[#1A1A1A]`, rounded-lg, 14px |
| Success icon | Green checkmark, 16px |
| Duration | 2 seconds auto-dismiss |
| Error variant | Red icon, "Failed to save, retrying..." |

---

## 7. Technical Spec

### Bug 1: Celebration Animation Fix

```typescript
// src/components/workout/set-logger.tsx
// BEFORE: onComplete fires immediately, unmounting animation
const handleLogSet = () => {
  setShowCelebration(true);
  onComplete(setData); // <-- re-render kills animation
};

// AFTER: wait for animation, then persist
const handleLogSet = () => {
  setShowCelebration(true);
  // onComplete called in onAnimationComplete below
};

const handleAnimationComplete = async () => {
  setShowCelebration(false);
  try {
    await onComplete(setData);
    toast.success("Set saved");
  } catch (error) {
    console.error("Set persist failed:", error);
    // Retry once
    try {
      await onComplete(setData);
    } catch (retryError) {
      toast.error("Failed to save set. Check connection.");
    }
  }
};
```

### Bug 3: Weight Memory Query Fix

```typescript
// src/lib/queries.ts - fix global weight lookup
export async function getLastWeightForExercise(exerciseId: string): Promise<WeightMemory | null> {
  // Query ALL workout logs, not just current training day
  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { sets: true, date: true },
  });

  for (const log of logs) {
    const sets = log.sets as SetLog[];
    // Match by exerciseId OR by builtInId lookup
    const match = sets.find(s =>
      s.exerciseId === exerciseId ||
      s.exerciseId === builtInIdMap.get(exerciseId)
    );
    if (match && !match.skipped) {
      return {
        weight: match.weight,
        reps: match.actualReps,
        targetReps: match.targetReps,
        date: log.date,
        hitTarget: match.actualReps >= match.targetReps,
      };
    }
  }
  return null;
}
```

### Feature 4: SetLog Extension

```typescript
// src/lib/db.ts
export interface SetLog {
  exerciseId: string;
  exerciseName: string;
  supersetLabel: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  unit: string;
  rpe: number;
  isComplete: boolean;
  completedAt: string;
  skipped?: boolean; // NEW: true when auto-incremented or manually skipped
}
```

### Feature 7: Vitest Config

```typescript
// vitest.config.ts (NEW)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/__tests__/**'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### Files to Create

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration with coverage thresholds |
| `src/test/setup.ts` | Test setup (jsdom, mocks) |
| `src/lib/__tests__/gamification.test.ts` | XP calculation unit tests |
| `src/lib/__tests__/workout-helpers.test.ts` | Volume/1RM helper tests |
| `src/lib/__tests__/flatten-exercises.test.ts` | Exercise flattening tests |
| `docs/patterns/code-review.md` | Code review checklist |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | Fix celebration timing, add `onAnimationComplete`, error handling |
| `src/components/workout/superset-view.tsx` | Add `activeExerciseIndex`, transitions, skip button, auto-scroll |
| `src/components/workout/exercise-card.tsx` | Accept `isActive` prop, lime border when active |
| `src/lib/db.ts` | Add `skipped` field to SetLog interface |
| `src/lib/queries.ts` | Fix weight memory query (global scope, builtInId matching) |
| `src/lib/api-client.ts` | Add error handling + retry for set persistence |
| `src/lib/workout-helpers.ts` | Add volume recalculation excluding skipped sets |
| `src/app/workout/[dayId]/page.tsx` | Show completed set badges, wire tap to EditSetDrawer |
| `package.json` | Add vitest, @testing-library/react as devDependencies |

---

## 8. Implementation Plan

### Dependencies Checklist
- [ ] Verify `set-logger.tsx` celebration animation location (lines 36-82)
- [ ] Verify `superset-view.tsx` exercise rendering approach
- [ ] Verify `queries.ts` weight memory query structure
- [ ] Verify `edit-set-drawer.tsx` is functional and accessible
- [ ] Verify `WorkoutLog.sets` JSON field schema in Prisma

### Build Order

**Phase 1: P1 Bug Fixes**
1. Investigate celebration animation + data loss root cause in set-logger.tsx
2. Fix set persistence with atomic write and error handling + retry
3. Fix celebration timing: `onAnimationComplete` callback before `onComplete`
4. Add success/error toast after set save
5. Audit weight memory query in queries.ts: verify global scope
6. Fix exercise ID matching (handle both builtInId and custom ID)
7. Add `activeExerciseIndex` state to superset-view.tsx
8. Add lime border highlight for active exercise card
9. Add AnimatePresence slide transition between exercises
10. Add "Next: [exercise]" indicator text
11. Manual QA: complete full superset workout, verify all data persisted correctly

**Phase 2: P2 Features**
12. Add "Skip Exercise" button to superset-view.tsx
13. Implement auto-increment for skipped exercise set counter
14. Add `skipped` field to SetLog interface in db.ts
15. Show visual indicator (opacity-40, dashed border) for skipped exercises
16. Show completed sets as tappable badges below SetLogger
17. Wire badge tap to open EditSetDrawer with pre-filled values
18. Add volume recalculation in workout-helpers.ts after set edit
19. Capture HTML screenshots with Playwright for docs reference

**Phase 3: P3 Quality**
20. Install Vitest and @testing-library/react as devDependencies
21. Create vitest.config.ts with jsdom environment and coverage
22. Write unit tests for gamification.ts (XP calculations)
23. Write unit tests for workout-helpers.ts (volume, 1RM)
24. Write unit tests for flatten-exercises.ts
25. Add `"test": "vitest"` and `"test:coverage": "vitest --coverage"` to package.json
26. Create code review checklist in docs/patterns/code-review.md

---

## 9. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Animation unmounts before completing | Use `onAnimationComplete` to ensure callback fires after 300ms |
| Set persist fails on network error | Retry once, then show error toast with manual retry option |
| Stale read overwrites newer set data | Use optimistic locking: read current sets, append new set, write atomically |
| Weight memory finds no history | Return null, hide "Last time" indicator, show empty weight input |
| Exercise has builtInId but query uses custom ID | Map both ID types in query via builtInIdMap lookup |
| User skips all exercises in a superset | Allow, mark superset as skipped, advance to next superset |
| User un-skips after advancing | Re-enable exercise card, decrement auto-incremented counter |
| Edit drawer opened but workout timer fires | Timer continues in background, drawer stays open |
| Volume recalculation produces NaN | Guard against null/undefined weight values, default to 0 |
| Vitest import errors with Next.js paths | Configure `@` alias in vitest.config.ts resolve.alias |

---

## 10. Testing

### Functional Tests
- [ ] Set completion: animation plays fully before data callback fires
- [ ] Set persistence: data appears in WorkoutLog.sets after completion
- [ ] Set persistence: retry succeeds on first failure, error toast on second failure
- [ ] Weight memory: pre-fills correct weight from most recent workout (any day)
- [ ] Weight memory: handles builtInId and custom ID exercises
- [ ] Weight memory: returns null for exercises with no history
- [ ] Superset transition: active exercise highlighted with lime border
- [ ] Superset transition: auto-scroll positions active card at top
- [ ] Superset transition: "Next: [exercise]" shows correct exercise name
- [ ] Skip exercise: set counter auto-increments for skipped exercise
- [ ] Skip exercise: skipped card shows dimmed with dashed border
- [ ] Skip exercise: un-skip restores normal appearance
- [ ] Edit set: tap completed set badge opens EditSetDrawer
- [ ] Edit set: save updates badge, recalculates volume
- [ ] Vitest: all tests pass, coverage >80% on target modules

### UI Verification
- [ ] Celebration checkmark animation visible for 300ms minimum
- [ ] Success toast appears bottom-center, auto-dismisses in 2s
- [ ] Active exercise card has 2px lime border, inactive has 1px gray
- [ ] Completed set badges are 44px+ tap targets
- [ ] Skipped exercise at 40% opacity with dashed border
- [ ] "Next: [exercise]" text in muted color below active card
- [ ] EditSetDrawer opens from bottom with pre-filled values
- [ ] All interactive elements meet 44px minimum touch target

---

## 11. Launch Checklist

- [ ] All 3 P1 bugs verified fixed via manual QA (5 complete workout sessions)
- [ ] Celebration animation fires and data persists for every logged set
- [ ] Weight memory correctly pre-fills from last workout (tested across 3+ training days)
- [ ] Superset transitions are smooth with clear active indicator
- [ ] Can skip exercises in supersets without getting blocked
- [ ] Can edit any completed set mid-workout via tap
- [ ] Vitest configured with >80% coverage on gamification, workout-helpers, flatten-exercises
- [ ] No regressions in offline mode (airplane mode test)
- [ ] No regressions in audio feedback (rest timer, set start)
- [ ] No console errors in Vercel production logs
- [ ] CHANGELOG.md updated

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Celebration timing varies across devices | Animation cut short on slow devices | Use fixed 300ms delay minimum, not just animation event |
| Optimistic locking adds complexity | Race conditions in set persistence | Implement read-modify-write pattern with version check |
| Weight memory query is slow (scanning all logs) | Noticeable delay on set start | Add database index on WorkoutLog(userId, date), limit to last 30 days |
| Vitest setup conflicts with Next.js | Build failures, import errors | Use separate vitest.config.ts with proper aliases, exclude test files from Next build |
| Skipped sets confuse progress analytics | Misleading volume/PR trends | Exclude skipped sets from all calculations, show skip rate separately |
| EditSetDrawer conflicts with active workout state | State desync between drawer and main view | Use single source of truth for sets array, drawer reads/writes to same state |

---

## 13. Dependencies

| Dependency | Required For | Status |
|------------|-------------|--------|
| Framer Motion AnimatePresence | Superset transitions | Already installed |
| EditSetDrawer component | Mid-workout editing | Already built (`edit-set-drawer.tsx`) |
| WorkoutLog.sets JSON field | Set persistence fix | Exists in Prisma schema |
| builtInId field on Exercise model | Weight memory ID matching | Requires post-migration-fixes.md |
| Vitest + @testing-library/react | Unit testing infrastructure | Needs npm install |
| Playwright or Puppeteer | UI screenshots | Available via MCP |

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-03-06 | Initial PRD created with 7 issues across P1/P2/P3 |
| 2026-03-26 | PRD quality audit: added design section (ASCII wireframes + component tables), user flows (5 scenarios), edge cases table, expanded testing checklists, added launch checklist, risks table with mitigations, dependencies table with status, implementation build order |
| 2026-03-26 | SHIPPED: Volume calculation excludes skipped sets, weight memory query excludes skipped sets, session memory excludes skipped sets, PR checks exclude skipped sets |

---

## Related PRDs

- [Weight Memory + Edit Sets](./weight-memory-edit-sets.md) - Overlapping scope on weight memory and edit sets (this PRD supersedes for specific bugs/features listed)
- [SetFlow v2 Fixes](./setflow-v2-fixes.md) - Previous fix sprint (different issues)
- [Gamification System](./gamification-system.md) - XP system that celebration animation feeds into
- [Micro Interactions](./micro-interactions.md) - Animation patterns used for celebrations
- [Post-Migration Fixes](./post-migration-fixes.md) - builtInId field required for weight memory fix

---

*Superset & Quality Sprint | Created: 2026-03-06 | Updated: 2026-03-26*
