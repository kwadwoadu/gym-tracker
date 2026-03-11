---
id: REV-033
severity: P2
agent: performance-oracle
status: done
file: src/hooks/use-workout-session.ts
line: 225-241
created: 2026-03-11
---

# weightSuggestionsMap useMemo depends on getCurrentExercise callback

## Description
The `weightSuggestionsMap` useMemo depends on `getCurrentExercise` which is a callback that changes reference on every render. This defeats memoization - the map is recalculated every render despite being expensive.

## Proposed Fix
Depend on the underlying primitive values (e.g., `currentExerciseIndex`, `flatExercises`) instead of the callback function, or stabilize `getCurrentExercise` with `useCallback`.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
