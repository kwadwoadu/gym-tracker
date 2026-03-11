---
id: REV-034
severity: P2
agent: architecture-strategist
status: done
file: src/app/nutrition/layout.tsx
line: 10-13
created: 2026-03-11
---

# Nutrition layout missing try-catch for auth failure

## Description
The server component calls `getClerkId()` without try-catch. If the auth helper throws (e.g., JWT decode failure, cookie parsing error), the entire nutrition section renders a Next.js error boundary instead of gracefully redirecting.

## Proposed Fix
Wrap `getClerkId()` in try-catch and redirect to `/` on any error.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
