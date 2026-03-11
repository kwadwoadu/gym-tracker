# PRD: Weight Memory Persistence

> **Status:** Ready
> **Owner:** Kwadwo
> **Created:** 2026-03-11
> **Priority:** P1 (Data Quality Bug)
> **Type:** Bug Fix + UX Enhancement

---

## 1. Problem

### What's broken
Weight doesn't persist across different training days or programs. If a user does Bench Press at 80kg on Day 1, then opens Bench Press on Day 2 (or a different program), the weight input defaults to 20kg instead of pre-filling 80kg.

### Root cause
Two competing weight memory systems exist:

1. **Day-specific** (`getSuggestedWeight`): Only looks at the last workout for the same `dayId`. Cross-day or cross-program use = no data.

2. **Global cross-day** (`getGlobalWeightSuggestion`): Searches all 50 recent workouts for the exercise. Returns weight, reps, RPE, date, and nudge weight. This is the correct system for cross-day memory.

In `page.tsx:1547`, the `suggestedWeight` prop uses day-specific as fallback instead of global:
```typescript
suggestedWeight={sessionMemData.sessionMem?.weight ?? weightSuggestion?.weight}
//                                                    ^^^ day-specific only!
// Missing: globalSuggestion?.suggestedWeight (cross-day)
```

Similarly, `lastWeekWeight` and `lastWeekReps` only use day-specific data (lines 1550-1551), so the "Last workout" reference section in SetLogger is empty for cross-day exercises.

### Impact
- Users manually re-enter weights every time they switch days/programs
- No progressive overload nudge across programs
- "Last workout" reference section invisible for cross-day exercises
- Undermines trust in the smart memory system

---

## 2. Solution

### Fix weight suggestion priority
Consolidate the memory priority chain: **session > global > day-specific**.

```typescript
// BEFORE (broken - missing global fallback):
suggestedWeight={sessionMemData.sessionMem?.weight ?? weightSuggestion?.weight}

// AFTER (correct priority):
suggestedWeight={
  sessionMemData.sessionMem?.weight
  ?? globalSuggestion?.nudgeWeight  // progressive overload (if conditions met)
  ?? globalSuggestion?.suggestedWeight  // last used weight (cross-day)
  ?? weightSuggestion?.weight  // day-specific fallback
}
```

### Fix lastWeekWeight/lastWeekReps fallback
Add global fallback so "Last workout" reference shows for cross-day exercises:

```typescript
lastWeekWeight={weightSuggestion?.lastWeekWeight ?? globalSuggestion?.lastWeight}
lastWeekReps={weightSuggestion?.lastWeekReps ?? globalSuggestion?.lastReps}
```

### Verify exerciseId matching
Confirm `getGlobalWeightSuggestion` uses bare `exerciseId` (not `${exerciseId}-${dayId}`) so matching works across programs.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cross-day weight pre-fill | Works | Do Bench on Day 1, open Bench on Day 2, verify pre-filled |
| "Last workout" visible | Shows for cross-day | Open exercise done on different day, see reference |
| Progressive overload nudge | Works cross-day | Hit target reps, switch day, see nudge weight |
| Session memory priority | Still highest | Log set 1, verify set 2 shows set 1's values |

---

## 4. Requirements

### Must Have
- [ ] `suggestedWeight` priority: session > global (nudge) > global (last) > day-specific
- [ ] `lastWeekWeight` falls back to global when day-specific is null
- [ ] `lastWeekReps` falls back to global when day-specific is null
- [ ] "Last workout" reference section visible for cross-day exercises

### Won't Have
- No changes to `getGlobalWeightSuggestion()` logic (verified correct)
- No new API endpoints
- No UI redesign (existing reference section already handles display)

---

## 5. Technical Spec

### Files to Modify

| File | Change |
|------|--------|
| `src/app/workout/[dayId]/page.tsx` | Fix weight suggestion priority in SetLoggerSheet props (lines 1547-1551) |

### Implementation Detail

**Line 1547 - suggestedWeight priority fix:**
```typescript
// BEFORE:
suggestedWeight={sessionMemData.sessionMem?.weight ?? weightSuggestion?.weight}

// AFTER:
suggestedWeight={
  sessionMemData.sessionMem?.weight
  ?? globalSuggestion?.nudgeWeight
  ?? globalSuggestion?.suggestedWeight
  ?? weightSuggestion?.weight
}
```

**Lines 1550-1551 - lastWeek fallback fix:**
```typescript
// BEFORE:
lastWeekWeight={weightSuggestion?.lastWeekWeight}
lastWeekReps={weightSuggestion?.lastWeekReps}

// AFTER:
lastWeekWeight={weightSuggestion?.lastWeekWeight ?? globalSuggestion?.lastWeight}
lastWeekReps={weightSuggestion?.lastWeekReps ?? globalSuggestion?.lastReps}
```

### Verification: exerciseId matching
`getGlobalWeightSuggestion(exerciseId)` at `workout-helpers.ts:68` filters by `s.exerciseId === exerciseId` (line 90). The `exerciseId` comes from `superset.exercises[idx].exerciseId` which is the canonical exercise ID from `program.json`. Same exercise in different days/programs uses the same `exerciseId`. Matching is correct.

---

## 6. Implementation Checklist

1. [ ] Fix `suggestedWeight` prop to use global fallback with nudge priority (line 1547)
2. [ ] Fix `lastWeekWeight` prop to fall back to `globalSuggestion?.lastWeight` (line 1550)
3. [ ] Fix `lastWeekReps` prop to fall back to `globalSuggestion?.lastReps` (line 1551)
4. [ ] Verify session memory still takes priority (log set 1, check set 2 pre-fill)
5. [ ] Test: Do exercise on Day 1, open same exercise on Day 2, verify weight pre-filled
6. [ ] Test: "Last workout" reference visible for cross-day exercises

---

## 7. Launch Criteria

- [ ] Cross-day weight pre-fill works (different dayId, same exercise)
- [ ] Session memory still highest priority (within-workout carry-over)
- [ ] "Last workout" reference visible with date for cross-day exercises
- [ ] No console errors during weight suggestion fetch
- [ ] Progressive overload nudge works cross-day (hit target -> switch day -> see increase)

---

*Created: 2026-03-11*
