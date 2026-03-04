---
id: REV-013
severity: P2
agent: code-simplicity-reviewer
status: done
file: docs/prds/smart-notifications.md
line: N/A
created: 2026-03-04
---

# Email digest duplicates push notification feature

## Description
Same weekly digest as push and email adds complexity.

## Proposed Fix
Move email to "Should Have", implement push first.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
