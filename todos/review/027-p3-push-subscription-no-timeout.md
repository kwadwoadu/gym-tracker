---
id: REV-027
severity: P3
agent: performance-oracle
status: done
file: docs/prds/smart-notifications.md
line: N/A
created: 2026-03-04
---

# Push subscription send missing timeout

## Description
Push subscription send missing timeout.

## Proposed Fix
Add 5s per-subscription timeout.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
