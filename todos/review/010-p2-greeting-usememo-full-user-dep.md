---
id: REV-010
severity: P2
agent: performance-oracle
status: done
file: src/app/page.tsx
line: 121-134
created: 2026-03-07
---

# personalizedGreeting useMemo depends on full user object

## Description
`[user]` dependency causes recalculation when any user property changes. Clerk may return new object references.

## Proposed Fix
Narrow dependency: `[user?.firstName, user?.emailAddresses?.[0]?.emailAddress]`.

## Context
Found during review of commits c2cf8d6, 29c184d.
