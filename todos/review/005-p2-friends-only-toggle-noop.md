---
id: REV-005
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/components/community/leaderboard-list.tsx
line: 21-25
created: 2026-03-07
---

# friendsOnly toggle not connected to filtering logic

## Description
Toggle button exists in UI but displayEntries always equals entries. Misleading UX.

## Proposed Fix
Either implement actual filtering or remove the toggle entirely.

## Context
Found during review of commits c2cf8d6, 29c184d.
