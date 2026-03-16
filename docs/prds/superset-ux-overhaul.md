# PRD: Superset UX Overhaul

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-11
> **Priority:** P1 Bug + P2 Feature
> **Type:** UX Enhancement

---

## 1. Problem

### Problem A (P1): No superset context during workout
During a superset workout, there's no visual indicator showing which exercise is active within the superset pair. When transitioning A1 -> rest -> A2, the user loses context of where they are in the superset cycle. The carousel doesn't auto-scroll to the next exercise after rest completes.

### Problem B (P2): No focus mode for single-exercise completion
The default traversal alternates: A1S1 -> A2S1 -> A1S2 -> A2S2. Some users prefer completing all sets of one exercise first (A1S1 -> A1S2 -> A1S3 -> A1S4 -> A2S1...). Currently, the only option is to skip A2 each time, which creates misleading SetLog entries with weight: 0, reps: 0, skipped: true.

### Impact
- Users get disoriented during supersets (especially 3+ exercise supersets)
- After rest, must manually swipe to find the next exercise
- Ghost SetLog entries from skipping pollute workout data

---

## 2. Solution

### A. Superset Context Bar
A compact bar above the carousel showing:
- Superset label ("Superset A")
- Exercise position indicators (A1 highlighted lime, A2 dimmed)
- Set progress ("Set 2 of 4")
- Focus mode toggle button

### B. Auto-scroll after rest
When rest phase ends and exercise phase resumes, auto-scroll the carousel to the exercise that matches the current `workoutState`.

### C. Focus Mode
A toggle in the context bar that changes traversal:
- **Normal**: A1S1 -> A2S1 -> A1S2 -> A2S2 (alternating)
- **Focus**: A1S1 -> A1S2 -> A1S3 -> A1S4 -> A2S1 -> A2S2... (sequential)

Focus mode modifies the next-position calculation in `handleSetComplete` without creating any SetLog entries for the skipped exercise.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Superset context visible | Always during superset exercises | Visual verification |
| Auto-scroll accuracy | Correct exercise shown after rest | Manual QA |
| Focus mode traversal | All sets of exercise complete before next | Log 4 sets in focus mode |
| No ghost sets in focus mode | Zero skipped SetLog entries | Check completedSets array |

---

## 4. Requirements

### Must Have
- [ ] Superset context bar with exercise position indicators
- [ ] Auto-scroll carousel to current exercise after rest phase
- [ ] Focus mode toggle that changes traversal order
- [ ] Focus mode creates no ghost/skipped SetLog entries

### Won't Have
- No changes to rest timer behavior
- No changes to the SetLoggerSheet component
- No changes to workout-helpers.ts

---

## 5. Technical Spec

### Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/superset-context-bar.tsx` | New component (~80 lines) |
| `src/app/workout/[dayId]/page.tsx` | Add context bar, focus mode state, auto-scroll, modify traversal |

### A. SupersetContextBar Component

```typescript
interface SupersetContextBarProps {
  supersetLabel: string;
  exercises: { id: string; name: string }[];
  activeExerciseIndex: number;
  setNumber: number;
  totalSets: number;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}
```

Renders:
- Superset label badge
- Row of exercise pills (active = lime bg, inactive = muted)
- "Set X of Y" text
- Focus mode toggle (icon button with tooltip)

### B. Auto-scroll

In the `handleRestComplete` handler, sync carousel to current workout state:
```typescript
const handleRestComplete = () => {
  // Find the flat index for the current workout state
  const targetIndex = flatExercises.findIndex(
    (f) => f.supersetId === trainingDay.supersets[workoutState.supersetIndex].id
      && f.indexInSuperset === workoutState.exerciseIndex
  );
  if (targetIndex >= 0) setCarouselIndex(targetIndex);
  setPhase("exercise");
  audioManager.playSetStart();
};
```

### C. Focus Mode Traversal

When `focusMode` is true, `handleSetComplete` changes next-position:
```typescript
// Focus mode: increment setNumber, stay on same exercise
if (focusMode) {
  nextSetNumber++;
  // Keep same exercise index
  if (nextSetNumber > totalSets) {
    // Move to next exercise in superset
    nextExerciseIndex++;
    nextSetNumber = 1;
    if (nextExerciseIndex >= exercisesInSuperset) {
      // Done with superset, move to next
      nextExerciseIndex = 0;
      nextSupersetIndex++;
      // ... same end-of-workout logic
    }
  }
}
```

---

## 6. Implementation Checklist

1. [ ] Create `superset-context-bar.tsx` component
2. [ ] Add `focusMode` state to page.tsx
3. [ ] Render SupersetContextBar in exercise phase (only for supersets with >1 exercise)
4. [ ] Modify `handleRestComplete` to auto-scroll carousel
5. [ ] Modify `handleSetComplete` to support focus mode traversal
6. [ ] Test: normal mode traversal unchanged
7. [ ] Test: focus mode completes all sets of one exercise first
8. [ ] Test: auto-scroll shows correct exercise after rest

---

## 7. Launch Criteria

- [ ] Context bar visible during superset exercises
- [ ] Context bar hidden for single-exercise supersets
- [ ] Auto-scroll works after rest phase
- [ ] Focus mode toggle persists within workout session
- [ ] Focus mode traversal creates zero ghost SetLog entries
- [ ] Normal mode traversal unchanged (no regression)

---

*Created: 2026-03-11*
