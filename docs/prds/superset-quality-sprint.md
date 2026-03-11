# PRD: Superset & Quality Sprint

> **Status:** Not Started
> **Owner:** Kwadwo
> **Created:** 2026-03-06
> **Project:** gym-tracker (SetFlow Webapp)
> **Priority:** High (P1 bugs + P2 features + P3 quality)

---

## 1. Problem

SetFlow has accumulated 7 issues across bugs, feature gaps, and quality concerns that collectively degrade the workout experience. These range from data-loss bugs that break trust, to UX friction in superset flows, to missing quality infrastructure.

### Issue Summary

| # | Issue | Priority | Category | Impact |
|---|-------|----------|----------|--------|
| 1 | No celebration animation after finishing set + data disappears | P1 | Bug | Data loss, broken reward loop |
| 2 | Superset flow doesn't transition nicely between exercises | P1 | Bug | Confusing UX during supersets |
| 3 | Doesn't correctly remember last set data (kg, reps, etc) | P1 | Bug | Wrong weight suggestions, manual re-entry |
| 4 | Superset single-exercise mode: auto-increment other exercise's set count | P2 | Feature | Users stuck when skipping one exercise in a pair |
| 5 | Quickly edit set data for previous sets while working out | P2 | Feature | Can't fix mistakes mid-workout |
| 6 | Get HTML screenshots of planned UI/UX updates | P2 | Feature | Visual reference for integration |
| 7 | Add unit testing and code reviews for the stack | P3 | Quality | No test safety net, no review process |

**Who has this problem?** All active SetFlow users, especially during superset workouts.

**What happens if we don't solve it?** Users lose trust (data loss), waste time re-entering data, get frustrated with rigid superset flows, and bugs compound without test coverage.

---

## 2. Solution

### P1 Bugs - Fix First

#### Bug 1: Celebration animation not firing + data loss

The celebration animation exists in `set-logger.tsx` (Framer Motion checkmark pop + scale bounce at lines 36-82) but either:
- The `onComplete` callback fires before the animation completes, causing a re-render that unmounts the animation
- The data write to the server (WorkoutLog sets JSON field) fails silently after the celebration triggers
- IndexedDB/Prisma sync timing issue where data is written optimistically then lost on sync conflict

**Fix approach:**
1. Ensure `onComplete` callback waits for animation to finish (use `onAnimationComplete`)
2. Add error handling + retry on the set persistence call
3. Verify the WorkoutLog `sets` JSON field is updated atomically (not overwritten by a stale read)
4. Add a toast/indicator confirming the set was saved

#### Bug 2: Superset transition UX

Current `superset-view.tsx` renders exercises as a static list with no transition state. When cycling A1 -> A2 -> A1, the user has no visual indicator of which exercise is next or active.

**Fix approach:**
1. Add an `activeExerciseIndex` state to `superset-view.tsx`
2. Highlight the current exercise with lime accent border
3. Auto-scroll to the next exercise after set completion
4. Add a subtle slide/fade transition between exercises using Framer Motion `AnimatePresence`
5. Show "Next: [exercise name]" indicator after completing a set

#### Bug 3: Last set data not remembered correctly

The weight memory system exists (`suggestedWeight`, `suggestedReps`, `suggestedRpe` props in `SetLogger`) but the query fetching previous workout data may be:
- Filtering by wrong `exerciseId` (built-in vs custom exercise ID mismatch)
- Only looking at the same training day instead of all workout logs globally
- Returning stale data from IndexedDB cache instead of latest Prisma data

**Fix approach:**
1. Audit the API route that fetches last workout data for an exercise
2. Ensure query searches ALL `WorkoutLog.sets` (JSON field) by `exerciseId`, ordered by date descending
3. Handle both `builtInId` and custom exercise `id` matching
4. Verify the `memorySource` prop correctly distinguishes session vs historical data

### P2 Features - Build Next

#### Feature 4: Superset single-exercise auto-increment

When a superset has exercises A1 and A2, but the user only performs A1 (skipping A2), the set counter for A2 should auto-increment so the user can proceed to A1 set 2 without being blocked.

**Implementation:**
1. Add "Skip exercise" action to `superset-view.tsx` for each exercise in the pair
2. When skipped, auto-advance the set counter for the skipped exercise
3. Mark skipped sets with a `skipped: true` flag in the `SetLog`
4. Show visual indicator (dimmed/strikethrough) for skipped sets
5. Allow the user to un-skip if they change their mind

#### Feature 5: Quick edit previous sets mid-workout

The `edit-set-drawer.tsx` component already exists with weight/reps/RPE editing. The gap is accessing it during an active workout for previously completed sets.

**Implementation:**
1. Show completed sets as tappable badges below the current SetLogger
2. Tapping a completed set opens `EditSetDrawer` with that set's data
3. On save, update the in-memory workout state and persist to server
4. Recalculate volume totals after edit
5. Show brief confirmation toast after successful edit

#### Feature 6: HTML screenshots of UI/UX updates

Capture current state of planned UI/UX improvements as visual references.

**Implementation:**
1. Use Playwright/Puppeteer to screenshot key screens at gym.adu.dk
2. Store screenshots in `/docs/screenshots/` or `/inspiration/`
3. Reference in PRDs and design discussions

### P3 Quality - Foundation

#### Quality 7: Unit testing + code review process

No test infrastructure exists. Critical paths (set persistence, weight memory, superset logic) have zero coverage.

**Implementation:**
1. Set up Vitest for unit testing (Next.js 15 compatible)
2. Add test files for critical modules:
   - `src/lib/gamification.test.ts` - XP calculations
   - `src/lib/workout-helpers.test.ts` - Volume, 1RM estimates
   - `src/lib/flatten-exercises.test.ts` - Exercise flattening
3. Add component tests for `SetLogger` and `SupersetView` with React Testing Library
4. Configure pre-commit hook or CI check for test runs
5. Document code review checklist in `/docs/patterns/code-review.md`

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Data persistence | 0 data loss events | Manual QA: complete 5 workouts, verify all sets saved |
| Celebration animation | Fires 100% of the time | Visual verification on set completion |
| Weight memory accuracy | Correct for 100% of exercises | Compare suggested weight vs actual last workout data |
| Superset transitions | Smooth visual flow | UX review during superset workout |
| Quick edit usage | Available for all completed sets | Tap any completed set badge to edit |
| Test coverage | >80% for critical lib modules | Vitest coverage report |
| Skipped exercise handling | No blocking on single-exercise supersets | Complete workout with one exercise skipped |

---

## 4. Requirements

### Must Have
- [ ] Fix celebration animation firing reliably on set completion
- [ ] Fix data persistence - sets must not disappear after logging
- [ ] Fix weight/reps/RPE memory for all exercises across all training days
- [ ] Smooth superset exercise transitions with active indicator
- [ ] Auto-increment skipped exercise set count in supersets
- [ ] Tappable completed sets to open edit drawer mid-workout

### Should Have
- [ ] "Next: [exercise]" indicator after completing a superset set
- [ ] Toast confirmation when set is saved successfully
- [ ] Visual indicator (dimmed) for skipped superset exercises
- [ ] Vitest setup with tests for critical lib modules
- [ ] HTML screenshots of current UI state for reference

### Won't Have (this sprint)
- Full E2E test suite (too large for this sprint)
- CI/CD pipeline changes (separate task)
- Refactoring superset data model (keep JSON in WorkoutLog.sets)

---

## 5. Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/workout/set-logger.tsx` | Fix celebration animation timing, ensure `onComplete` waits for animation |
| `src/components/workout/superset-view.tsx` | Add active exercise tracking, transitions, skip functionality |
| `src/components/workout/exercise-card.tsx` | Accept `isActive` prop for highlight state |
| `src/components/workout/edit-set-drawer.tsx` | No changes needed - already functional |
| `src/lib/db.ts` | Verify `SetLog` persistence path, add `skipped` field |
| `src/lib/queries.ts` | Audit/fix weight memory query (cross-day, builtInId matching) |
| `src/lib/api-client.ts` | Add error handling + retry for set persistence |
| `prisma/schema.prisma` | No schema changes needed (sets stored as JSON) |
| `src/lib/workout-helpers.ts` | Add volume recalculation after set edit |

### New Files

| File | Purpose |
|------|---------|
| `src/lib/__tests__/gamification.test.ts` | XP calculation unit tests |
| `src/lib/__tests__/workout-helpers.test.ts` | Volume/1RM helper tests |
| `src/lib/__tests__/flatten-exercises.test.ts` | Exercise flattening tests |
| `vitest.config.ts` | Vitest configuration |
| `docs/patterns/code-review.md` | Code review checklist |

### Data Model Notes

The `SetLog` interface in `db.ts` (line 80-93) stores: `exerciseId`, `exerciseName`, `supersetLabel`, `setNumber`, `targetReps`, `actualReps`, `weight`, `unit`, `rpe`, `isComplete`, `completedAt`.

For skipped sets, extend with:
```typescript
export interface SetLog {
  // ... existing fields
  skipped?: boolean;  // true when auto-incremented in single-exercise superset mode
}
```

The `WorkoutLog.sets` field in Prisma is `Json @default("[]")` (schema.prisma line 148), so no migration needed - the new field is additive to the JSON structure.

---

## 6. Implementation Checklist (Priority Order)

### Phase 1: P1 Bug Fixes (Do First)
1. [ ] Investigate celebration animation + data loss root cause
2. [ ] Fix set persistence (ensure atomic write, add error handling)
3. [ ] Fix celebration animation timing (`onAnimationComplete` callback)
4. [ ] Audit weight memory query - verify cross-day, cross-program lookup
5. [ ] Fix exercise ID matching (builtInId vs custom id)
6. [ ] Add active exercise indicator to superset-view
7. [ ] Add slide transition between superset exercises
8. [ ] Manual QA: complete full superset workout, verify all data persisted

### Phase 2: P2 Features
9. [ ] Add skip exercise button to superset-view
10. [ ] Implement auto-increment for skipped exercise set count
11. [ ] Add `skipped` field to SetLog interface
12. [ ] Show completed sets as tappable badges in workout view
13. [ ] Wire tap -> EditSetDrawer for mid-workout editing
14. [ ] Add volume recalculation after set edit
15. [ ] Capture HTML screenshots of current UI state

### Phase 3: P3 Quality
16. [ ] Install and configure Vitest
17. [ ] Write unit tests for `gamification.ts`
18. [ ] Write unit tests for `workout-helpers.ts`
19. [ ] Write unit tests for `flatten-exercises.ts`
20. [ ] Create code review checklist pattern doc
21. [ ] Add test script to `package.json`

---

## 7. Launch Criteria

- [ ] All 3 P1 bugs verified fixed via manual QA (5 workout sessions)
- [ ] Celebration animation fires and data persists for every set
- [ ] Weight memory correctly pre-fills from last workout (any training day)
- [ ] Superset transitions are smooth with clear active indicator
- [ ] Can skip exercises in supersets without getting blocked
- [ ] Can edit any completed set mid-workout
- [ ] Vitest configured with >80% coverage on critical lib modules
- [ ] No regressions in existing workout flow (offline, audio, rest timer)

---

## 8. Related PRDs

- `weight-memory-edit-sets.md` - Overlapping scope on weight memory and edit sets (this PRD supersedes for the specific bugs/features listed)
- `setflow-v2-fixes.md` - Previous fix sprint (different issues)
- `gamification-system.md` - XP system that celebration animation feeds into
- `micro-interactions.md` - Animation patterns used for celebrations

---

*Created: 2026-03-06*
