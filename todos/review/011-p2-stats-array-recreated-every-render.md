---
id: REV-011
severity: P2
agent: performance-oracle
status: done
file: src/components/home/QuickStatsGrid.tsx
line: 27-46
created: 2026-03-07
---

# QuickStatsGrid stats array recreated every render

## Description
`stats` array defined inside component body without useMemo. New object references every render.

## Proposed Fix
Wrap in `useMemo(() => [...], [weeklyWorkouts, totalPRs, totalVolume])`.

## Context
Found during review of commits c2cf8d6, 29c184d.
