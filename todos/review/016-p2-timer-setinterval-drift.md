---
id: REV-016
severity: P2
agent: performance-oracle
status: done
file: docs/prds/workout-timer-modes.md
line: N/A
created: 2026-03-04
---

# setInterval drift over long timer durations

## Description
Over 30-min AMRAP, setInterval drifts 5-10s.

## Proposed Fix
Specify wall-clock tracking with performance.now() not interval counting.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
