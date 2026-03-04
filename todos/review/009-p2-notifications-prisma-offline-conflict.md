---
id: REV-009
severity: P2
agent: architecture-strategist
status: done
file: docs/prds/smart-notifications.md
line: N/A
created: 2026-03-04
---

# Smart notifications Prisma conflicts with offline-first architecture

## Description
Push subscriptions require server-side PostgreSQL, breaking local-first model.

## Proposed Fix
Add Architecture Note explaining why notifications are an exception to offline-first.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
