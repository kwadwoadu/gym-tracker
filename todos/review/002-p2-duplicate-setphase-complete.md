---
id: REV-002
severity: P2
agent: code-simplicity-reviewer
status: false-positive
file: src/app/workout/[dayId]/page.tsx
line: 917, 940
created: 2026-03-06
---

# Duplicate setPhase("complete") calls in finishWorkout

## Description
setPhase("complete") is called twice - once optimistically before API save (line 917), then again after save succeeds (line 940). The second call is redundant and its accompanying clearSession() is also redundant.

## Proposed Fix
Remove the duplicate setPhase("complete") and clearSession() at line 940-941.
