---
id: REV-035
severity: P2
agent: typescript-reviewer
status: done
file: src/lib/api-utils.ts
line: 37
created: 2026-03-11
---

# withAuthParams generic P unconstrained

## Description
`withAuthParams<P>` has no constraint on the generic type P. Callers can pass any type, including ones that don't match Next.js dynamic route params shape. Should be constrained to `Record<string, string>`.

## Proposed Fix
Change to `withAuthParams<P extends Record<string, string>>` to enforce params shape at compile time.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
