---
id: REV-004
severity: P2
agent: typescript-reviewer
status: done
file: src/app/workout/[dayId]/page.tsx
line: 1734
created: 2026-03-06
---

# Async finishWorkout() called without await in retry handler

## Description
The retry button's onClick calls finishWorkout() without await. If it throws, the error becomes an unhandled promise rejection instead of being caught and displayed.

## Proposed Fix
Change to: onClick={async () => { setSaveError(null); await finishWorkout(); }}

## Context
Found during review of commit 6846e1a.
