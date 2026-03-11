# PRD: Set Completion Data Safety

> **Status:** Ready
> **Owner:** Kwadwo
> **Created:** 2026-03-11
> **Priority:** P1 (Data Loss Bug)
> **Type:** Bug Fix

---

## 1. Problem

### What's broken
When a user completes a set, the `onComplete` callback (which saves the data) is delayed by 600ms to let the celebration animation play. If the component unmounts during this window - via rapid navigation, browser back, or the parent re-rendering - the timeout is cleared and **set data is permanently lost**.

### Root cause
`src/components/workout/set-logger.tsx` line 287-291:
```typescript
const handleComplete = () => {
    setIsCompleted(true);
    completionTimerRef.current = setTimeout(
      () => onComplete(weight, reps, rpe),
      COMPLETION_ANIMATION_MS // 600ms
    );
};
```

Line 149 clears this timeout on unmount:
```typescript
return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
```

This means: unmount during animation = data gone.

### Impact
- Users lose workout data silently
- Breaks trust in the app
- Violates "Workout Data is Sacred" rule from CLAUDE.md

---

## 2. Solution

**Save first, animate second.** Call `onComplete` immediately to commit data, then show the celebration animation as a non-blocking visual overlay.

```typescript
const handleComplete = () => {
    // 1. SAVE DATA IMMEDIATELY - never delay this
    onComplete(weight, reps, rpe);
    // 2. Show celebration animation (cosmetic only)
    setIsCompleted(true);
};
```

The celebration animation (`cardCompleteVariants`, `checkmarkVariants`, `loggedTextVariants`) still plays for visual feedback, but data is already saved before the animation starts. The 600ms delay and `completionTimerRef` are removed entirely.

---

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Data loss events | 0 | Complete 20 sets rapidly, verify all saved |
| Celebration animation | Still plays | Visual verification |
| Animation smoothness | 60fps | No jank during save+animate |

---

## 4. Requirements

### Must Have
- [ ] `onComplete` called synchronously (no setTimeout)
- [ ] Celebration animation still plays after data is saved
- [ ] Remove `COMPLETION_ANIMATION_MS` delay from data path
- [ ] Remove `completionTimerRef` (no longer needed for data)

### Won't Have
- No changes to animation design itself
- No new toast/notification (existing animation serves as confirmation)

---

## 5. Technical Spec

### Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | Reorder handleComplete: save first, animate second. Remove completionTimerRef and COMPLETION_ANIMATION_MS from data path. |

### Implementation Detail

**Before (broken):**
```typescript
const COMPLETION_ANIMATION_MS = 600;
const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
    return () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); };
}, []);

const handleComplete = () => {
    setIsCompleted(true);
    completionTimerRef.current = setTimeout(
      () => onComplete(weight, reps, rpe),
      COMPLETION_ANIMATION_MS
    );
};
```

**After (safe):**
```typescript
const handleComplete = () => {
    // Save data immediately - never risk data loss for animation
    onComplete(weight, reps, rpe);
    // Then show celebration (cosmetic only, safe to lose on unmount)
    setIsCompleted(true);
};
```

Remove:
- `const COMPLETION_ANIMATION_MS = 600;` (line 19)
- `const completionTimerRef = useRef<NodeJS.Timeout | null>(null);` (line 146)
- The cleanup useEffect for completionTimerRef (line 148-149)

The `isCompleted` state still drives the celebration animation (`cardCompleteVariants`, `checkmarkVariants`, `loggedTextVariants`) which plays immediately on state change. The parent component handles the phase transition (exercise -> rest) in its own `handleSetComplete`, which now fires immediately instead of 600ms later.

### Edge case: Double-tap prevention
The parent's `handleSetComplete` already advances the workout state, which re-renders SetLogger with new props (new exercise/set), so double-tap is naturally prevented by the state change.

---

## 6. Implementation Checklist

1. [ ] Remove `COMPLETION_ANIMATION_MS` constant (line 19)
2. [ ] Remove `completionTimerRef` ref and its cleanup useEffect (lines 146, 148-149)
3. [ ] Rewrite `handleComplete` to call `onComplete` first, then `setIsCompleted(true)` (lines 287-291)
4. [ ] Verify celebration animation still plays (cardCompleteVariants, checkmarkVariants, loggedTextVariants are driven by `isCompleted` state)
5. [ ] Test: complete 10 sets rapidly, verify all data persists
6. [ ] Test: navigate back during animation, verify last set was saved

---

## 7. Launch Criteria

- [ ] Zero data loss in rapid-completion testing (20+ sets)
- [ ] Celebration animation visually unchanged
- [ ] No console errors during set completion
- [ ] Offline test: complete set in airplane mode, verify saved to IndexedDB

---

*Created: 2026-03-11*
