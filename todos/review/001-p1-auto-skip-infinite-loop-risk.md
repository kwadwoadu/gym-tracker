---
id: REV-001
severity: P1
agent: performance-oracle
status: done
file: src/app/workout/[dayId]/page.tsx
line: 502-517
created: 2026-03-06
---

# Auto-skip useEffect may cause infinite re-render loop

## Description
The auto-skip useEffect calls handleSkipSet() which updates workoutState, which re-triggers the effect. Missing trainingDay in deps creates stale closures. The eslint-disable suppresses the warning but doesn't fix the root cause.

## Proposed Fix
Add a useRef guard to track the last processed exercise/set combo and prevent re-entry. Add trainingDay to deps.

```typescript
const lastAutoSkippedRef = useRef<string | null>(null);

useEffect(() => {
  if (phase !== "exercise" || !trainingDay || autoSkipExercises.size === 0) return;
  const superset = trainingDay.supersets[workoutState.supersetIndex];
  if (!superset) return;
  const exerciseData = superset.exercises[workoutState.exerciseIndex];
  if (!exerciseData) return;
  const key = `${exerciseData.exerciseId}-${workoutState.setNumber}`;
  if (autoSkipExercises.has(exerciseData.exerciseId) && lastAutoSkippedRef.current !== key) {
    lastAutoSkippedRef.current = key;
    handleSkipSet();
  }
}, [phase, trainingDay, workoutState.supersetIndex, workoutState.exerciseIndex, workoutState.setNumber, autoSkipExercises]);
```
