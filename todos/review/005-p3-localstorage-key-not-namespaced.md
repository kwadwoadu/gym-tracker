---
id: REV-005
severity: P3
agent: security-sentinel
status: done
file: src/app/workout/[dayId]/page.tsx
line: 912
created: 2026-03-06
---

# localStorage key not namespaced by user ID

## Description
Key "pending-workout" is global. On a shared device, one user's pending workout overwrites another's.

## Proposed Fix
Use pending-workout-${userId} as the key.

## Context
Found during review of commit 6846e1a.
