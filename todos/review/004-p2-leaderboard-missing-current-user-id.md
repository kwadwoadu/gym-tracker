---
id: REV-004
severity: P2
agent: pattern-recognition-specialist
status: done
file: src/app/community/page.tsx
line: 222
created: 2026-03-07
---

# currentUserId hardcoded to empty string in leaderboard

## Description
`currentUserId=""` prevents leaderboard from highlighting the current user's row. Clerk's useUser is available but not used.

## Proposed Fix
Import useUser, pass `user?.id ?? ""` to LeaderboardList.

## Context
Found during review of commits c2cf8d6, 29c184d.
