---
id: REV-021
severity: P2
agent: agent-native-reviewer
status: done
file: docs/prds/ai-workout-copilot.md
line: N/A
created: 2026-03-04
---

# Plateau detection numerical criteria missing

## Description
"2+ weeks stall" not operationalized.

## Proposed Fix
Define: stall = same weight x reps for 2+ sessions, volume +/-10%.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
