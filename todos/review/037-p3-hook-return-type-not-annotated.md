---
id: REV-037
severity: P3
agent: typescript-reviewer
status: done
file: src/hooks/use-workout-session.ts
line: 1
created: 2026-03-11
---

# Hook return type not explicitly annotated

## Description
`useWorkoutSession` returns a large object but has no explicit return type annotation. TypeScript infers it, but an explicit type would improve IDE experience and catch accidental API changes.

## Proposed Fix
Define and export a `UseWorkoutSessionReturn` interface, annotate the hook's return type.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
