---
id: REV-004
severity: P2
agent: code-simplicity-reviewer
status: done
file: src/components/workout/exercise-card.tsx, src/components/workout/set-logger.tsx
line: 55, 148
created: 2026-03-04
---

# Redundant hasFormAnalysis computed value

## Description
Both formRule and hasFormAnalysis are computed separately. hasFormAnalysis is redundant since formRule being non-null already implies form analysis support.

## Proposed Fix
Remove hasFormAnalysis variable. Use `formRule` alone in guards:
```tsx
const formRule = exerciseId ? getFormRuleByExerciseId(exerciseId) : null;
// Remove: const hasFormAnalysis = ...
// Use: {formRule && exerciseId && ( ... )}
```

## Context
Found during review of commit 06291ea.
