---
id: REV-002
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/app/workout/[dayId]/page.tsx
line: 912
created: 2026-03-06
---

# Pending workout data never recovered on app reload

## Description
localStorage.setItem("pending-workout", ...) saves data as a safety net, but no code reads it back on next app load to retry the sync. If the API fails and the user closes the tab, the localStorage data is orphaned.

## Proposed Fix
Add recovery logic (e.g., in home page or a useEffect) that checks for "pending-workout" on mount, retries the API call, and clears on success.

## Context
Found during review of commit 6846e1a.
