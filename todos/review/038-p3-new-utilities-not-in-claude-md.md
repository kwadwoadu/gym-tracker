---
id: REV-038
severity: P3
agent: agent-native-reviewer
status: done
file: src/lib/CLAUDE.md
line: 39-50
created: 2026-03-11
---

# New utilities not referenced in CLAUDE.md docs

## Description
`src/lib/api-utils.ts` (withAuth/withAuthParams) and `src/hooks/use-workout-session.ts` are new key files not documented in the CLAUDE.md key files tables.

## Proposed Fix
Add entries to `/src/lib/CLAUDE.md` key files table for `api-utils.ts` and add a hooks section or reference `use-workout-session.ts`.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
