---
id: REV-012
severity: P2
agent: code-simplicity-reviewer
status: done
file: docs/prds/rest-day-intelligence.md
line: N/A
created: 2026-03-04
---

# Whoop dependency path ambiguous

## Description
Whoop marked "Should Have" but recovery flow changes fundamentally if connected.

## Proposed Fix
Make self-assessment primary, Whoop as overlay only.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
