---
id: REV-003
severity: P2
agent: performance-oracle
status: done
file: src/app/workout/[dayId]/page.tsx
line: 1498-1557
created: 2026-03-06
---

# IIFE in JSX causes unnecessary SetLoggerSheet re-renders

## Description
The IIFE wrapping SetLoggerSheet recalculates session memory and creates new variable bindings on every parent render, breaking referential equality.

## Proposed Fix
Extract to useMemo above the return statement:
```typescript
const sessionMemData = useMemo(() => {
  const sessionMem = sheetFlatExercise
    ? getSessionMemoryForExercise(sheetFlatExercise.exerciseId, sheetSetNumber)
    : null;
  const memSource = sessionMem ? "session" : globalSuggestion ? "historical" : undefined;
  return { sessionMem, memSource };
}, [sheetFlatExercise?.exerciseId, sheetSetNumber, completedSets, globalSuggestion]);
```
