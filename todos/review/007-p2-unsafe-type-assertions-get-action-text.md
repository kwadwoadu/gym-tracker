---
id: REV-007
severity: P2
agent: typescript-reviewer
status: done
file: src/app/community/page.tsx
line: 390-411
created: 2026-03-07
---

# Unsafe type assertions in getActionText without validation

## Description
`item.data as { dayName?: string }` bypasses TypeScript safety. If API returns unexpected data, runtime errors follow silently.

## Proposed Fix
Add type guards or validate before accessing properties. All fields are already optional so the risk is low, but explicit checks are safer.

## Context
Found during review of commits c2cf8d6, 29c184d.
