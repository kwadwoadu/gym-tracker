---
id: REV-003
severity: P1
agent: code-simplicity-reviewer
status: done
file: docs/prds/ai-personal-trainer.md
line: N/A
created: 2026-03-04
---

# AI Personal Trainer PRD massively over-scoped

## Description
Combines 5 subsystems into one PRD (chat, adaptive periodization, predictive analytics, injury risk, Whoop).

## Proposed Fix
Split into 4 PRDs: (1) Chat trainer P2, (2) Adaptive periodization P3, (3) Predictive analytics P3, (4) Whoop integration P3.

## Context
Found during review of SetFlow 10x PRD commit 7e3459c.
