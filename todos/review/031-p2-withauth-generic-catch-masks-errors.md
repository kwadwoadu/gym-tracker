---
id: REV-031
severity: P2
agent: security-sentinel
status: done
file: src/lib/api-utils.ts
line: 26-30
created: 2026-03-11
---

# withAuth generic catch masks route-specific Prisma errors

## Description
The `withAuth` wrapper's outer try-catch swallows all errors with a generic 500 response. Route-specific Prisma errors (e.g., unique constraint violations, not found) that should return 409 or 404 get masked as 500.

## Proposed Fix
Let route handlers throw typed errors that withAuth can map to appropriate HTTP status codes, or move error handling back to route-level for Prisma-specific errors.

## Context
Found during review of SetFlow Performance & Refactoring Plan implementation (commit 6edda7f).
