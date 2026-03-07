---
id: REV-003
severity: P1
agent: agent-native-reviewer
status: done
file: src/app/CLAUDE.md
line: 14-21
created: 2026-03-07
---

# New routes /gamification and /community not documented in app CLAUDE.md

## Description
Route Structure section is stale - doesn't include /gamification or /community. Agents discovering features via docs miss these pages.

## Proposed Fix
Add to Route Structure section:
```
- `/gamification` - XP/Levels, daily/weekly challenges, achievements gallery
- `/community` - Leaderboard, activity feed, workout templates, groups
```

## Context
Found during review of commits c2cf8d6, 29c184d.
