---
id: REV-002
severity: P2
agent: typescript-reviewer
status: pending
file: src/components/workout/exercise-card.tsx, src/components/workout/set-logger.tsx
line: 238, 447
created: 2026-03-04
---

# Non-null assertion on optional exerciseId

## Description
exerciseId is declared optional (string | undefined) but used with `!` non-null assertion when passing to FormCamera. Guards check `hasFormAnalysis && formRule` but don't explicitly verify exerciseId truthiness.

## Proposed Fix
Add exerciseId to the guard condition:
```tsx
{formRule && exerciseId && (
  <FormCamera exerciseId={exerciseId} ... />
)}
```

## Context
Found during review of commit 06291ea.
