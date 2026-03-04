---
id: REV-008
severity: P2
agent: architecture-strategist
status: done
file: docs/prds/ai-workout-copilot.md
line: N/A
created: 2026-03-04
---

# Copilot storage ambiguous - IndexedDB vs Prisma

## Description
Unclear if CopilotSuggestion uses Dexie or Prisma.

## Proposed Fix
Explicitly state Dexie.js (local IndexedDB, not synced to server).

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
