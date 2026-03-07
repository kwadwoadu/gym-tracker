---
id: REV-014
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/app/gamification/page.tsx
line: 48-52
created: 2026-03-07
---

# Missing error handling in gamification page queries

## Description
All 5 useQuery hooks ignore error state. Failed queries show no feedback to user.

## Proposed Fix
Destructure `error` from hooks, add error banner conditional render before loading state.

## Context
Found during review of commits c2cf8d6, 29c184d.
